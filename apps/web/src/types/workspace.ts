export interface Workspace {
  id: string;
  name: string;
  role: "owner" | "member";
  isOwner: boolean;
  createdAt: string;
}

export interface CurrentWorkspace {
  id: string;
  name: string;
  ownerId: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}
