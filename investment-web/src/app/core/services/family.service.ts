import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { FamilyContainer, Family, CreateFamilyRequest } from '@core/models';

function wrap(payload: Partial<Family>): { families_hdr: Partial<Family> } {
  return { families_hdr: payload as any };
}

function unwrap(c: FamilyContainer | Family): Family {
  return ((c as FamilyContainer).families_hdr ?? (c as Family)) as Family;
}

@Injectable({
  providedIn: 'root'
})
export class FamilyService {
  private endpoint = 'families';

  constructor(private apiService: ApiService) {}

  getById(id: string): Observable<Family> {
    return this.apiService.get<FamilyContainer>(`${this.endpoint}/${id}`).pipe(
      map(unwrap)
    );
  }

  getByGroup(groupId: string): Observable<Family[]> {
    return this.apiService.get<FamilyContainer[]>(`${this.endpoint}/group/${groupId}`).pipe(
      map(list => (list || []).map(unwrap))
    );
  }

  create(payload: CreateFamilyRequest): Observable<Family> {
    return this.apiService.post<FamilyContainer>(this.endpoint, wrap(payload as any)).pipe(
      map(unwrap)
    );
  }

  update(id: string, payload: Partial<Family>): Observable<Family> {
    const body = wrap({ ...payload, guid: id } as any);
    return this.apiService.put<FamilyContainer>(`${this.endpoint}/${id}`, body).pipe(
      map(unwrap)
    );
  }

  delete(id: string): Observable<boolean> {
    return this.apiService.delete<boolean>(`${this.endpoint}/${id}`);
  }
}