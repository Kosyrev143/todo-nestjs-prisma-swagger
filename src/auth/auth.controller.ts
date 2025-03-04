import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetCurrentUser, GetCurrentUserId, Public } from '../common/decorators';
import { AuthDto } from './dto';
import { Tokens } from './types';
import { RtGuard } from '../common/guards/rt.guard';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Sign Up in system' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'Registration on system and issuance access and refresh tokens',
  })
  @ApiBody({ type: AuthDto })
  signupLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }

  @Public()
  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign In in system' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Issuance access and refresh tokens',
  })
  @ApiBody({ type: AuthDto })
  signinLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signinLocal(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout system' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Deleting access and refresh tokens',
  })
  logout(@GetCurrentUserId() userId: number): Promise<boolean> {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reissue access and refresh tokens',
  })
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
