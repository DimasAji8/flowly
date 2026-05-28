import { SavingsGoal } from '@prisma/client';

export interface SerializedSavingsGoal {
  id: string;
  linkedWalletId: string | null;
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function serializeSavingsGoal(
  goal: SavingsGoal,
): SerializedSavingsGoal {
  return {
    id: goal.id,
    linkedWalletId: goal.linkedWalletId,
    name: goal.name,
    targetAmount: goal.targetAmount.toString(),
    currentAmount: goal.currentAmount.toString(),
    targetDate: goal.targetDate.toISOString(),
    note: goal.note,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  };
}