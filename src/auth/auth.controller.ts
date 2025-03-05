import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { Tokens } from './types';
import { AtGuard, RtGuard } from '../common/guards';
import { AuthDto } from './dto';
import { GetCurrentUser, GetCurrentUserId, Public } from '../common/decorators';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Sign Up in system' })
  @ApiCreatedResponse()
  @ApiBody({ type: AuthDto })
  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  signupLocal(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Tokens> {
    return this.authService.signupLocal(dto, response);
  }

  @Public()
  @ApiOperation({ summary: 'Sign In in system' })
  @ApiOkResponse()
  @ApiBody({ type: AuthDto })
  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Tokens> {
    return this.authService.signinLocal(dto, response);
  }

  @ApiOperation({ summary: 'Logout system' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Deleting access and refresh tokens',
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @GetCurrentUserId() userId: number,
    @Res({ passthrough: true }) response: Response,
  ): Promise<boolean> {
    return this.authService.logout(userId, response);
  }

  @Public()
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiOkResponse()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken, response);
  }
}
