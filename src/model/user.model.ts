export class RegisterUserRequest {
    email: string;
    password: string;
    name?: string;
    provider?: string; // enum: LOCAL, GOOGLE, FACEBOOK, GITHUB
    avatarUrl?: string;
    isActive?: boolean;
}

export class UserResponse {
    id: number;
    email: string;
    name?: string;
    avatarUrl?: string;
    provider: string; // enum: LOCAL, GOOGLE, FACEBOOK, GITHUB
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<UserResponse>) {
        Object.assign(this, partial);
    }
}
