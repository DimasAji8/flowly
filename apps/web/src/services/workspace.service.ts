import { apiClient } from "@/lib/api-client";

export interface WorkspaceSettings {
  id: string;
  name: string;
  needsTarget: number;
  wantsTarget: number;
  savingsTarget: number;
}

export interface AllocationTargets {
  needsTarget: number;
  wantsTarget: number;
  savingsTarget: number;
}

export const workspaceService = {
  getCurrent() {
    return apiClient.get<WorkspaceSettings>("/workspaces/current", {
      auth: true,
      workspaceScoped: true,
    });
  },

  updateAllocation(payload: Partial<AllocationTargets>) {
    return apiClient.patch<AllocationTargets>("/workspaces/current/allocation", payload, {
      auth: true,
      workspaceScoped: true,
    });
  },
};
