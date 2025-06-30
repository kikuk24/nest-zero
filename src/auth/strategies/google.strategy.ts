import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthProvider } from 'generated/prisma';
import { OAuthProfile } from 'src/model/oauth-profile.model';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly configService: ConfigService) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any) {
        const { name, emails, photos } = profile;
        return new OAuthProfile({
            email: emails[0].value,
            name: name.givenName + ' ' + name.familyName,
            avatarUrl: photos?.[0]?.value,
            provider: AuthProvider.GOOGLE,
        });
    }
}
