import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { FamilyContainer, Family, CreateFamilyRequest, FamilyHdr } from '@core/models';

/**
 * Wraps family payloads for the backend. Backend expects
 * { families_hdr: {...} } with snake_case fields like family_name, group_id.
 */
function wrap(payload: Partial<Family> & { [k: string]: any }): { families_hdr: any } {
  return { families_hdr: payload };
}

/**
 * Normalizes whatever the backend returns into a clean Family shape.
 * Accepts either a raw FamilyHdr object or a FamilyContainer { families_hdr } wrapper.
 */
function unwrap(c: FamilyContainer | FamilyHdr | any): Family {
  const raw: any = ((c as FamilyContainer)?.families_hdr ?? c) ?? {};
  return {
    ...raw,
    guid: raw.guid,
    familyName: raw.familyName ?? raw.family_name ?? '',
    groupId: raw.groupId ?? raw.group_id,
    familyHeadId: raw.familyHeadId ?? raw.family_head_id,
    totalShares: raw.totalShares ?? raw.total_shares,
    description: raw.description,
    status: raw.status,
    createdDate: raw.createdDate ?? raw.created_date,
    updatedDate: raw.updatedDate ?? raw.updated_date
  } as Family;
}

@Injectable({
  providedIn: 'root'
})
export class FamilyService {
  private endpoint = 'families';

  constructor(private apiService: ApiService) {}

  // GET /api/families → list all families (any authenticated user)
  list(): Observable<Family[]> {
    return this.apiService.get<FamilyContainer[]>(this.endpoint).pipe(
      map(list => (list ?? []).map(unwrap))
    );
  }

  // GET /api/families/{id}
  getById(id: string): Observable<Family> {
    return this.apiService.get<FamilyContainer>(`${this.endpoint}/${id}`).pipe(
      map(unwrap)
    );
  }

  // GET /api/families/group/{groupId}
  getByGroup(groupId: string): Observable<Family[]> {
    return this.apiService.get<FamilyContainer[]>(`${this.endpoint}/group/${groupId}`).pipe(
      map(list => (list ?? []).map(unwrap))
    );
  }

  // POST /api/families (ADMIN only)
  create(payload: CreateFamilyRequest): Observable<Family> {
    const body = wrap({
      group_id: payload.groupId,
      family_name: payload.familyName,
      description: payload.description
    });
    return this.apiService.post<FamilyContainer>(this.endpoint, body).pipe(map(unwrap));
  }

  // PUT /api/families/{id} (ADMIN only)
  update(id: string, payload: Partial<Family>): Observable<Family> {
    const body = wrap({
      guid: id,
      family_name: payload.familyName,
      group_id: payload.groupId,
      description: payload.description
    });
    return this.apiService.put<FamilyContainer>(`${this.endpoint}/${id}`, body).pipe(map(unwrap));
  }

  // DELETE /api/families/{id} (ADMIN only)
  delete(id: string): Observable<boolean> {
    return this.apiService.delete<boolean>(`${this.endpoint}/${id}`);
  }
}