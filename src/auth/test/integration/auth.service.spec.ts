import { PrismaService } from '../../../prisma/prisma.service';
import { AuthService } from '../../auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { Tokens } from '../../types';
import { User } from '@prisma/client';
import { decode } from 'jsonwebtoken';

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
      const tokens = await authService.signupLocal({
        email: user.email,
        password: user.password,
      });
      expect(tokens.access_token).toBeTruthy();
      expect(tokens.refresh_token).toBeTruthy();
    });

    it('should throw on duplicate user signup', async () => {
      let tokens: Tokens | undefined;
      try {
        tokens = await authService.signupLocal({
          email: user.email,
          password: user.password,
        });
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
      try {
        tokens = await authService.signinLocal({
          email: user.email,
          password: user.password,
        });
      } catch (error) {
        expect(error.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });

    it('should login', async () => {
      await authService.signupLocal({
        email: user.email,
        password: user.password,
      });

      const tokens = await authService.signinLocal({
        email: user.email,
        password: user.password,
      });

      expect(tokens.access_token).toBeTruthy();
      expect(tokens.refresh_token).toBeTruthy();
    });

    it('should throw if password incorrect', async () => {
      let tokens: Tokens | undefined;

      try {
        tokens = await authService.signinLocal({
          email: user.email,
          password: user.password + 'a',
        });
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
      const result = await authService.logout(4);
      expect(result).toBeDefined();
    });

    it('should logout', async () => {
      await authService.signupLocal({
        email: user.email,
        password: user.password,
      });

      let userFromDb: User | null;

      userFromDb = await prisma.user.findFirst({
        where: { email: user.email },
      });
      expect(userFromDb?.hashedRt).toBeTruthy();

      // logout
      await authService.logout(userFromDb!.id);

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
      try {
        tokens = await authService.refreshTokens(1, '');
      } catch (error) {
        expect(error.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });

    it('should throw if refresh token incorrect', async () => {
      await prisma.cleanDatabase();

      const _tokens = await authService.signupLocal({
        email: user.email,
        password: user.password,
      });
      console.log({
        _tokens,
      });

      const rt = _tokens.refresh_token;

      const decoded = decode(rt);
      const userId = Number(decoded?.sub);

      let tokens: Tokens | undefined;
      try {
        tokens = await authService.refreshTokens(userId, rt + 'a');
      } catch (error) {
        expect(error.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });

    it('should refresh tokens', async () => {
      await prisma.cleanDatabase();
      // log in the user again and save rt + at
      const _tokens = await authService.signupLocal({
        email: user.email,
        password: user.password,
      });

      const rt = _tokens.refresh_token;
      const at = _tokens.access_token;

      const decoded = decode(rt);
      const userId = Number(decoded?.sub);

      // since jwt uses seconds signature we need to wait for 1 second to have new jwts
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      });

      const tokens = await authService.refreshTokens(userId, rt);
      expect(tokens).toBeDefined();

      // refreshed token should be different
      expect(tokens.access_token).not.toBe(at);
      expect(tokens.refresh_token).not.toBe(rt);
    });
  });
});
