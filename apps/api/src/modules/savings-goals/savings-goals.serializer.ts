import { SavingsGoal, SavingsGoalContribution } from '@prisma/client';

export interface SerializedSavingsGoal {
  id: string;
  linkedWalletId: string | null;
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
  note: string | null;
  isPaused: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function serializeSavingsGoal(goal: SavingsGoal): SerializedSavingsGoal {
  return {
    id: goal.id,
    linkedWalletId: goal.linkedWalletId,
    name: goal.name,
    targetAmount: goal.targetAmount.toString(),
    currentAmount: goal.currentAmount.toString(),
    targetDate: goal.targetDate.toISOString(),
    note: goal.note,
    isPaused: goal.isPaused,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  };
}

export interface SerializedSavingsGoalContribution {
  id: string;
  savingsGoalId: string;
  amount: string;
  createdAt: Date;
}

export function serializeSavingsGoalContribution(
  contribution: SavingsGoalContribution,
): SerializedSavingsGoalContribution {
  return {
    id: contribution.id,
    savingsGoalId: contribution.savingsGoalId,
    amount: contribution.amount.toString(),
    createdAt: contribution.createdAt,
  };
}
