import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um número para exibição com uma casa decimal
 */
export function formatNumber(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

/**
 * Arredonda para múltiplo de 0.5
 */
export function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

/**
 * Retorna a cor do status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "PENDING":
      return "text-amber-600 bg-amber-100";
    case "APPROVED":
    case "VALIDATED":
      return "text-green-600 bg-green-100";
    case "REJECTED":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

/**
 * Traduz o status para PT-BR
 */
export function translateStatus(status: string): string {
  switch (status) {
    case "PENDING":
      return "Pendente";
    case "APPROVED":
      return "Aprovado";
    case "REJECTED":
      return "Recusado";
    case "VALIDATED":
      return "Validado";
    case "IN_PROGRESS":
      return "Em andamento";
    case "COMPLETED":
      return "Concluída";
    case "FAILED":
      return "Não cumprida";
    default:
      return status;
  }
}
