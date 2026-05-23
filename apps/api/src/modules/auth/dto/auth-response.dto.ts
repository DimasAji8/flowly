import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class AuthUserResponse {
  @ApiProperty({ example: 'cmpgdeuuu00001s58dbnf4xmi' })
  id!: string;

  @ApiProperty({ example: 'Dimas Aji' })
  name!: string;

  @ApiProperty({ example: 'dimas@example.com' })
  email!: string;

  @ApiPropertyOptional({ enum: Gender, example: 'm' })
  gender?: Gender | null;
}

export class AuthSessionResponse {
  @ApiProperty({ type: AuthUserResponse })
  user!: AuthUserResponse;

  @ApiProperty({
    example: 'cmpgdeuuv00021s584ke7hrne',
    description: 'Workspace utama user (dipakai untuk header X-Workspace-Id)',
  })
  workspaceId!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiI...',
    description: 'Access token JWT (TTL pendek, default 15m)',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiI...',
    description: 'Refresh token JWT (TTL panjang, default 7d)',
  })
  refreshToken!: string;
}

export class RefreshResponse {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiI...' })
  accessToken!: string;
}

export class MeUserResponse extends AuthUserResponse {
  @ApiProperty({ example: '2026-05-22T03:39:15.510Z' })
  createdAt!: string;
}

export class MeResponse {
  @ApiProperty({ type: MeUserResponse })
  user!: MeUserResponse;
}
