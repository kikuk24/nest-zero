import {
    Injectable,
    HttpException,
    Inject,
    UnauthorizedException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { LoginRequest, LoginResponse, MeResponse } from 'src/model/auth.model';
import { AuthValidation } from './auth.validation';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly validationService: ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,

    ) { }

    async login(request: LoginRequest): Promise<LoginResponse> {
        this.logger.info(`User login attempt with email: ${request.email}`);

        const loginRequest = this.validationService.validate(
            AuthValidation.LOGIN,
            request,
        );

        const user = await this.prismaService.user.findUnique({
            where: { email: loginRequest.email },
        });

        if (!user || !(await bcrypt.compare(loginRequest.password, user.password))) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const payload = { userId: user.id, email: user.email, role: user.role };

        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
        });
        this.logger.info(`User ${user.email} logged in successfully`);

        await this.prismaService.user.update({
            where: { id: user.id },
            data: { refreshToken: refreshToken },
        });
        this.logger.info(`Refresh token stored for user ${user.email}`);


        return new LoginResponse({ accessToken, refreshToken });
    }

    async refreshToken(oldRefreshToken: string): Promise<LoginResponse> {
        try {
            const payload = await this.jwtService.verifyAsync(oldRefreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            const user = await this.prismaService.user.findUnique({
                where: { id: payload.userId },
            });
            if (!user) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            if (user.refreshToken !== oldRefreshToken) {
                this.logger.warn(`Refresh token mismatch for user ${user.email}`);
                throw new UnauthorizedException('Refresh token mismatch');
            }

            const newAccessToken = await this.jwtService.signAsync(
                { userId: user.id, email: user.email, role: user.role },
                { expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') },
            );

            const newRefreshToken = await this.jwtService.signAsync(
                { userId: user.id, email: user.email, role: user.role },
                {
                    secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                    expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
                },
            );


            await this.prismaService.user.update({
                where: { id: user.id },
                data: { refreshToken: newRefreshToken },
            });

            this.logger.info(`New tokens generated for user ${user.email}`);

            return new LoginResponse({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });
        } catch (error) {
            this.logger.error(`Error refreshing token: ${error.message}`);
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(userId: number): Promise<void> {
        this.logger.info(`User logout attempt for userId: ${userId}`);

        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        await this.prismaService.user.update({
            where: { id: user.id },
            data: { refreshToken: null },
        });

        this.logger.info(`User ${user.email} logged out successfully`);
        return;
    }

    async getMe(userId: number): Promise<MeResponse> {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                role: true,
                provider: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return new MeResponse({
            ...user,
            name: user.name ?? undefined,
            avatarUrl: user.avatarUrl ?? undefined,
        });
    }
}
