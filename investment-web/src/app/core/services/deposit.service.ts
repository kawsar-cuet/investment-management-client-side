import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  DepositContainer,
  Deposit,
  CreateDepositRequest,
  FamilyBulkDepositRequest,
  FamilyBulkDepositPreview,
  DepositSearchResult,
  DepositSearchQuery
} from '@core/models';

function wrap(payload: Partial<Deposit>): { deposits_hdr: Partial<Deposit> } {
  return { deposits_hdr: payload as any };
}

function unwrap(c: DepositContainer | Deposit): Deposit {
  return ((c as DepositContainer).deposits_hdr ?? (c as Deposit)) as Deposit;
}

@Injectable({
  providedIn: 'root'
})
export class DepositService {
  private endpoint = 'deposits';

  constructor(private apiService: ApiService) {}

  getById(id: string): Observable<Deposit> {
    return this.apiService.get<DepositContainer>(`${this.endpoint}/${id}`).pipe(
      map(unwrap)
    );
  }

  getByMember(memberId: string): Observable<Deposit[]> {
    return this.apiService.get<DepositContainer[]>(`${this.endpoint}/member/${memberId}`).pipe(
      map(list => (list || []).map(unwrap))
    );
  }

  getByFamily(familyId: string): Observable<Deposit[]> {
    return this.apiService.get<DepositContainer[]>(`${this.endpoint}/family/${familyId}`).pipe(
      map(list => (list || []).map(unwrap))
    );
  }

  getByPeriod(month: number, year: number): Observable<Deposit[]> {
    return this.apiService.get<DepositContainer[]>(`${this.endpoint}/period/${month}/${year}`).pipe(
      map(list => (list || []).map(unwrap))
    );
  }

  getFamilyTotal(familyId: string, month: number, year: number): Observable<number | string> {
    return this.apiService.get<number | string>(
      `${this.endpoint}/family/${familyId}/total/${month}/${year}`
    );
  }

  create(payload: CreateDepositRequest): Observable<Deposit> {
    return this.apiService.post<DepositContainer>(this.endpoint, wrap(payload as any)).pipe(
      map(unwrap)
    );
  }

  createBulk(payloads: CreateDepositRequest[]): Observable<Deposit[]> {
    const body = payloads.map(p => wrap(p as any));
    return this.apiService.post<DepositContainer[]>(`${this.endpoint}/bulk`, body).pipe(
      map(list => (list || []).map(unwrap))
    );
  }

  createFamilyBulkDeposit(payload: FamilyBulkDepositRequest): Observable<Deposit[]> {
    return this.apiService.post<DepositContainer[]>(`${this.endpoint}/family-bulk`, payload).pipe(
      map(list => (list || []).map(unwrap))
    );
  }

  previewFamilyBulkDeposit(familyId: string, totalAmount: number): Observable<FamilyBulkDepositPreview> {
    return this.apiService.get<FamilyBulkDepositPreview>(
      `${this.endpoint}/family-bulk/preview`,
      { familyId, totalAmount }
    );
  }

  update(id: string, payload: Partial<Deposit>): Observable<Deposit> {
    const body = wrap({ ...payload, guid: id } as any);
    return this.apiService.put<DepositContainer>(`${this.endpoint}/${id}`, body).pipe(
      map(unwrap)
    );
  }

  delete(id: string): Observable<boolean> {
    return this.apiService.delete<boolean>(`${this.endpoint}/${id}`);
  }

  /**
   * Keyword search across deposits. The server joins member + family +
   * depositor names and applies case-insensitive LIKE on the supplied keyword.
   */
  search(query: DepositSearchQuery): Observable<DepositSearchResult[]> {
    const params: Record<string, string | number> = {};
    if (query.keyword && query.keyword.trim()) {
      params['keyword'] = query.keyword.trim();
    }
    if (query.memberId) {
      params['memberId'] = query.memberId;
    }
    if (query.familyId) {
      params['familyId'] = query.familyId;
    }
    if (query.month != null && query.month > 0) {
      params['month'] = query.month;
    }
    if (query.year != null && query.year > 0) {
      params['year'] = query.year;
    }
    if (query.status) {
      params['status'] = query.status;
    }
    return this.apiService.get<DepositSearchResult[]>(`${this.endpoint}/search`, params);
  }
}
