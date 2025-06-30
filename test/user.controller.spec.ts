import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/user/user.service';
import { RegisterUserRequest, UserResponse } from 'src/model/user.model';
import { AuthProvider } from 'generated/prisma';
import { UserController } from 'src/user/user.controller';

describe('UserController - register', () => {
    let controller: UserController;
    let service: UserService;

    const mockUserService = {
        registerUser: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        controller = module.get(UserController);
        service = module.get(UserService);
    });

    it('should register user and return response', async () => {
        const request: RegisterUserRequest = {
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            name: 'Test User',
            provider: AuthProvider.LOCAL,
            isActive: true,
        };

        const mockResponse = new UserResponse({
            id: 123,
            email: request.email,
            name: request.name,
            avatarUrl: undefined,
            provider: request.provider,
            isActive: request.isActive,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        mockUserService.registerUser.mockResolvedValueOnce(mockResponse);

        const result = await controller.register(request);

        expect(service.registerUser).toHaveBeenCalledWith(request);
        expect(result).toEqual({
            data: mockResponse,
            message: 'User registered successfully',
        });
    });
});
