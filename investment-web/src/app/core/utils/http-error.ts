import { HttpErrorResponse } from '@angular/common/http';

/**
 * Backend envelope shape returned for error responses.
 * Matches `ApiResponse` on the Java side: { status, message, data?, timestamp? }.
 */
interface BackendErrorEnvelope {
  status?: string;
  success?: boolean;
  message?: string;
  error?: string;
  data?: any;
  timestamp?: string;
}

/**
 * Extract a user-friendly error message from anything an RxJS error callback
 * may receive (HttpErrorResponse, thrown Error from ApiService.unwrap,
 * plain string, undefined). Order of preference:
 *
 *   1. Backend envelope `.message` / `.error` (covers 4xx/5xx JSON bodies)
 *   2. Server-side Validation message for field-level errors (Spring style)
 *   3. Thrown `Error.message` from ApiService.unwrap (2xx with error envelope)
 *   4. HttpErrorResponse.statusText when set
 *   5. Friendly HTTP-status fallback (e.g. "Request failed (404 Not Found)")
 *   6. The provided default
 *
 * Use this everywhere instead of `err?.message` so that backend error
 * envelopes are surfaced as readable text instead of "Http failure response
 * for http://localhost:8080/api/members: 400 OK".
 */
export function extractHttpErrorMessage(
  err: unknown,
  fallback = 'Request failed.'
): string {
  // 1. Thrown Error from ApiService.unwrap — message is the backend envelope's message
  if (err instanceof Error) {
    const m = (err.message ?? '').trim();
    // Filter out Angular's stock "Http failure response for ..." noise so
    // we don't accidentally use it when both an envelope AND that string
    // are present (rare, but possible if the caller pre-formats err).
    if (m && !m.startsWith('Http failure response')) return m;
  }

  const httpErr = err as HttpErrorResponse | undefined;
  const body = (httpErr?.error ?? null) as BackendErrorEnvelope | string | null;

  // 2. Parsed JSON envelope (HttpErrorResponse.error is the parsed body)
  if (body && typeof body === 'object') {
    if (body.message && typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }
    if (body.error && typeof body.error === 'string' && body.error.trim()) {
      return body.error;
    }
  }

  // 3. Raw string body (e.g. some proxies return plain text)
  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  // 4. statusText fallback
  if (httpErr?.statusText && httpErr.statusText.trim()) {
    return httpErr.statusText;
  }

  // 5. Status-code based fallback so users still see something meaningful
  if (httpErr?.status) {
    return `Request failed (${httpErr.status}${httpErr.statusText ? ' ' + httpErr.statusText : ''})`;
  }

  return fallback;
}