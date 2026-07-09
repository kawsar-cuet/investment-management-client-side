import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { MemberContainer, Member, CreateMemberRequest, MemberHdr } from '@core/models';

/**
 * Wraps member payloads for the backend. Backend expects
 * { members_hdr: {...} } with snake_case fields like full_name, phone_number, family_id.
 */
function wrap(payload: Partial<Member> & { [k: string]: any }): { members_hdr: any } {
  return { members_hdr: payload };
}

/**
 * Normalizes whatever the backend returns into a clean Member shape.
 * Accepts either a raw MemberHdr object or a MemberContainer { members_hdr } wrapper.
 */
function unwrap(c: MemberContainer | MemberHdr | any): Member {
  const raw: any = ((c as MemberContainer)?.members_hdr ?? c) ?? {};
  return {
    ...raw,
    guid: raw.guid,
    userId: raw.userId ?? raw.user_id,
    fullName: raw.fullName ?? raw.full_name ?? '',
    phoneNumber: raw.phoneNumber ?? raw.phone_number,
    address: raw.address,
    groupId: raw.groupId ?? raw.group_id,
    familyId: raw.familyId ?? raw.family_id,
    memberType: raw.memberType ?? raw.member_type,
    joinDate: raw.joinDate ?? raw.join_date,
    isFamilyHead: raw.isFamilyHead ?? raw.is_family_head ?? false,
    shareCount: raw.shareCount ?? raw.share_count,
    status: raw.status,
    createdDate: raw.createdDate ?? raw.created_date,
    updatedDate: raw.updatedDate ?? raw.updated_date
  } as Member;
}

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private endpoint = 'members';

  constructor(private apiService: ApiService) {}

  // GET /api/members → list all members (any authenticated user)
  list(): Observable<Member[]> {
    return this.apiService.get<MemberContainer[]>(this.endpoint).pipe(
      map(list => (list ?? []).map(unwrap))
    );
  }

  // GET /api/members/{id}
  getById(id: string): Observable<Member> {
    return this.apiService.get<MemberContainer>(`${this.endpoint}/${id}`).pipe(
      map(unwrap)
    );
  }

  // GET /api/members/family/{familyId}
  getByFamilyId(familyId: string): Observable<Member[]> {
    return this.apiService.get<MemberContainer[]>(`${this.endpoint}/family/${familyId}`).pipe(
      map(list => (list ?? []).map(unwrap))
    );
  }

  // GET /api/members/family/{familyId}/head
  getFamilyHead(familyId: string): Observable<Member> {
    return this.apiService.get<MemberContainer>(`${this.endpoint}/family/${familyId}/head`).pipe(
      map(unwrap)
    );
  }

  // POST /api/members (ADMIN only)
  create(payload: CreateMemberRequest): Observable<Member> {
    const body = wrap({
      user_id: payload.userId,
      full_name: payload.fullName,
      phone_number: payload.phoneNumber,
      address: payload.address,
      group_id: payload.groupId,
      family_id: payload.familyId,
      member_type: payload.memberType ?? 'FAMILY',
      is_family_head: payload.isFamilyHead ?? false,
      share_count: payload.shareCount ?? 1,
      join_date: payload.joinDate
    });
    return this.apiService.post<MemberContainer>(this.endpoint, body).pipe(map(unwrap));
  }

  // POST /api/members/bulk (ADMIN only)
  createBulk(payloads: CreateMemberRequest[]): Observable<Member[]> {
    const body = payloads.map(p => wrap({
      user_id: p.userId,
      full_name: p.fullName,
      phone_number: p.phoneNumber,
      address: p.address,
      group_id: p.groupId,
      family_id: p.familyId,
      member_type: p.memberType ?? 'FAMILY',
      is_family_head: p.isFamilyHead ?? false,
      share_count: p.shareCount ?? 1,
      join_date: p.joinDate
    }));
    return this.apiService.post<MemberContainer[]>(`${this.endpoint}/bulk`, body).pipe(
      map(list => (list ?? []).map(unwrap))
    );
  }

  // PUT /api/members/{id} (ADMIN only)
  update(id: string, payload: Partial<Member>): Observable<Member> {
    const body = wrap({
      guid: id,
      full_name: payload.fullName,
      phone_number: payload.phoneNumber,
      address: payload.address,
      group_id: payload.groupId,
      family_id: payload.familyId,
      member_type: payload.memberType,
      is_family_head: payload.isFamilyHead,
      share_count: payload.shareCount,
      join_date: payload.joinDate
    });
    return this.apiService.put<MemberContainer>(`${this.endpoint}/${id}`, body).pipe(map(unwrap));
  }

  // DELETE /api/members/{id} (ADMIN only)
  delete(id: string): Observable<boolean> {
    return this.apiService.delete<boolean>(`${this.endpoint}/${id}`);
  }
}
