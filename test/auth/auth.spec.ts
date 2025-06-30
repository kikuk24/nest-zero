import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/common/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();
    });

    beforeEach(async () => {
        await prisma.user.deleteMany();
        await prisma.user.create({
            data: {
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                role: 'USER',
                provider: 'LOCAL',
                isActive: true,
            },
        });
    });

    afterAll(async () => {
        await prisma.user.deleteMany();
        await app.close();
    });

    it('should login and return JWT tokens', async () => {
        const res = await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            })
            .expect(200);

        expect(res.body.data.accessToken).toBeDefined();
        expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
        const res = await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'wrongpassword',
            })
            .expect(401);

        expect(res.body.message).toContain('Invalid email or password');
    });
    it('should refresh tokens', async () => {
        // Step 1: Login terlebih dahulu
        const loginResponse = await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            })
            .expect(200);

        const refreshToken = loginResponse.body?.data?.refreshToken;
        expect(refreshToken).toBeDefined();

        // Step 2: Kirim refreshToken ke endpoint /api/auth/refresh
        const refreshResponse = await request(app.getHttpServer())
            .post('/api/auth/refresh')
            .send({ refreshToken })
            .expect(200);

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.body?.data;

        // Step 3: Validasi token baru ada
        expect(accessToken).toBeDefined();
        expect(newRefreshToken).toBeDefined();
    });
    it('should fail to refresh tokens with invalid refreshToken', async () => {
        const res = await request(app.getHttpServer())
            .post('/api/auth/refresh')
            .send({ refreshToken: 'invalid-token' })
            .expect(401);

        expect(res.body.message).toContain('Invalid refresh token');
    });
    it('should logout user and clear refresh token', async () => {
        // 1. Login terlebih dahulu
        const loginRes = await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            })
            .expect(200);

        const accessToken = loginRes.body.data.accessToken;

        // 2. Logout dengan access token
        await request(app.getHttpServer())
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)
            .expect(res => {
                expect(res.body.message).toBe('Logout successful');
            });

        // 3. Coba refresh pakai refreshToken yang lama, harus gagal
        const refreshToken = loginRes.body.data.refreshToken;

        await request(app.getHttpServer())
            .post('/api/auth/refresh')
            .send({ refreshToken })
            .expect(401); // Karena refreshToken sudah dihapus/null
    });
    it('should reject logout without token', async () => {
        await request(app.getHttpServer())
            .post('/api/auth/logout')
            .expect(401);
    });
    it('should return user profile on /api/auth/me', async () => {

        const loginRes = await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'password123' });

        const accessToken = loginRes.body.data.accessToken;

        const meRes = await request(app.getHttpServer())
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(meRes.body.data).toHaveProperty('email', 'test@example.com');
        expect(meRes.body.data).toHaveProperty('id');
    });
});