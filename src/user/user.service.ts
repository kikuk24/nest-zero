import { HttpException, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { PrismaService } from "src/common/prisma.service";
import { ValidationService } from "src/common/validation.service";
import { RegisterUserRequest, UserResponse } from "src/model/user.model";
import { Logger } from "winston";
import { UserValidation } from "./user.validation";
import * as bcrypt from "bcrypt";
import { AuthProvider } from "generated/prisma";

@Injectable()
export class UserService {
    constructor(
        private readonly validationService: ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly prismaService: PrismaService,
    ) { }

    async registerUser(request: RegisterUserRequest): Promise<UserResponse> {
        this.logger.info(`Registering new user ${JSON.stringify(request)}`);

        const registerRequest: RegisterUserRequest = this.validationService.validate(
            UserValidation.REGISTER,
            request,
        );

        const existingCount = await this.prismaService.user.count({
            where: { email: registerRequest.email },
        });

        if (existingCount !== 0) {
            throw new HttpException(
                `User with email ${registerRequest.email} already exists`,
                400,
            );
        }
        if (registerRequest.password !== registerRequest.confirmPassword) {
            throw new HttpException("Passwords do not match", 400);
        }

        const hashedPassword = await bcrypt.hash(registerRequest.password, 10);

        const user = await this.prismaService.user.create({
            data: {
                email: registerRequest.email,
                password: hashedPassword,
                name: registerRequest.name,
                avatarUrl: registerRequest.avatarUrl,
                provider: registerRequest.provider
                    ? (registerRequest.provider as AuthProvider)
                    : AuthProvider.LOCAL,
                isActive: registerRequest.isActive ?? true,
            },
        });

        return new UserResponse({
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
            avatarUrl: user.avatarUrl ?? undefined,
            provider: user.provider,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    }
}