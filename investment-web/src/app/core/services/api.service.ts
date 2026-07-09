import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { ApiEnvelope } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: any): Observable<T> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<ApiEnvelope<T>>(`${this.apiUrl}/${endpoint}`, { params: httpParams })
      .pipe(map(env => this.unwrap<T>(env)));
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .post<ApiEnvelope<T>>(`${this.apiUrl}/${endpoint}`, body)
      .pipe(map(env => this.unwrap<T>(env)));
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .put<ApiEnvelope<T>>(`${this.apiUrl}/${endpoint}`, body)
      .pipe(map(env => this.unwrap<T>(env)));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<ApiEnvelope<T>>(`${this.apiUrl}/${endpoint}`)
      .pipe(map(env => this.unwrap<T>(env)));
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .patch<ApiEnvelope<T>>(`${this.apiUrl}/${endpoint}`, body)
      .pipe(map(env => this.unwrap<T>(env)));
  }

  // For endpoints that don't wrap in ApiResponse (e.g. login) - returns raw body
  postRaw<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body);
  }

  private unwrap<T>(env: ApiEnvelope<T> | T): T {
    // If response is already unwrapped (no envelope), return as-is
    if (env === null || env === undefined) {
      return env as T;
    }
    // Check if it looks like an ApiEnvelope. Backend uses either:
    //   - { success: boolean, data: T, ... }   (older envelope)
    //   - { status: "success" | "error", data: T, ... }   (current envelope)
    if (typeof env === 'object' && env !== null) {
      const anyEnv = env as any;
      const hasSuccessFlag = 'success' in anyEnv;
      const hasStatusFlag = 'status' in anyEnv;
      const isError = hasSuccessFlag && anyEnv.success === false;
      const isExplicitError = hasStatusFlag && anyEnv.status === 'error';
      if (isError || isExplicitError) {
        throw new Error(anyEnv.message || 'API request failed');
      }
      if (hasSuccessFlag || hasStatusFlag) {
        return (anyEnv.data !== undefined ? anyEnv.data : env) as T;
      }
    }
    return env as T;
  }

  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return httpParams;
  }
}
