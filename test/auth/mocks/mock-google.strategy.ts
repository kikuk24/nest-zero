import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-strategy';
import { Injectable } from '@nestjs/common';
import { OAuthProfile } from 'src/model/oauth-profile.model';
import { AuthProvider } from 'generated/prisma';

@Injectable()
export class MockGoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super();
    }

    authenticate() {
        const profile = new OAuthProfile({
            email: 'mock@google.com',
            name: 'Mock User',
            avatarUrl: 'https://example.com/avatar.jpg',
            provider: AuthProvider.GOOGLE,
        });

        (this as any).success(profile);
    }
}
