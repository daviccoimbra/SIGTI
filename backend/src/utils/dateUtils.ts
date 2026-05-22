export function parseDateStart(dateStr: string): Date {
  const parts = dateStr.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export function parseDateEnd(dateStr: string): Date {
  const parts = dateStr.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}

export function getDateRangeFromParams(query: Record<string, any>) {
  const startDate = query.startDate ? parseDateStart(query.startDate) : null;
  const endDate = query.endDate ? parseDateEnd(query.endDate) : null;
  return { startDate, endDate };
}

export function buildDateFilter(startDate: Date | null, endDate: Date | null, dateField: 'createdAt' | 'updatedAt' = 'createdAt') {
  if (startDate && endDate) {
    return { [dateField]: { gte: startDate, lte: endDate } };
  }
  if (startDate) {
    return { [dateField]: { gte: startDate } };
  }
  if (endDate) {
    return { [dateField]: { lte: endDate } };
  }
  return {};
}

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
