import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { decode } from 'jsonwebtoken';
import { Response } from 'express';

import { PrismaService } from '../../../prisma/prisma.service';
import { AuthService } from '../../auth.service';
import { AppModule } from '../../../app.module';
import { Tokens } from '../../types';

const user = {
  email: 'test@gmail.com',
  password: 'super',
};

describe('Auth Flow', () => {
  let prisma: PrismaService;
  let authService: AuthService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    authService = moduleRef.get(AuthService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  describe('signup', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should signup', async () => {
      const response: Response = {} as Response;
      const cookieMock = jest.fn();
      response.cookie = cookieMock;
      const tokens = await authService.signupLocal(
        {
          email: user.email,
          password: user.password,
        },
        response,
      );
      expect(tokens.access_token).toBeTruthy();
      expect(tokens.refresh_token).toBeTruthy();
    });

    it('should throw on duplicate user signup', async () => {
      let tokens: Tokens | undefined;
      const response: Response = {} as Response;
      const cookieMock = jest.fn();
      response.cookie = cookieMock;
      try {
        tokens = await authService.signupLocal(
          {
            email: user.email,
            password: user.password,
          },
          response,
        );
      } catch (error) {
        expect(error.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });
  });

  describe('signin', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });
    it('should throw if no existing user', async () => {
      let tokens: Tokens | undefined;
      const response: Response = {} as Response;
      const cookieMock = jest.fn();
      response.cookie = cookieMock;
      try {
        tokens = await authService.signinLocal(
          {
            email: user.email,
            password: user.password,
          },
          response,
        );
      } catch (error) {
        expect(error.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });

    it('should login', async () => {
      const response: Response = {} as Response;
      const cookieMock = jest.fn();
      response.cookie = cookieMock;
      await authService.signupLocal(
        {
          email: user.email,
          password: user.password,
        },
        response,
      );

      const tokens = await authService.signinLocal(
        {
          email: user.email,
          password: user.password,
        },
        response,
      );

      expect(tokens.access_token).toBeTruthy();
      expect(tokens.refresh_token).toBeTruthy();
    });

    it('should throw if password incorrect', async () => {
      let tokens: Tokens | undefined;

      try {
        const response: Response = {} as Response;
        const cookieMock = jest.fn();
        response.cookie = cookieMock;
        tokens = await authService.signinLocal(
          {
            email: user.email,
            password: user.password + 'a',
          },
          response,
        );
      } catch (error) {
        expect(error.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });
  });

  describe('logout', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should pass if call to non existent user', async () => {
      const response: Response = {} as Response;
      const cookieMock = jest.fn();
      response.cookie = cookieMock;
      const result = await authService.logout(4, response);
      expect(result).toBeDefined();
    });

    it('should logout', async () => {
      const response: Response = {} as Response;
      const cookieMock = jest.fn();
      response.cookie = cookieMock;
      await authService.signupLocal(
        {
          email: user.email,
          password: user.password,
        },
        response,
      );

      let userFromDb: User | null;

      userFromDb = await prisma.user.findFirst({
        where: { email: user.email },
      });
      expect(userFromDb?.hashedRt).toBeTruthy();

      // logout
      await authService.logout(userFromDb?.id, response);

      userFromDb = await prisma.user.findFirst({
        where: { email: user.email },
      });

      expect(userFromDb?.hashedRt).toBeFalsy();
    });
  });

  describe('refresh', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should throw if no existing user', async () => {
      let tokens: Tokens | undefined;
      const response: Response = {} as Response;
      const cookieMock = jest.fn();
      response.cookie = cookieMock;
      try {
        tokens = await authService.refreshTokens(1, '', response);
      } catch (error) {
        expect(error.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });

    it('should throw if refresh token incorrect', async () => {
      await prisma.cleanDatabase();

      const response: Response = {} as Response;
      const cookieMock = jest.fn();
      response.cookie = cookieMock;

      const _tokens = await authService.signupLocal(
        {
          email: user.email,
          password: user.password,
        },
        response,
      );

      const rt = _tokens.refresh_token;

      const decoded = decode(rt);
      const userId = Number(decoded?.sub);

      let tokens: Tokens | undefined;
      try {
        tokens = await authService.refreshTokens(userId, rt + 'a', response);
      } catch (error) {
        expect(error.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });

    it('should refresh tokens', async () => {
      await prisma.cleanDatabase();
      const response: Response = {} as Response;
      const cookieMock = jest.fn();
      response.cookie = cookieMock;

      const _tokens = await authService.signupLocal(
        {
          email: user.email,
          password: user.password,
        },
        response,
      );

      const rt = _tokens.refresh_token;
      const at = _tokens.access_token;

      const decoded = decode(rt);
      const userId = Number(decoded?.sub);

      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      });

      const tokens = await authService.refreshTokens(userId, rt, response);
      expect(tokens).toBeDefined();

      expect(tokens.access_token).not.toBe(at);
      expect(tokens.refresh_token).not.toBe(rt);
    });
  });
});
