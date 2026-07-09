import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { FamilyReportQuery, FamilyReportResponse } from '@core/models';

/**
 * Service for the read-only Reports menu.
 *
 * Currently exposes the family-wise summary report. Both ADMIN and USER
 * roles can read it (the backend SecurityConfiguration allows both).
 */
@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private endpoint = 'reports';

  constructor(private apiService: ApiService) {}

  /**
   * GET /api/reports/family-summary
   *
   * All query parameters are optional. Pass `null`/undefined to omit a filter
   * (which means "no filter applied" server-side).
   */
  getFamilySummary(query: FamilyReportQuery = {}): Observable<FamilyReportResponse> {
    const params: Record<string, string | number> = {};
    if (query.year != null) {
      params['year'] = query.year;
    }
    if (query.familyId) {
      params['familyId'] = query.familyId;
    }
    if (query.groupId) {
      params['groupId'] = query.groupId;
    }
    return this.apiService.get<FamilyReportResponse>(
      `${this.endpoint}/family-summary`,
      params
    );
  }
}
