import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { TestService } from './test.service';
import { PrismaService } from 'src/common/prima.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [TestService, PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testService = moduleFixture.get<TestService>(TestService);
    await testService.deleteAll();
  });

  describe('POST /api/user/register', () => {
    it('should register a user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/user/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          provider: 'LOCAL',
          isActive: true,
        })
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe('test@example.com');

      const user = await testService.getUser();
      expect(user).not.toBeNull();
    });

    it('should fail if email already exists', async () => {
      // Buat user dummy terlebih dulu
      await testService.createUser();

      const response = await request(app.getHttpServer())
        .post('/api/user/register')
        .send({
          email: 'test@example.com', // email sama dengan user dummy
          password: 'password123',
          name: 'Test User Duplicate',
          provider: 'LOCAL',
          isActive: true,
        })
        .expect(400); // harus balas bad request

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/already exists/i);
    });
  });

  afterEach(async () => {
    await testService.deleteAll();
    await app.close();
  });
});
