import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export const cigRequestSchema = z.object({
  amount: z.enum(["0.5", "1.0"], {
    required_error: "Escolha a quantidade",
    invalid_type_error: "Quantidade inválida",
  }),
  reason1: z.string().min(1, "Escolha o primeiro motivo"),
  reason2: z.string().min(1, "Escolha o segundo motivo"),
});

export const redeemRewardSchema = z.object({
  rewardId: z.string().min(1, "ID da recompensa obrigatório"),
});

export const approveRequestSchema = z.object({
  requestId: z.string().min(1, "ID do pedido obrigatório"),
  action: z.enum(["approve", "reject"]),
});

export const validateRedemptionSchema = z.object({
  redemptionId: z.string().min(1, "ID do resgate obrigatório"),
  action: z.enum(["validate", "reject"]),
});

export const setDayLimitSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve ser YYYY-MM-DD"),
  limit: z.coerce.number().min(0).max(20),
});

export const updateConfigSchema = z.object({
  weeklyReductionPct: z.coerce.number().min(0).max(50).optional(),
  defaultDailyLimit: z.coerce.number().min(0.5).max(20).optional(),
  extraCost05: z.coerce.number().min(0).max(100).optional(),
  extraCost10: z.coerce.number().min(0).max(100).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CigRequestInput = z.infer<typeof cigRequestSchema>;
export type RedeemRewardInput = z.infer<typeof redeemRewardSchema>;
export type ApproveRequestInput = z.infer<typeof approveRequestSchema>;
export type ValidateRedemptionInput = z.infer<typeof validateRedemptionSchema>;
export type SetDayLimitInput = z.infer<typeof setDayLimitSchema>;
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
