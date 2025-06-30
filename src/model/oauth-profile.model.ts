import { AuthProvider } from "generated/prisma";

export class OAuthProfile {
    email: string;
    name: string;
    avatarUrl?: string;
    provider: AuthProvider;

    constructor(data: {
        email: string;
        name: string;
        avatarUrl?: string;
        provider: AuthProvider;
    }) {
        this.email = data.email;
        this.name = data.name;
        this.avatarUrl = data.avatarUrl;
        this.provider = data.provider;
    }
}
