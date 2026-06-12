import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'abc123token456',
    description: 'Token reset password yang diterima via email',
  })
  @IsString({ message: 'Token harus berupa string' })
  @IsNotEmpty({ message: 'Token wajib diisi' })
  token: string;

  @ApiProperty({
    example: 'NewSecurePassword123',
    description: 'Password baru (min. 6 karakter)',
  })
  @IsString({ message: 'Password harus berupa string' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  @IsNotEmpty({ message: 'Password wajib diisi' })
  newPassword: string;
}
