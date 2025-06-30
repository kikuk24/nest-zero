import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { LoginRequest } from 'src/model/auth.model';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
    let authService: AuthService;

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    };

    const mockJwtService = {
        signAsync: jest.fn<Promise<string>, [any, any?]>(),
        verifyAsync: jest.fn<Promise<any>, [string, any?]>(),
    };

    const mockValidationService = {
        validate: jest.fn(),
    };

    const mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'JWT_SECRET') return 'jwt-secret';
            if (key === 'JWT_EXPIRES_IN') return '15m';
            if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
            if (key === 'JWT_REFRESH_SECRET') return 'jwt-refresh-secret';
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: ValidationService, useValue: mockValidationService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: WINSTON_MODULE_PROVIDER, useValue: mockLogger },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should login successfully', async () => {
            const request: LoginRequest = {
                email: 'user@example.com',
                password: 'password123',
            };

            const mockUser = {
                id: 1,
                email: 'user@example.com',
                password: await bcrypt.hash('password123', 10),
                role: 'USER',
            };

            mockValidationService.validate.mockReturnValue(request);
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            jest.mock('bcrypt', () => ({
                compare: jest.fn().mockResolvedValue(true),
                hash: jest.fn().mockResolvedValue('hashed-password'),
            }));

            mockJwtService.signAsync.mockResolvedValue('token');

            const result = await authService.login(request);

            expect(result.accessToken).toBe('token');
            expect(result.refreshToken).toBe('token');
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockValidationService.validate.mockReturnValue({ email: 'notfound@example.com', password: '123456' });
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(authService.login({ email: 'notfound@example.com', password: '123456' }))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe('refreshToken', () => {
        it('should return new tokens if valid refreshToken', async () => {
            const token = 'valid-refresh-token';
            const mockPayload = { userId: 1 };
            const mockUser = {
                id: 1,
                email: 'user@example.com',
                role: 'USER',
                refreshToken: token,
            };

            mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockJwtService.signAsync.mockResolvedValue('new-token');
            mockPrismaService.user.update.mockResolvedValue({});

            const result = await authService.refreshToken(token);

            expect(result.accessToken).toBe('new-token');
            expect(result.refreshToken).toBe('new-token');
        });

        it('should throw if user not found or token mismatch', async () => {
            mockJwtService.verifyAsync.mockResolvedValue({ userId: 1 });
            mockPrismaService.user.findUnique.mockResolvedValue({
                id: 1,
                refreshToken: 'different-token',
            });

            await expect(authService.refreshToken('invalid-token'))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should throw if token verification fails', async () => {
            mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid'));

            await expect(authService.refreshToken('corrupt-token'))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should return user profile on getMe', async () => {
            const userId = 1;
            const mockUser = {
                id: userId,
                email: 'user@example.com',
                role: 'USER',
                name: 'John Doe',
                avatarUrl: 'https://example.com/avatar.jpg',
            };

            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await authService.getMe(userId);

            expect(result).toEqual({
                id: userId,
                email: 'user@example.com',
                role: 'USER',
                name: 'John Doe',
                avatarUrl: 'https://example.com/avatar.jpg',
            });
        });
    }); 
});
