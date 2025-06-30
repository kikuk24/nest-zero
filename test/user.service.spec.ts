import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/user/user.service';
import { ValidationService } from 'src/common/validation.service';
import { PrismaService } from 'src/common/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AuthProvider } from 'generated/prisma';

// Define Role enum for testing purposes
enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
}
import * as bcrypt from 'bcrypt';

const mockLogger: Logger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
} as unknown as Logger;

describe('UserService - registerUser', () => {
    let service: UserService;
    let prisma: PrismaService;
    let validationService: ValidationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: ValidationService,
                    useValue: {
                        validate: jest.fn().mockImplementation((_schema, data) => data),
                    },
                },
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            count: jest.fn().mockResolvedValue(0),
                            create: jest.fn().mockImplementation(({ data }) => ({
                                ...data,
                                id: 'user-id-123',
                                createdAt: new Date(),
                                updatedAt: new Date(),
                                role: Role.USER,
                            })),
                        },
                    },
                },
                {
                    provide: WINSTON_MODULE_PROVIDER,
                    useValue: mockLogger,
                },
            ],
        }).compile();

        service = module.get(UserService);
        prisma = module.get(PrismaService);
        validationService = module.get(ValidationService);
    });

    it('should register user successfully', async () => {
        const request = {
            email: 'test@example.com',
            password: 'securePass123',
            confirmPassword: 'securePass123',
            name: 'Test User',
            avatarUrl: undefined,
            provider: AuthProvider.LOCAL,
            isActive: true,
        };

        const result = await service.registerUser(request);

        expect(validationService.validate).toHaveBeenCalled();
        expect(prisma.user.count).toHaveBeenCalledWith({ where: { email: request.email } });
        expect(prisma.user.create).toHaveBeenCalled();

        expect(result).toHaveProperty('id');
        expect(result.email).toBe(request.email);
        expect(result.name).toBe(request.name);
        expect(result.provider).toBe(request.provider);
        expect(result.isActive).toBe(true);
    });

    it('should throw error if email already exists', async () => {
        jest.spyOn(prisma.user, 'count').mockResolvedValueOnce(1); // simulate existing email

        const request = {
            email: 'duplicate@example.com',
            password: 'securePass123',
            confirmPassword: 'securePass123',
            name: 'Dup User',
            avatarUrl: undefined,
            provider: AuthProvider.LOCAL,
        };

        await expect(service.registerUser(request)).rejects.toThrow(
            `User with email ${request.email} already exists`,
        );
    });

    it('should hash password correctly', async () => {
        const hashSpy = jest.spyOn(bcrypt, 'hash');
        const request = {
            email: 'hash@example.com',
            password: 'myPass123',
            confirmPassword: 'myPass123',
            name: 'Hash Test',
            avatarUrl: undefined,
            provider: AuthProvider.LOCAL,
        };

        await service.registerUser(request);

        expect(hashSpy).toHaveBeenCalledWith(request.password, 10);
    });
    it('should throw error if passwords do not match', async () => {
        const request = {
            email: 'mismatch@example.com',
            password: 'myPass123',
            confirmPassword: 'wrongPass123',
            name: 'Hash Test',
            avatarUrl: undefined,
            provider: AuthProvider.LOCAL,
        };

        await expect(service.registerUser(request)).rejects.toThrow(
            "Passwords do not match",
        );
    });
});
