import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123', description: 'Password saat ini' })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'NewSecurePass456',
    description: 'Password baru (min. 6 karakter)',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  newPassword: string;
}
