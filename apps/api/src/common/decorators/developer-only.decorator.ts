import { SetMetadata } from '@nestjs/common';

export const DEVELOPER_ONLY_KEY = 'developerOnly';

/**
 * Restrict endpoint ke user dengan role `developer`.
 * Bisa dipasang di controller level atau method level.
 * Wajib dipakai bersama JwtAuthGuard.
 *
 * @example
 *   @UseGuards(JwtAuthGuard, DeveloperGuard)
 *   @DeveloperOnly()
 *   @Get('stats')
 *   stats() { ... }
 */
export const DeveloperOnly = () => SetMetadata(DEVELOPER_ONLY_KEY, true);
