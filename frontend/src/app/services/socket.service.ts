import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { Message, SendMessagePayload } from '../models/message.model';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private socket!: Socket;
    private readonly SERVER_URL = 'http://localhost:5000';

    connect(): void {
        this.socket = io(this.SERVER_URL);
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    // Emit: Tell the server this user is online
    emitUserOnline(userId: string): void {
        this.socket.emit('user-online', userId);
    }

    // Emit: Send a message
    sendMessage(payload: SendMessagePayload): void {
        this.socket.emit('send-message', payload);
    }

    // Emit: Typing indicator
    emitTyping(senderId: string, receiverId: string): void {
        this.socket.emit('typing', { senderId, receiverId });
    }

    // Emit: Stop typing
    emitStopTyping(senderId: string, receiverId: string): void {
        this.socket.emit('stop-typing', { senderId, receiverId });
    }

    // Listen: Receive new message
    onReceiveMessage(): Observable<Message> {
        return new Observable((observer) => {
            this.socket.on('receive-message', (message: Message) => {
                observer.next(message);
            });
        });
    }

    // Listen: Message sent confirmation
    onMessageSent(): Observable<Message> {
        return new Observable((observer) => {
            this.socket.on('message-sent', (message: Message) => {
                observer.next(message);
            });
        });
    }

    // Listen: Online users list update
    onOnlineUsers(): Observable<string[]> {
        return new Observable((observer) => {
            this.socket.on('online-users', (userIds: string[]) => {
                observer.next(userIds);
            });
        });
    }

    // Listen: User typing
    onUserTyping(): Observable<{ senderId: string }> {
        return new Observable((observer) => {
            this.socket.on('user-typing', (data: { senderId: string }) => {
                observer.next(data);
            });
        });
    }

    // Listen: User stopped typing
    onUserStopTyping(): Observable<{ senderId: string }> {
        return new Observable((observer) => {
            this.socket.on('user-stop-typing', (data: { senderId: string }) => {
                observer.next(data);
            });
        });
    }
}
