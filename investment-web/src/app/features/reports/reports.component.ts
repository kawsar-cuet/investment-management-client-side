import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FamilyService } from '@core/services/family.service';
import { ReportsService } from '@core/services/reports.service';
import {
  Family,
  FamilyReportResponse,
  FamilyReportRow
} from '@core/models';
import { extractHttpErrorMessage } from '@core/utils/http-error';

/**
 * Family-wise summary report page.
 *
 * Shows one row per family with a per-member breakdown on demand.
 * Filters (all optional): year and family.
 * Default: all families, all years.
 */
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  loading = false;
  error = '';
  report: FamilyReportResponse | null = null;
  families: Family[] = [];

  // Year options: current year and previous 4 years, plus the "All years" sentinel.
  readonly yearOptions: (number | null)[];

  filterForm!: FormGroup;

  // Track which families are expanded (by familyId).
  expandedFamilies = new Set<string>();

  constructor(
    private fb: FormBuilder,
    private familyService: FamilyService,
    private reportsService: ReportsService
  ) {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = currentYear; y >= currentYear - 4; y--) {
      years.push(y);
    }
    this.yearOptions = [null, ...years]; // null => "All years"
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      year: [null],
      familyId: ['']
    });
    this.loadFamilies();
    this.load();
  }

  /** Fetch the list of families for the family filter dropdown. */
  loadFamilies(): void {
    this.familyService.list().subscribe({
      next: list => (this.families = list ?? []),
      error: () => (this.families = [])
    });
  }

  /** Run the report with the current filter form values. */
  load(): void {
    if (this.filterForm.invalid) return;
    const { year, familyId } = this.filterForm.value;
    this.loading = true;
    this.error = '';
    this.reportsService
      .getFamilySummary({
        year: year ?? null,
        familyId: familyId || null
      })
      .subscribe({
        next: r => {
          this.report = r;
          // Collapse any expanded rows on a fresh query - their members may no
          // longer be in the result set.
          this.expandedFamilies.clear();
          this.loading = false;
        },
        error: err => {
          this.error = extractHttpErrorMessage(err, 'Failed to load family summary report');
          this.report = null;
          this.loading = false;
        }
      });
  }

  /** Reset filters to defaults and re-run. */
  clearFilters(): void {
    this.filterForm.reset({ year: null, familyId: '' });
    this.load();
  }

  /** Toggle the expanded state of a family row. */
  toggleFamily(familyId: string): void {
    if (this.expandedFamilies.has(familyId)) {
      this.expandedFamilies.delete(familyId);
    } else {
      this.expandedFamilies.add(familyId);
    }
  }

  isExpanded(familyId: string): boolean {
    return this.expandedFamilies.has(familyId);
  }

  expandAll(): void {
    if (!this.report) return;
    this.report.rows.forEach(r => this.expandedFamilies.add(r.familyId));
  }

  collapseAll(): void {
    this.expandedFamilies.clear();
  }

  /** TrackBy helpers for the two *ngFor lists. */
  trackByFamilyId = (_: number, r: FamilyReportRow) => r.familyId;
  trackByMemberId = (_: number, m: { memberId: string }) => m.memberId;

  /** Format a numeric amount safely (handles string | number | undefined). */
  fmt(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '-';
    const n = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(n)) return String(value);
    return n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
