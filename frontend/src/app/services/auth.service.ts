import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
    AuthResponse,
    LoginPayload,
    RegisterPayload,
    User,
} from '../models/user.model';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly API_URL = 'http://10.171.196.10:5000/api/auth';
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage(): void {
        const userData = localStorage.getItem('chat_user');
        if (userData) {
            this.currentUserSubject.next(JSON.parse(userData));
        }
    }

    register(payload: RegisterPayload): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API_URL}/register`, payload).pipe(
            tap((res) => {
                if (res.success) {
                    this.storeSession(res.data);
                }
            })
        );
    }

    login(payload: LoginPayload): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API_URL}/login`, payload).pipe(
            tap((res) => {
                if (res.success) {
                    this.storeSession(res.data);
                }
            })
        );
    }

    private storeSession(data: AuthResponse['data']): void {
        localStorage.setItem('chat_token', data.token);
        const user: User = {
            _id: data._id,
            username: data.username,
            email: data.email,
            isOnline: true,
            createdAt: '',
        };
        localStorage.setItem('chat_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
    }

    logout(): void {
        localStorage.removeItem('chat_token');
        localStorage.removeItem('chat_user');
        this.currentUserSubject.next(null);
    }

    getToken(): string | null {
        return localStorage.getItem('chat_token');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }
}
