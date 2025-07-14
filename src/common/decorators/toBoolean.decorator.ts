import { Transform } from 'class-transformer';

export function ToBoolean(propertyName: string) {
  return Transform(({ obj }) => {
    const value = obj?.[propertyName];

    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  });
}
