import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/graphql (POST) - should return boards', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: '{ boards { id title } }',
      })
      .expect(200)
      .expect(res => {
        expect(res.body.data).toHaveProperty('boards');
        expect(Array.isArray(res.body.data.boards)).toBe(true);
      });
  });
});
