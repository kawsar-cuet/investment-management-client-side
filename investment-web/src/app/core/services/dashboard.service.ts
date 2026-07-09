import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ApiService } from './api.service';
import { DepositService } from './deposit.service';
import { MemberService } from './member.service';
import { DepositSearchResult, Member } from '@core/models';

/**
 * Aggregate shape returned by `DashboardService.loadStats()`.
 *
 * The dashboard has no dedicated backend endpoint, so this service composes
 * results from the existing /api/members and /api/deposits/search APIs into
 * the four headline numbers the user sees on the home page.
 *
 * Note on the "this month" semantic:
 *   - Backend search?month=&year= filters by `deposit_month` / `deposit_year`
 *     (the period the deposit COVERS, e.g. July 2026 rent).
 *   - The Recent Deposits card renders `deposit_date` (when the deposit was
 *     RECORDED in the system).
 *   These two timestamps can disagree — e.g. a deposit recorded on
 *   2026-07-09 covering period 2026-09.
 *
 *   To keep the dashboard consistent with what users *see* in Recent Deposits,
 *   we filter "Deposits This Month" and "Pending Deposits" client-side using
 *   the same `deposit_date` field. That way the four headline numbers and
 *   the list below them always agree.
 */
export interface DashboardStats {
  totalMembers: number;
  depositsThisMonth: number;
  totalCollected: number;
  /** Members that have not yet deposited (recorded) in the current calendar month. */
  pendingDeposits: number;
  /** Most recent ACTIVE deposits (sorted by deposit_date desc). */
  recentDeposits: DepositSearchResult[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private apiService: ApiService,
    private depositService: DepositService,
    private memberService: MemberService
  ) {}

  /**
   * Compute dashboard stats. Calls:
   *  - GET /api/members           (active member roster)
   *  - GET /api/deposits/search?status=ACTIVE   (all active deposits)
   *
   * The "deposits this month" slice is filtered client-side from the full
   * search result using `deposit_date` (see interface doc above).
   *
   * Any single failure degrades to empty data for that slice rather than
   * breaking the whole dashboard — the cards still render with `0`.
   */
  loadStats(): Observable<DashboardStats> {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    return forkJoin({
      members: this.memberService.list().pipe(catchError(() => of([] as Member[]))),
      allDeposits: this.depositService
        .search({ status: 'ACTIVE' })
        .pipe(catchError(() => of([] as DepositSearchResult[])))
    }).pipe(
      map(({ members, allDeposits }) => {
        const activeMembers = (members || []).filter(m => (m.status || 'ACTIVE') === 'ACTIVE');
        const totalMembers = activeMembers.length;

        const totalCollected = (allDeposits || []).reduce(
          (sum, d) => sum + (Number(d.amount) || 0),
          0
        );

        // Filter "this month" using deposit_date (YYYY-MM-DD) so it matches
        // the date shown in the Recent Deposits list.
        const thisMonthDeposits = (allDeposits || []).filter(d => {
          const ds = String(d.depositDate || '').substring(0, 10); // "YYYY-MM-DD"
          if (!ds || ds.length < 7) return false;
          const [y, m] = ds.split('-');
          return Number(y) === year && Number(m) === month;
        });
        const depositsThisMonth = thisMonthDeposits.length;

        // Pending = members who haven't deposited (recorded) this month.
        const depositedThisMonth = new Set(
          thisMonthDeposits
            .map(d => d.memberId)
            .filter((id): id is string => !!id)
        );
        const pendingDeposits = activeMembers.filter(m => !depositedThisMonth.has(m.guid)).length;

        // Recent deposits: top 5 by deposit_date desc (the same date the card displays).
        const recentDeposits = (allDeposits || [])
          .slice()
          .sort((a, b) =>
            String(b.depositDate || '').localeCompare(String(a.depositDate || ''))
          )
          .slice(0, 5);

        return {
          totalMembers,
          depositsThisMonth,
          totalCollected,
          pendingDeposits,
          recentDeposits
        };
      })
    );
  }
}
