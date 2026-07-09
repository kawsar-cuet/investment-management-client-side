import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { FriendGroupContainer, FriendGroup, CreateFriendGroupRequest } from '@core/models';

/**
 * Wraps friend group containers for backend. Backend expects { friend_groups_hdr: {...} }.
 */
function wrap(payload: Partial<FriendGroup>): { friend_groups_hdr: Partial<FriendGroup> } {
  return { friend_groups_hdr: payload as any };
}

function unwrap(c: FriendGroupContainer | FriendGroup): FriendGroup {
  const raw = ((c as FriendGroupContainer).friend_groups_hdr ?? (c as FriendGroup)) as any;
  return {
    ...raw,
    groupName: raw.groupName ?? raw.group_name ?? '',
    createdDate: raw.createdDate ?? raw.created_date,
    updatedDate: raw.updatedDate ?? raw.updated_date
  } as FriendGroup;
}

@Injectable({
  providedIn: 'root'
})
export class FriendGroupService {
  private endpoint = 'groups';

  constructor(private apiService: ApiService) {}

  // GET /api/groups → list all family groups (any authenticated user)
  list(): Observable<FriendGroup[]> {
    return this.apiService.get<FriendGroupContainer[]>(this.endpoint).pipe(
      map(list => (list ?? []).map(unwrap))
    );
  }

  getById(id: string): Observable<FriendGroup> {
    return this.apiService.get<FriendGroupContainer>(`${this.endpoint}/${id}`).pipe(
      map(unwrap)
    );
  }

  create(payload: CreateFriendGroupRequest): Observable<FriendGroup> {
    return this.apiService.post<FriendGroupContainer>(this.endpoint, wrap(payload as any)).pipe(
      map(unwrap)
    );
  }

  update(id: string, payload: Partial<FriendGroup>): Observable<FriendGroup> {
    const body = wrap({ ...payload, guid: id } as any);
    return this.apiService.put<FriendGroupContainer>(`${this.endpoint}/${id}`, body).pipe(
      map(unwrap)
    );
  }

  delete(id: string): Observable<boolean> {
    return this.apiService.delete<boolean>(`${this.endpoint}/${id}`);
  }
}