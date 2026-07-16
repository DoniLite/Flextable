export type ClassNameProp<T> = string | ((entity: T) => string);

/** Single shared resolution point for the string-or-callback className pattern used across every column kind. */
export function resolveClassName<T>(
  className: ClassNameProp<T> | undefined,
  entity: T | undefined,
): string {
  if (!className) {
    return '';
  }
  if (typeof className === 'string') {
    return className;
  }
  return entity !== undefined ? className(entity) : '';
}
