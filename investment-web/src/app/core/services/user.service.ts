import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, UserInfo } from '@core/models';

/**
 * Backend wraps UserContainer which has nested users_hdr.
 * For now, the backend returns UserInfo directly for /api/auth/me.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private endpoint = 'users';

  constructor(private apiService: ApiService) {}

  getMe(): Observable<UserInfo> {
    return this.apiService.get<UserInfo>('auth/me');
  }

  getById(id: string): Observable<User> {
    return this.apiService.get<User>(`${this.endpoint}/${id}`);
  }

  getByUsername(username: string): Observable<User> {
    return this.apiService.get<User>(`${this.endpoint}/username/${username}`);
  }

  getByEmail(email: string): Observable<User> {
    return this.apiService.get<User>(`${this.endpoint}/email/${email}`);
  }
}