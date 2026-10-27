const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  timeZone: 'UTC',
});

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
});

function parseLocalDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function getDayLabel(index: number, date: string): string {
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';
  return weekdayFormatter.format(parseLocalDate(date));
}

export function getShortDate(date: string): string {
  return shortDateFormatter.format(parseLocalDate(date));
}
