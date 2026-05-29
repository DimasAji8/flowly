import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceListItemResponse {
  @ApiProperty({ example: 'cmpgdeuuv00021s584ke7hrne' })
  id!: string;

  @ApiProperty({ example: "Dimas Aji's Workspace" })
  name!: string;

  @ApiProperty({ enum: ['owner', 'member'], example: 'owner' })
  role!: 'owner' | 'member';

  @ApiProperty({ example: true })
  isOwner!: boolean;

  @ApiProperty({ example: '2026-05-22T03:39:15.512Z' })
  createdAt!: string;
}

export class CurrentWorkspaceResponse {
  @ApiProperty({ example: 'cmpgdeuuv00021s584ke7hrne' })
  id!: string;

  @ApiProperty({ example: "Dimas Aji's Workspace" })
  name!: string;

  @ApiProperty({ example: 'cmpgdeuuu00001s58dbnf4xmi' })
  ownerId!: string;

  @ApiProperty({ example: 1 })
  memberCount!: number;

  @ApiProperty({ example: 60 })
  needsTarget!: number;

  @ApiProperty({ example: 30 })
  wantsTarget!: number;

  @ApiProperty({ example: 20 })
  savingsTarget!: number;

  @ApiProperty({ example: '2026-05-22T03:39:15.512Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-22T03:39:15.512Z' })
  updatedAt!: string;
}
