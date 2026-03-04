import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { SocketService } from '../../services/socket.service';
import { User } from '../../models/user.model';
import { Message } from '../../models/message.model';

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './chat.component.html',
    styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
    @ViewChild('messagesContainer') messagesContainer!: ElementRef;

    currentUser: User | null = null;
    users: User[] = [];
    selectedUser: User | null = null;
    messages: Message[] = [];
    newMessage = '';
    onlineUserIds: string[] = [];
    typingUserId: string | null = null;
    showSidebar = true;

    private subscriptions: Subscription[] = [];
    private typingTimeout: any;
    private shouldScrollToBottom = false;

    constructor(
        private authService: AuthService,
        private chatService: ChatService,
        private socketService: SocketService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        if (!this.currentUser) {
            this.router.navigate(['/login']);
            return;
        }

        // Connect to Socket.IO
        this.socketService.connect();
        this.socketService.emitUserOnline(this.currentUser._id);

        // Load user list
        this.loadUsers();

        // Listen for socket events
        this.setupSocketListeners();
    }

    ngAfterViewChecked(): void {
        if (this.shouldScrollToBottom) {
            this.scrollToBottom();
            this.shouldScrollToBottom = false;
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.socketService.disconnect();
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
    }

    loadUsers(): void {
        this.chatService.getUsers().subscribe({
            next: (res) => {
                if (res.success) {
                    this.users = res.data;
                }
            },
            error: (err) => {
                console.error('Error loading users:', err);
            },
        });
    }

    selectUser(user: User): void {
        this.selectedUser = user;
        this.messages = [];
        this.typingUserId = null;
        this.showSidebar = false;

        // Load chat history
        this.chatService.getChatHistory(user._id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.messages = res.data;
                    this.shouldScrollToBottom = true;
                }
            },
            error: (err) => {
                console.error('Error loading chat history:', err);
            },
        });
    }

    sendMessage(): void {
        if (!this.newMessage.trim() || !this.selectedUser || !this.currentUser) return;

        this.socketService.sendMessage({
            senderId: this.currentUser._id,
            receiverId: this.selectedUser._id,
            message: this.newMessage.trim(),
        });

        // Stop typing indicator
        this.socketService.emitStopTyping(this.currentUser._id, this.selectedUser._id);

        this.newMessage = '';
    }

    onTyping(): void {
        if (!this.selectedUser || !this.currentUser) return;

        this.socketService.emitTyping(this.currentUser._id, this.selectedUser._id);

        // Clear existing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        // Stop typing after 2 seconds of inactivity
        this.typingTimeout = setTimeout(() => {
            if (this.selectedUser && this.currentUser) {
                this.socketService.emitStopTyping(this.currentUser._id, this.selectedUser._id);
            }
        }, 2000);
    }

    isOnline(userId: string): boolean {
        return this.onlineUserIds.includes(userId);
    }

    isMyMessage(message: Message): boolean {
        return message.senderId._id === this.currentUser?._id;
    }

    toggleSidebar(): void {
        this.showSidebar = !this.showSidebar;
    }

    logout(): void {
        this.socketService.disconnect();
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    getInitial(username: string): string {
        return username ? username.charAt(0).toUpperCase() : '?';
    }

    private setupSocketListeners(): void {
        // Listen for incoming messages
        const msgSub = this.socketService.onReceiveMessage().subscribe((message) => {
            if (
                this.selectedUser &&
                message.senderId._id === this.selectedUser._id
            ) {
                this.messages.push(message);
                this.shouldScrollToBottom = true;
            }
        });
        this.subscriptions.push(msgSub);

        // Listen for sent message confirmation
        const sentSub = this.socketService.onMessageSent().subscribe((message) => {
            if (this.selectedUser) {
                this.messages.push(message);
                this.shouldScrollToBottom = true;
            }
        });
        this.subscriptions.push(sentSub);

        // Listen for online users
        const onlineSub = this.socketService.onOnlineUsers().subscribe((userIds) => {
            this.onlineUserIds = userIds;
        });
        this.subscriptions.push(onlineSub);

        // Listen for typing
        const typingSub = this.socketService.onUserTyping().subscribe((data) => {
            if (this.selectedUser && data.senderId === this.selectedUser._id) {
                this.typingUserId = data.senderId;
            }
        });
        this.subscriptions.push(typingSub);

        // Listen for stop typing
        const stopTypingSub = this.socketService.onUserStopTyping().subscribe((data) => {
            if (this.typingUserId === data.senderId) {
                this.typingUserId = null;
            }
        });
        this.subscriptions.push(stopTypingSub);
    }

    private scrollToBottom(): void {
        try {
            if (this.messagesContainer) {
                this.messagesContainer.nativeElement.scrollTop =
                    this.messagesContainer.nativeElement.scrollHeight;
            }
        } catch (err) { }
    }
}
