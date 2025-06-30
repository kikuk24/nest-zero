// src/model/auth.model.ts

export class LoginRequest {
    email: string;
    password: string;
}

export class LoginResponse {
    accessToken: string;
    refreshToken: string;

    constructor(partial: Partial<LoginResponse>) {
        Object.assign(this, partial);
    }
}

export class MeResponse {
    id: number;
    email: string;
    name?: string;
    avatarUrl?: string;
    role: string;
    provider: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<MeResponse>) {
        Object.assign(this, partial);
    }
}
