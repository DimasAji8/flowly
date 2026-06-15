/**
 * Payload yang disimpan di JWT.
 * `sub` = user.id (standar JWT claim).
 *
 * Catatan: nama dibuat unik (FlowlyJwtPayload) untuk menghindari
 * tabrakan tipe dengan `JwtPayload` dari library `jsonwebtoken`
 * yang dipakai oleh `@nestjs/jwt`.
 */
export interface FlowlyJwtPayload {
  sub: string;
  email: string;
  role: 'user' | 'developer';
}

/**
 * Alias backward-compat untuk file yang sudah pakai nama lama.
 * @deprecated gunakan FlowlyJwtPayload
 */
export type JwtPayload = FlowlyJwtPayload;

/**
 * User context yang menempel di Request setelah JwtAuthGuard sukses.
 * Diakses via @CurrentUser().
 */
export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'developer';
}
