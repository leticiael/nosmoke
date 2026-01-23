import { toZonedTime, format } from "date-fns-tz";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  addDays,
  differenceInDays,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";

// Fuso horário de Brasília
export const TIMEZONE = "America/Sao_Paulo";

/**
 * Retorna a data atual no fuso de Brasília
 */
export function nowBrasilia(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

/**
 * Retorna a data atual em formato YYYY-MM-DD (Brasília)
 */
export function todayBrasilia(): string {
  return format(nowBrasilia(), "yyyy-MM-dd", { timeZone: TIMEZONE });
}

/**
 * Converte uma data UTC para Brasília
 */
export function toBrasilia(date: Date): Date {
  return toZonedTime(date, TIMEZONE);
}

/**
 * Retorna o início do dia em Brasília (00:00:00)
 */
export function startOfDayBrasilia(date: Date): Date {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return startOfDay(zonedDate);
}

/**
 * Retorna o fim do dia em Brasília (23:59:59.999)
 */
export function endOfDayBrasilia(date: Date): Date {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return endOfDay(zonedDate);
}

/**
 * Retorna a string YYYY-MM-DD de uma data (no fuso de Brasília)
 */
export function dateToString(date: Date): string {
  return format(toZonedTime(date, TIMEZONE), "yyyy-MM-dd", {
    timeZone: TIMEZONE,
  });
}

/**
 * Parse de string YYYY-MM-DD para Date (considera meia-noite em Brasília)
 */
export function stringToDate(dateStr: string): Date {
  return parseISO(dateStr);
}

/**
 * Retorna os últimos N dias (incluindo hoje) como array de strings YYYY-MM-DD
 */
export function getLastNDays(n: number): string[] {
  const today = nowBrasilia();
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const day = subDays(today, i);
    days.push(dateToString(day));
  }
  return days;
}

/**
 * Retorna os últimos 7 dias anteriores a hoje (para cálculo de média)
 */
export function getLast7DaysExcludingToday(): string[] {
  const today = nowBrasilia();
  const days: string[] = [];
  for (let i = 7; i >= 1; i--) {
    const day = subDays(today, i);
    days.push(dateToString(day));
  }
  return days;
}

/**
 * Retorna o início da semana atual (domingo) em Brasília
 */
export function getWeekStart(): string {
  const today = nowBrasilia();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Domingo
  return dateToString(weekStart);
}

/**
 * Retorna o fim da semana atual (sábado) em Brasília
 */
export function getWeekEnd(): string {
  const today = nowBrasilia();
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
  return dateToString(weekEnd);
}

/**
 * Retorna todos os dias da semana atual como array de strings
 */
export function getCurrentWeekDays(): string[] {
  const today = nowBrasilia();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(dateToString(addDays(weekStart, i)));
  }
  return days;
}

/**
 * Retorna todos os dias da semana anterior como array de strings
 */
export function getLastWeekDays(): string[] {
  const today = nowBrasilia();
  const lastWeekEnd = subDays(startOfWeek(today, { weekStartsOn: 0 }), 1);
  const lastWeekStart = startOfWeek(lastWeekEnd, { weekStartsOn: 0 });
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(dateToString(addDays(lastWeekStart, i)));
  }
  return days;
}

/**
 * Formata data para exibição PT-BR
 */
export function formatDateBR(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "dd/MM", { locale: ptBR });
}

/**
 * Formata data completa para exibição PT-BR
 */
export function formatDateFullBR(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "dd 'de' MMMM", { locale: ptBR });
}

/**
 * Formata hora para exibição PT-BR
 */
export function formatTimeBR(date: Date): string {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return format(zonedDate, "HH:mm", { locale: ptBR });
}

/**
 * Formata data e hora para exibição PT-BR
 */
export function formatDateTimeBR(date: Date): string {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return format(zonedDate, "dd/MM 'às' HH:mm", { locale: ptBR });
}

/**
 * Retorna o dia da semana em PT-BR
 */
export function getDayOfWeekBR(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "EEEE", { locale: ptBR });
}

/**
 * Retorna o dia da semana abreviado em PT-BR
 */
export function getDayOfWeekShortBR(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "EEE", { locale: ptBR });
}

/**
 * Verifica se uma data é hoje (no fuso de Brasília)
 */
export function isToday(dateStr: string): boolean {
  return dateStr === todayBrasilia();
}

/**
 * Calcula quantos dias atrás foi a data
 */
export function daysAgo(dateStr: string): number {
  const today = nowBrasilia();
  const date = parseISO(dateStr);
  return differenceInDays(today, date);
}
