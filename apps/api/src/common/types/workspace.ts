/**
 * Konteks workspace yang menempel di Request setelah WorkspaceGuard sukses.
 * Diakses via @CurrentWorkspace().
 */
export interface WorkspaceContext {
  id: string;
  role: 'owner' | 'member';
}
