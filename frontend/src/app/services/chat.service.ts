import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private readonly API_URL = 'http://10.171.196.10:5000/api';

    constructor(private http: HttpClient) { }

    // Get all users for chat list
    getUsers(): Observable<{ success: boolean; count: number; data: User[] }> {
        return this.http.get<{ success: boolean; count: number; data: User[] }>(
            `${this.API_URL}/users`
        );
    }

    // Get chat history with a specific user
    getChatHistory(
        userId: string
    ): Observable<{ success: boolean; count: number; data: Message[] }> {
        return this.http.get<{
            success: boolean;
            count: number;
            data: Message[];
        }>(`${this.API_URL}/messages/${userId}`);
    }
}
