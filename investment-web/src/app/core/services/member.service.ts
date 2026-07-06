import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { MemberContainer, Member, CreateMemberRequest } from '@core/models';

function wrap(payload: Partial<Member>): { members_hdr: Partial<Member> } {
  return { members_hdr: payload as any };
}

function unwrap(c: MemberContainer | Member): Member {
  return ((c as MemberContainer).members_hdr ?? (c as Member)) as Member;
}

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private endpoint = 'members';

  constructor(private apiService: ApiService) {}

  getById(id: string): Observable<Member> {
    return this.apiService.get<MemberContainer>(`${this.endpoint}/${id}`).pipe(
      map(unwrap)
    );
  }

  getByFamilyId(familyId: string): Observable<Member[]> {
    return this.apiService.get<MemberContainer[]>(`${this.endpoint}/family/${familyId}`).pipe(
      map(list => (list || []).map(unwrap))
    );
  }

  getFamilyHead(familyId: string): Observable<Member> {
    return this.apiService.get<MemberContainer>(`${this.endpoint}/family/${familyId}/head`).pipe(
      map(unwrap)
    );
  }

  create(payload: CreateMemberRequest): Observable<Member> {
    return this.apiService.post<MemberContainer>(this.endpoint, wrap(payload as any)).pipe(
      map(unwrap)
    );
  }

  createBulk(payloads: CreateMemberRequest[]): Observable<Member[]> {
    const body = payloads.map(p => wrap(p as any));
    return this.apiService.post<MemberContainer[]>(`${this.endpoint}/bulk`, body).pipe(
      map(list => (list || []).map(unwrap))
    );
  }

  update(id: string, payload: Partial<Member>): Observable<Member> {
    const body = wrap({ ...payload, guid: id } as any);
    return this.apiService.put<MemberContainer>(`${this.endpoint}/${id}`, body).pipe(
      map(unwrap)
    );
  }

  delete(id: string): Observable<boolean> {
    return this.apiService.delete<boolean>(`${this.endpoint}/${id}`);
  }
}
