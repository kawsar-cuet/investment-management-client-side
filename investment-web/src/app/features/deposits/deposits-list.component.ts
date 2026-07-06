import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepositService } from '@core/services/deposit.service';
import { AuthService } from '@core/services/auth.service';
import { Deposit, FamilyBulkDepositRequest } from '@core/models';

@Component({
  selector: 'app-deposits-list',
  templateUrl: './deposits-list.component.html',
  styleUrls: ['./deposits-list.component.scss']
})
export class DepositsListComponent implements OnInit {
  deposits: Deposit[] = [];
  loading = false;
  error = '';
  success = '';
  familyTotal: number | string | null = null;

  knownGuids: string[] = [];

  createForm!: FormGroup;
  lookupForm!: FormGroup;
  memberLookupForm!: FormGroup;
  familyLookupForm!: FormGroup;
  periodForm!: FormGroup;
  familyTotalForm!: FormGroup;
  bulkForm!: FormGroup;

  editing: Deposit | null = null;
  editForm!: FormGroup;
  showBulk = false;

  constructor(
    private fb: FormBuilder,
    private depositService: DepositService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const today = new Date().toISOString().substring(0, 10);
    this.createForm = this.fb.group({
      memberGuid: [''],
      familyGuid: [''],
      depositedByGuid: [''],
      amount: [1000, [Validators.required, Validators.min(0)]],
      sharesCovered: [1],
      depositMonth: [new Date().getMonth() + 1],
      depositYear: [new Date().getFullYear()],
      depositDate: [today],
      notes: ['']
    });
    this.lookupForm = this.fb.group({ guid: ['', Validators.required] });
    this.memberLookupForm = this.fb.group({ memberId: ['', Validators.required] });
    this.familyLookupForm = this.fb.group({ familyId: ['', Validators.required] });
    this.periodForm = this.fb.group({
      month: [new Date().getMonth() + 1, Validators.required],
      year: [new Date().getFullYear(), Validators.required]
    });
    this.familyTotalForm = this.fb.group({
      familyId: ['', Validators.required],
      month: [new Date().getMonth() + 1, Validators.required],
      year: [new Date().getFullYear(), Validators.required]
    });
    this.bulkForm = this.fb.group({
      familyId: ['', Validators.required],
      depositedById: ['', Validators.required],
      amountPerShare: [1000, [Validators.required, Validators.min(0)]],
      depositMonth: [new Date().getMonth() + 1, Validators.required],
      depositYear: [new Date().getFullYear(), Validators.required],
      depositDate: [today, Validators.required],
      createdBySubjectGuid: ['', Validators.required]
    });
    this.editForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  private get currentUserId(): string {
    const u = this.authService.getCurrentUser();
    return u?.id || u?.userId || u?.guid || '';
  }

  loadKnown(): void {
    this.loading = true;
    this.error = '';
    if (this.knownGuids.length === 0) {
      this.loading = false;
      this.deposits = [];
      return;
    }
    const collected: Deposit[] = [];
    let done = 0;
    let fails = 0;
    this.knownGuids.forEach(id => {
      this.depositService.getById(id).subscribe({
        next: d => collected.push(d),
        error: () => fails++,
        complete: () => {
          done++;
          if (done === this.knownGuids.length) {
            this.deposits = collected;
            this.loading = false;
            if (fails > 0) this.error = `${fails} deposit(s) could not be loaded`;
          }
        }
      });
    });
  }

  create(): void {
    if (this.createForm.invalid) return;
    const v = this.createForm.value;
    if (!v.memberGuid) delete v.memberGuid;
    if (!v.familyGuid) delete v.familyGuid;
    if (!v.depositedByGuid) v.depositedByGuid = this.currentUserId;
    this.depositService.create(v).subscribe({
      next: d => {
        this.success = `Deposit created: ${d.amount}`;
        if (d.guid && !this.knownGuids.includes(d.guid)) this.knownGuids.push(d.guid);
        this.createForm.get('amount')?.setValue(1000);
        this.createForm.get('notes')?.setValue('');
        this.loadKnown();
      },
      error: err => (this.error = err?.message || 'Failed to create deposit')
    });
  }

  createBulk(): void {
    if (this.bulkForm.invalid) return;
    const payload: FamilyBulkDepositRequest = { ...this.bulkForm.value } as any;
    this.depositService.createFamilyBulkDeposit(payload).subscribe({
      next: list => {
        this.success = `Created ${list.length} deposits for the family`;
        list.forEach(d => { if (d.guid && !this.knownGuids.includes(d.guid)) this.knownGuids.push(d.guid); });
        this.loadKnown();
        this.showBulk = false;
      },
      error: err => (this.error = err?.message || 'Failed to create bulk deposits')
    });
  }

  lookup(): void {
    if (this.lookupForm.invalid) return;
    const id = this.lookupForm.value.guid.trim();
    this.depositService.getById(id).subscribe({
      next: d => {
        if (!this.knownGuids.includes(d.guid)) this.knownGuids.push(d.guid);
        this.success = 'Found deposit';
        this.loadKnown();
      },
      error: () => (this.error = 'Deposit not found')
    });
  }

  findByMember(): void {
    if (this.memberLookupForm.invalid) return;
    const id = this.memberLookupForm.value.memberId.trim();
    this.depositService.getByMember(id).subscribe({
      next: list => {
        list.forEach(d => { if (!this.knownGuids.includes(d.guid)) this.knownGuids.push(d.guid); });
        this.success = `Found ${list.length} deposit(s) for that member`;
        this.loadKnown();
      },
      error: () => (this.error = 'No deposits found for that member')
    });
  }

  findByFamily(): void {
    if (this.familyLookupForm.invalid) return;
    const id = this.familyLookupForm.value.familyId.trim();
    this.depositService.getByFamily(id).subscribe({
      next: list => {
        list.forEach(d => { if (!this.knownGuids.includes(d.guid)) this.knownGuids.push(d.guid); });
        this.success = `Found ${list.length} deposit(s) for that family`;
        this.loadKnown();
      },
      error: () => (this.error = 'No deposits found for that family')
    });
  }

  findByPeriod(): void {
    if (this.periodForm.invalid) return;
    const { month, year } = this.periodForm.value;
    this.depositService.getByPeriod(month, year).subscribe({
      next: list => {
        list.forEach(d => { if (!this.knownGuids.includes(d.guid)) this.knownGuids.push(d.guid); });
        this.success = `Found ${list.length} deposit(s) for ${month}/${year}`;
        this.loadKnown();
      },
      error: () => (this.error = 'No deposits for that period')
    });
  }

  findFamilyTotal(): void {
    if (this.familyTotalForm.invalid) return;
    const { familyId, month, year } = this.familyTotalForm.value;
    this.depositService.getFamilyTotal(familyId, month, year).subscribe({
      next: total => {
        this.familyTotal = total;
        this.success = `Family total for ${month}/${year}: ${total}`;
      },
      error: () => {
        this.familyTotal = null;
        this.error = 'Failed to fetch family total';
      }
    });
  }

  startEdit(d: Deposit): void {
    this.editing = { ...d };
    this.editForm.patchValue({ amount: d.amount, notes: d.notes || '' });
  }

  cancelEdit(): void {
    this.editing = null;
    this.editForm.reset();
  }

  saveEdit(): void {
    if (!this.editing || this.editForm.invalid) return;
    const payload = { ...this.editing, ...this.editForm.value };
    this.depositService.update(this.editing.guid, payload).subscribe({
      next: () => {
        this.success = 'Deposit updated';
        this.editing = null;
        this.editForm.reset();
        this.loadKnown();
      },
      error: () => (this.error = 'Failed to update deposit')
    });
  }

  delete(d: Deposit): void {
    if (!confirm(`Delete deposit of ${d.amount}?`)) return;
    this.depositService.delete(d.guid).subscribe({
      next: () => {
        this.knownGuids = this.knownGuids.filter(x => x !== d.guid);
        this.loadKnown();
        this.success = 'Deposit deleted';
      },
      error: () => (this.error = 'Failed to delete deposit')
    });
  }
}
