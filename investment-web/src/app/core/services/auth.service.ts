import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse, SignupRequest, UserInfo, ApiEnvelope } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenKey = 'auth_token';
  private refreshTokenKey = 'auth_refresh_token';
  private userKey = 'current_user';

  constructor(private apiService: ApiService) {
    this.loadUserFromStorage();
  }

  /**
   * Login: POST /api/auth/login
   * Backend returns ApiResponse<LoginResponse> where LoginResponse has
   * accessToken, refreshToken, tokenType, user.
   */
  login(credentials: LoginRequest): Observable<LoginResponse | null> {
    return this.apiService.postRaw<ApiEnvelope<LoginResponse>>('auth/login', credentials).pipe(
      tap(env => {
        const data = this.extractData(env);
        if (data) {
          this.setSession(data);
        }
      }),
      map(env => this.extractData(env))
    );
  }

  /**
   * Signup: POST /api/auth/signup
   */
  signup(payload: SignupRequest): Observable<LoginResponse | null> {
    return this.apiService.postRaw<ApiEnvelope<LoginResponse>>('auth/signup', payload).pipe(
      tap(env => {
        const data = this.extractData(env);
        if (data) {
          this.setSession(data);
        }
      }),
      map(env => this.extractData(env))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  private setSession(authResult: LoginResponse): void {
    if (authResult.accessToken) {
      localStorage.setItem(this.tokenKey, authResult.accessToken);
    }
    if (authResult.refreshToken) {
      localStorage.setItem(this.refreshTokenKey, authResult.refreshToken);
    }
    if (authResult.user) {
      localStorage.setItem(this.userKey, JSON.stringify(authResult.user));
      this.currentUserSubject.next(authResult.user);
    }
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(this.userKey);
    if (userJson) {
      try {
        const user = JSON.parse(userJson) as UserInfo;
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error parsing user from storage', e);
      }
    }
  }

  private extractData(env: ApiEnvelope<LoginResponse> | null | undefined): LoginResponse | null {
    if (!env) return null;
    if (env.success === false) {
      throw new Error(env.message || 'Authentication failed');
    }
    return env.data ?? null;
  }
}
