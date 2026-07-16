/**
 * Maps a backend's raw error shape onto a stable set of codes and the
 * translation keys used to render them. Backend-shape assumptions (NestJS,
 * REST, GraphQL, ...) live entirely in the adapter a consumer provides —
 * core never assumes one.
 */
export interface ErrorCodeAdapter<TCode extends string = string> {
  resolve(rawCode: string | undefined, statusCode: number | undefined): TCode;
  messageKey(code: TCode): string;
  descriptionKey(code: TCode): string;
}

export interface ApiErrorResponseShape {
  statusCode?: number;
  code?: string;
  message?: string;
  description?: string;
  details?: unknown;
}
