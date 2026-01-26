import { prisma } from "@/lib/prisma";
import {
  todayBrasilia,
  getLast7DaysExcludingToday,
  getCurrentWeekDays,
  getLastWeekDays,
} from "@/lib/date-utils";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Calcula o total de cigarros aprovados em um dia específico
 */
export async function getTotalForDay(dateBr: string): Promise<number> {
  const result = await prisma.cigRequest.aggregate({
    where: {
      dateBr,
      status: "APPROVED",
    },
    _sum: {
      amount: true,
    },
  });
  return result._sum.amount?.toNumber() ?? 0;
}

/**
 * Calcula os totais de cigarros aprovados para múltiplos dias
 */
export async function getTotalsForDays(
  days: string[],
): Promise<Map<string, number>> {
  const results = await prisma.cigRequest.groupBy({
    by: ["dateBr"],
    where: {
      dateBr: { in: days },
      status: "APPROVED",
    },
    _sum: {
      amount: true,
    },
  });

  const totals = new Map<string, number>();
  days.forEach((d: string) => totals.set(d, 0)); // inicializa todos com 0
  results.forEach((r: { dateBr: string; _sum: { amount: Decimal | null } }) => {
    totals.set(r.dateBr, r._sum.amount?.toNumber() ?? 0);
  });
  return totals;
}

/**
 * Calcula a média dos últimos 7 dias (excluindo hoje)
 */
export async function getAverageLast7Days(): Promise<number> {
  const days = getLast7DaysExcludingToday();
  const totals = await getTotalsForDays(days);

  let sum = 0;
  totals.forEach((total) => {
    sum += total;
  });

  return sum / 7;
}

/**
 * Retorna a meta do dia (DayLimit ou fallback para config padrão)
 */
export async function getDayLimit(dateBr: string): Promise<number> {
  const dayLimit = await prisma.dayLimit.findUnique({
    where: { date: dateBr },
  });

  if (dayLimit) {
    return dayLimit.limitCigs.toNumber();
  }

  // Fallback para configuração padrão
  const config = await prisma.systemConfig.findFirst();
  return config?.defaultDailyLimit.toNumber() ?? 3.5;
}

/**
 * Verifica se o total do dia excede o limite de alerta (3.5)
 */
export async function checkAlertOverLimit(
  dateBr: string = todayBrasilia(),
): Promise<boolean> {
  const total = await getTotalForDay(dateBr);
  return total > 3.5;
}

/**
 * Verifica se hoje está 30% acima da média dos últimos 7 dias
 */
export async function checkAlert30Percent(): Promise<boolean> {
  const todayTotal = await getTotalForDay(todayBrasilia());
  const average = await getAverageLast7Days();

  if (average === 0) return false;

  return todayTotal > average * 1.3;
}

/**
 * Verifica ambos os alertas e retorna o status
 */
export async function checkAlerts(): Promise<{
  overLimit: boolean;
  over30Percent: boolean;
  todayTotal: number;
  average7Days: number;
}> {
  const todayTotal = await getTotalForDay(todayBrasilia());
  const average7Days = await getAverageLast7Days();

  return {
    overLimit: todayTotal > 3.5,
    over30Percent: average7Days > 0 && todayTotal > average7Days * 1.3,
    todayTotal,
    average7Days,
  };
}

/**
 * Calcula se um novo pedido seria "extra" (acima da meta)
 * e quanto custaria em XP
 */
export async function calculateExtraCost(
  amount: number,
  dateBr: string = todayBrasilia(),
): Promise<{
  isExtra: boolean;
  extraAmount: number;
  xpCost: number;
}> {
  const currentTotal = await getTotalForDay(dateBr);
  const dayLimit = await getDayLimit(dateBr);
  const config = await getSystemConfig();

  const newTotal = currentTotal + amount;

  if (newTotal <= dayLimit) {
    return { isExtra: false, extraAmount: 0, xpCost: 0 };
  }

  // Calcula quanto do pedido é "extra"
  const extraAmount = Math.min(amount, newTotal - dayLimit);

  // Calcula custo em XP
  let xpCost = 0;
  if (extraAmount >= 1) {
    xpCost = config.extraCost10;
  } else if (extraAmount >= 0.5) {
    xpCost = config.extraCost05;
  }

  return { isExtra: true, extraAmount, xpCost };
}

/**
 * Calcula o XP atual do usuário
 */
export async function getUserXp(userId: string): Promise<number> {
  const result = await prisma.xpLedger.aggregate({
    where: { userId },
    _sum: { delta: true },
  });
  return result._sum.delta ?? 0;
}

/**
 * Adiciona XP ao usuário (positivo ou negativo)
 */
export async function addXp(
  userId: string,
  delta: number,
  type: string,
  refId?: string,
  note?: string,
): Promise<void> {
  await prisma.xpLedger.create({
    data: {
      userId,
      delta,
      type,
      refId,
      note,
    },
  });
}

/**
 * Retorna a configuração do sistema
 */
export async function getSystemConfig() {
  const config = await prisma.systemConfig.findFirst();
  if (!config) {
    // Criar configuração padrão se não existir
    return await prisma.systemConfig.create({
      data: {
        weeklyReductionPct: new Decimal(10),
        defaultDailyLimit: new Decimal(3.5),
        extraCost05: 12,
        extraCost10: 20,
      },
    });
  }
  return config;
}

/**
 * Calcula a meta semanal adaptativa baseada na semana anterior
 */
export async function calculateWeeklyTarget(): Promise<{
  lastWeekAverage: number;
  suggestedTarget: number;
  suggestedDailyLimit: number;
}> {
  const lastWeekDays = getLastWeekDays();
  const totals = await getTotalsForDays(lastWeekDays);

  let sum = 0;
  totals.forEach((total) => {
    sum += total;
  });

  const lastWeekTotal = sum;
  const lastWeekAverage = lastWeekTotal / 7;

  const config = await getSystemConfig();
  const reductionPct = config.weeklyReductionPct.toNumber() / 100;

  // Reduz 10% e arredonda para múltiplo de 0.5
  const suggestedWeekly = lastWeekTotal * (1 - reductionPct);
  const suggestedDaily = suggestedWeekly / 7;
  const suggestedDailyLimit = Math.round(suggestedDaily * 2) / 2; // Arredonda para 0.5

  return {
    lastWeekAverage,
    suggestedTarget: suggestedWeekly,
    suggestedDailyLimit: Math.max(suggestedDailyLimit, 1), // Mínimo de 1
  };
}

/**
 * Calcula estatísticas agregadas para o dashboard
 */
export async function getDashboardStats(userId: string) {
  const today = todayBrasilia();
  const weekDays = getCurrentWeekDays();

  // Total de hoje
  const todayTotal = await getTotalForDay(today);

  // Meta de hoje
  const dailyLimit = await getDayLimit(today);

  // Restante de hoje
  const remaining = Math.max(0, dailyLimit - todayTotal);

  // Total da semana
  const weekTotals = await getTotalsForDays(weekDays);
  let weekTotal = 0;
  weekTotals.forEach((t) => (weekTotal += t));

  // Média dos últimos 7 dias
  const average7Days = await getAverageLast7Days();

  // XP do usuário
  const xp = await getUserXp(userId);

  // Alertas
  const alerts = await checkAlerts();

  // Próxima recompensa acessível
  const nextReward = await prisma.reward.findFirst({
    where: {
      active: true,
      costXp: { gt: xp },
    },
    orderBy: { costXp: "asc" },
  });

  // Pedidos pendentes
  const pendingRequests = await prisma.cigRequest.count({
    where: {
      userId,
      status: "PENDING",
    },
  });

  return {
    todayTotal,
    dailyLimit,
    remaining,
    weekTotal,
    average7Days,
    xp,
    alerts,
    nextReward,
    pendingRequests,
  };
}

/**
 * Retorna os dados para o gráfico de progresso (últimos 14 dias)
 */
export async function getProgressChartData(): Promise<
  {
    date: string;
    total: number;
    limit: number;
  }[]
> {
  const days: string[] = [];
  const today = todayBrasilia();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  const totals = await getTotalsForDays(days);

  // Busca limites para os dias
  const limits = await prisma.dayLimit.findMany({
    where: { date: { in: days } },
  });
  const limitsMap = new Map<string, number>();
  limits.forEach((l: { date: string; limitCigs: { toNumber: () => number } }) =>
    limitsMap.set(l.date, l.limitCigs.toNumber()),
  );

  const config = await getSystemConfig();
  const defaultLimit = config.defaultDailyLimit.toNumber();

  return days.map((date) => ({
    date,
    total: totals.get(date) ?? 0,
    limit: limitsMap.get(date) ?? defaultLimit,
  }));
}

/**
 * Verifica se o usuário já resgatou uma recompensa hoje
 */
export async function hasRedeemedToday(
  userId: string,
  rewardId: string,
): Promise<boolean> {
  const today = todayBrasilia();
  const count = await prisma.rewardRedemption.count({
    where: {
      userId,
      rewardId,
      dateBr: today,
    },
  });
  return count > 0;
}

/**
 * Conta resgates do dia para uma recompensa
 */
export async function getRedemptionCountToday(
  userId: string,
  rewardId: string,
): Promise<number> {
  const today = todayBrasilia();
  return await prisma.rewardRedemption.count({
    where: {
      userId,
      rewardId,
      dateBr: today,
    },
  });
}

/**
 * ==========================================
 * NOVO SISTEMA DE MESADA DIÁRIA
 * ==========================================
 */

/**
 * Retorna a mesada diária fixa
 * mesada = 100 XP (fixo)
 */
export async function getDailyAllowance(
  dateBr: string = todayBrasilia(),
): Promise<{
  dailyLimit: number;
  xpPerCig: number;
  allowance: number;
}> {
  const config = await getSystemConfig();
  const dailyLimit = await getDayLimit(dateBr);
  const xpPerCig = config.xpPerCig ?? 30;

  // Mesada fixa de 100 XP por dia
  const allowance = 100;

  return { dailyLimit, xpPerCig, allowance };
}

/**
 * Verifica se o usuário já recebeu a mesada de hoje
 */
export async function hasReceivedAllowanceToday(
  userId: string,
): Promise<boolean> {
  const today = todayBrasilia();
  const existing = await prisma.xpLedger.findFirst({
    where: {
      userId,
      type: "daily_allowance",
      note: { contains: today },
    },
  });
  return !!existing;
}

/**
 * Dá a mesada diária ao usuário (se ainda não recebeu)
 * Retorna o valor dado ou 0 se já recebeu
 */
export async function grantDailyAllowance(userId: string): Promise<number> {
  const config = await getSystemConfig();

  // Se o novo sistema não está habilitado, não faz nada
  if (!config.dailyXpEnabled) {
    return 0;
  }

  // Verifica se o usuário existe
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    return 0;
  }

  const today = todayBrasilia();

  // Verifica se já recebeu hoje
  const alreadyReceived = await hasReceivedAllowanceToday(userId);
  if (alreadyReceived) {
    return 0;
  }

  // Calcula a mesada
  const { allowance, dailyLimit } = await getDailyAllowance(today);

  // Registra no ledger
  await addXp(
    userId,
    allowance,
    "daily_allowance",
    undefined,
    `Mesada diária (${today}) - meta: ${dailyLimit}`,
  );

  return allowance;
}

/**
 * Calcula quanto XP custa um pedido de cigarro
 * Dentro da meta: 30 XP por cigarro
 * Fora da meta (extra): 50 XP por cigarro (mais caro!)
 */
export async function calculateCigCost(amount: number): Promise<{
  xpCost: number;
  xpPerCig: number;
  isExtra: boolean;
  extraCostPerCig: number;
}> {
  const config = await getSystemConfig();
  const today = todayBrasilia();

  if (!config.dailyXpEnabled) {
    // Sistema legado: só cobra em extras
    return { xpCost: 0, xpPerCig: 0, isExtra: false, extraCostPerCig: 0 };
  }

  const xpPerCig = config.xpPerCig ?? 30;
  const extraCostPerCig = 50; // Cigarros extras custam mais!
  
  // Verifica quanto já fumou hoje e qual a meta
  const todayTotal = await getTotalForDay(today);
  const dailyLimit = await getDayLimit(today);
  
  // Calcula quanto do pedido está dentro da meta e quanto é extra
  const remaining = Math.max(0, dailyLimit - todayTotal);
  const withinLimit = Math.min(amount, remaining);
  const extraAmount = Math.max(0, amount - remaining);
  
  // Custo: dentro da meta = 30 XP, extra = 50 XP
  const withinCost = Math.round(withinLimit * xpPerCig);
  const extraCost = Math.round(extraAmount * extraCostPerCig);
  const xpCost = withinCost + extraCost;
  
  const isExtra = extraAmount > 0;

  return { xpCost, xpPerCig, isExtra, extraCostPerCig };
}

/**
 * Retorna estatísticas do dia para o novo sistema
 */
export async function getDailyXpStats(userId: string): Promise<{
  enabled: boolean;
  allowance: number;
  spent: number;
  remaining: number;
  cigsSmoked: number;
  xpPerCig: number;
}> {
  const config = await getSystemConfig();
  const today = todayBrasilia();

  if (!config.dailyXpEnabled) {
    return {
      enabled: false,
      allowance: 0,
      spent: 0,
      remaining: 0,
      cigsSmoked: 0,
      xpPerCig: 0,
    };
  }

  const { allowance, xpPerCig } = await getDailyAllowance(today);
  const cigsSmoked = await getTotalForDay(today);

  // XP gasto hoje em cigarros
  const spentResult = await prisma.xpLedger.aggregate({
    where: {
      userId,
      type: "cig_purchase",
      note: { contains: today },
    },
    _sum: { delta: true },
  });
  const spent = Math.abs(spentResult._sum.delta ?? 0);

  // Calcula restante (pode ser negativo se ultrapassou)
  const remaining = allowance - spent;

  return {
    enabled: true,
    allowance,
    spent,
    remaining,
    cigsSmoked,
    xpPerCig,
  };
}

/**
 * Verifica se o usuário deve receber punição por excesso de cigarros
 * Se fumar mais de 3.5 cigarros no dia, perde 20 XP extras
 * Retorna true se a punição foi aplicada
 */
export async function checkAndApplyExcessPenalty(
  userId: string,
  dateBr: string = todayBrasilia(),
): Promise<{ applied: boolean; penalty: number; totalCigs: number }> {
  const EXCESS_LIMIT = 3.5;
  const PENALTY_XP = 20;

  const totalCigs = await getTotalForDay(dateBr);

  // Se não passou do limite, não aplica punição
  if (totalCigs <= EXCESS_LIMIT) {
    return { applied: false, penalty: 0, totalCigs };
  }

  // Verifica se já aplicou a punição hoje
  const alreadyApplied = await prisma.xpLedger.findFirst({
    where: {
      userId,
      type: "excess_penalty",
      note: { contains: dateBr },
    },
  });

  if (alreadyApplied) {
    return { applied: false, penalty: 0, totalCigs };
  }

  // Aplica a punição
  await addXp(
    userId,
    -PENALTY_XP,
    "excess_penalty",
    undefined,
    `Punição por excesso: ${totalCigs} cigarros (${dateBr})`,
  );

  return { applied: true, penalty: PENALTY_XP, totalCigs };
}
