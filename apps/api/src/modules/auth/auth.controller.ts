import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  AuthSessionResponse,
  MeResponse,
  RefreshResponse,
} from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentJwtPayload } from '../../common/decorators/current-jwt-payload.decorator';
import type { AuthUser, JwtPayload } from '../../common/types/auth';
import { UsersService } from '../users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register user baru',
    description:
      'Membuat user, personal workspace, dan membership owner — semua dalam 1 transaksi.',
  })
  @ApiResponse({
    status: 201,
    description: 'User & workspace berhasil dibuat',
    type: AuthSessionResponse,
  })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @ApiResponse({ status: 409, description: 'Email sudah terdaftar' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login dengan email & password' })
  @ApiResponse({ status: 200, description: 'Login berhasil — dapat access & refresh token', type: AuthSessionResponse })
  @ApiResponse({ status: 401, description: 'Email atau password salah' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tukar refresh token dengan access token baru',
    description:
      'Body berisi `refreshToken`. Tidak butuh Authorization header.',
  })
  @ApiResponse({ status: 200, type: RefreshResponse })
  @ApiResponse({ status: 401, description: 'Refresh token invalid/expired' })
  refresh(@Body() _dto: RefreshDto, @CurrentJwtPayload() payload: JwtPayload) {
    return this.authService.refresh(payload);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request reset password link',
    description:
      'Kirim request reset password. Token akan dikirim ke email (atau return di dev mode)',
  })
  @ApiResponse({ status: 200, description: 'Request berhasil diproses' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password dengan token',
    description: 'Reset password menggunakan token dari email',
  })
  @ApiResponse({ status: 200, description: 'Password berhasil direset' })
  @ApiResponse({ status: 400, description: 'Token tidak valid atau expired' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ganti password (user yang sedang login)' })
  @ApiResponse({ status: 200, description: 'Password berhasil diubah' })
  @ApiResponse({ status: 400, description: 'Password saat ini salah' })
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Profil user yang sedang login' })
  @ApiResponse({ status: 200, type: MeResponse })
  @ApiResponse({ status: 401, description: 'Tidak ada / invalid token' })
  async me(@CurrentUser() user: AuthUser) {
    const dbUser = await this.usersService.findByIdOrThrow(user.id);
    return {
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        gender: dbUser.gender,
        createdAt: dbUser.createdAt,
      },
    };
  }
}
