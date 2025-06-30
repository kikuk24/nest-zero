    import { Injectable } from '@nestjs/common';
    import * as bcrypt from 'bcrypt';
    import { User } from 'generated/prisma';
    import { PrismaService } from 'src/common/prisma.service';

    @Injectable()
    export class TestService {
        constructor(private prismaService: PrismaService) { }

        async deleteAll() {
            await this.deleteUser();
        }

        async deleteUser() {
            await this.prismaService.user.deleteMany({
                where: {
                    email: 'test@example.com',
                },
            });
        }

        async getUser(): Promise<User | null> {
            return this.prismaService.user.findUnique({
                where: {
                    email: 'test@example.com',
                },
            });
        }

        async createUser() {
            await this.prismaService.user.create({
                data: {
                    email: 'test@example.com',
                    password: await bcrypt.hash('password123', 10),
                    name: 'Test User',
                    provider: 'LOCAL',   // pakai string kalau enum, atau AuthProvider.LOCAL kalau enum diimport
                    role: 'USER',
                    isActive: true,
                },
            });
        }
    }
