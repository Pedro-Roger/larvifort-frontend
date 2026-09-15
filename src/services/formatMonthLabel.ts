const MONTHS_PT_BR = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function formatMonthLabel(date: Date): string {
  return `${MONTHS_PT_BR[date.getMonth()]} / ${date.getFullYear()}`;
}
