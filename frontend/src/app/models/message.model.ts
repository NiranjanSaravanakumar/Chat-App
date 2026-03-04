export interface Message {
    _id: string;
    senderId: {
        _id: string;
        username: string;
    };
    receiverId: {
        _id: string;
        username: string;
    };
    message: string;
    createdAt: string;
}

export interface SendMessagePayload {
    senderId: string;
    receiverId: string;
    message: string;
}
