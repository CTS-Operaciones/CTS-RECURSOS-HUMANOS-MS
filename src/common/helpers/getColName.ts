type Column<T> = keyof T;

export function col<T>(alias: string, field: Column<T>): string {
  return `${alias}.${String(field)}`;
}
