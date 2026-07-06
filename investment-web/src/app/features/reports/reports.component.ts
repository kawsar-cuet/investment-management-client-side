import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepositService } from '@core/services/deposit.service';
import { Deposit } from '@core/models';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  loading = false;
  error = '';
  total = 0;
  count = 0;

  periodForm!: FormGroup;
  familyTotalForm!: FormGroup;
  familyTotal: number | string | null = null;

  deposits: Deposit[] = [];

  constructor(
    private fb: FormBuilder,
    private depositService: DepositService
  ) {}

  ngOnInit(): void {
    this.periodForm = this.fb.group({
      month: [new Date().getMonth() + 1, Validators.required],
      year: [new Date().getFullYear(), Validators.required]
    });
    this.familyTotalForm = this.fb.group({
      familyId: ['', Validators.required],
      month: [new Date().getMonth() + 1, Validators.required],
      year: [new Date().getFullYear(), Validators.required]
    });
  }

  runPeriodReport(): void {
    if (this.periodForm.invalid) return;
    const { month, year } = this.periodForm.value;
    this.loading = true;
    this.error = '';
    this.depositService.getByPeriod(month, year).subscribe({
      next: list => {
        this.deposits = list;
        this.count = list.length;
        this.total = list.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
        this.loading = false;
      },
      error: err => {
        this.error = err?.message || 'Failed to load deposits';
        this.loading = false;
      }
    });
  }

  runFamilyTotalReport(): void {
    if (this.familyTotalForm.invalid) return;
    const { familyId, month, year } = this.familyTotalForm.value;
    this.depositService.getFamilyTotal(familyId, month, year).subscribe({
      next: total => (this.familyTotal = total),
      error: () => {
        this.familyTotal = null;
        this.error = 'Failed to load family total';
      }
    });
  }

  exportCsv(): void {
    if (!this.deposits.length) return;
    const header = ['GUID', 'Amount', 'Member', 'Family', 'Month', 'Year', 'Date', 'Notes'];
    const rows = this.deposits.map(d => [
      d.guid,
      d.amount,
      d.memberGuid || '',
      d.familyGuid || '',
      d.depositMonth || '',
      d.depositYear || '',
      d.depositDate || '',
      (d.notes || '').replace(/,/g, ';')
    ]);
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deposits-${this.periodForm.value.month}-${this.periodForm.value.year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
