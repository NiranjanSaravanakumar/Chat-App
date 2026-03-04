export interface User {
    _id: string;
    username: string;
    email: string;
    isOnline: boolean;
    createdAt: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        _id: string;
        username: string;
        email: string;
        token: string;
    };
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
}
