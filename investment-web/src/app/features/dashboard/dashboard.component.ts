import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardStats } from '@core/services/dashboard.service';
import { DepositSearchResult } from '@core/models';
import { extractHttpErrorMessage } from '@core/utils/http-error';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = false;
  error = '';
  stats: DashboardStats = {
    totalMembers: 0,
    depositsThisMonth: 0,
    totalCollected: 0,
    pendingDeposits: 0,
    recentDeposits: []
  };

  /** Friendly labels for the 12 months — used in the Recent Deposits dates. */
  monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.error = '';
    this.dashboardService.loadStats().subscribe({
      next: stats => {
        this.stats = stats;
        this.loading = false;
      },
      error: err => {
        this.error = extractHttpErrorMessage(err, 'Failed to load dashboard stats');
        this.loading = false;
      }
    });
  }

  /** Format a BigDecimal-ish value (number or string) as 1,234.50. */
  fmtAmount(value: number | string | null | undefined): string {
    const n = Number(value ?? 0);
    if (!isFinite(n)) return '0.00';
    return n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /** First 2 letters of a person's name, uppercased — used for the avatar bubble. */
  initials(name?: string | null): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /**
   * Render the deposit date for a Recent Deposits row.
   * Prefers the actual `depositDate` (YYYY-MM-DD) and falls back to
   * "{month-name} {year}" so the UI always shows *something* meaningful.
   */
  formatRecentDate(row: DepositSearchResult): string {
    if (row.depositDate) {
      // Backend returns ISO dates like "2026-07-09"; render as "Jul 9, 2026".
      const parts = String(row.depositDate).substring(0, 10).split('-');
      if (parts.length === 3) {
        const y = Number(parts[0]);
        const m = Number(parts[1]);
        const d = Number(parts[2]);
        if (y && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          return `${this.monthNames[m - 1]} ${d}, ${y}`;
        }
      }
      return String(row.depositDate);
    }
    if (row.depositMonth && row.depositYear) {
      return `${this.monthNames[row.depositMonth - 1] ?? row.depositMonth} ${row.depositYear}`;
    }
    return '';
  }
}
