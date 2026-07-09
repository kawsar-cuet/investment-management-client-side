import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { DepositService } from '@core/services/deposit.service';
import { FriendGroupService } from '@core/services/friend-group.service';
import { FamilyService } from '@core/services/family.service';
import { MemberService } from '@core/services/member.service';
import { AuthService } from '@core/services/auth.service';
import {
  Deposit,
  FamilyBulkDepositRequest,
  FamilyBulkDepositPreview,
  FriendGroup,
  Family,
  Member,
  DepositSearchResult
} from '@core/models';
import { extractHttpErrorMessage } from '@core/utils/http-error';

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

  groups: FriendGroup[] = [];
  familiesByGroup: Family[] = [];
  membersByFamily: Member[] = [];

  selectedFamilyHeadId: string | null = null;

  // Single deposit form
  singleForm!: FormGroup;
  // Bulk deposit form
  bulkForm!: FormGroup;

  // Preview state
  preview: FamilyBulkDepositPreview | null = null;
  previewing = false;
  previewError = '';

  // Bulk-deposit UX state
  bulkJustSubmitted = false; // becomes true after a successful bulk submit; hides "Reset" until reset/clear

  // Lookup forms (kept from prior version)
  lookupForm!: FormGroup;
  memberLookupForm!: FormGroup;
  familyLookupForm!: FormGroup;
  periodForm!: FormGroup;
  familyTotalForm!: FormGroup;

  editing: Deposit | null = null;
  editForm!: FormGroup;

  // Month / year options
  months = Array.from({ length: 12 }, (_, i) => i + 1);
  years: number[] = [];
  knownGuids: string[] = [];

  // Tabs
  activeTab: 'single' | 'bulk' | 'all' = 'single';

  // RBAC
  isAdmin = false;

  // All Deposits search state
  searchForm!: FormGroup;
  searchLoading = false;
  searchError = '';
  searchResults: DepositSearchResult[] = [];
  groupedResults: { familyId: string; familyName: string; rows: DepositSearchResult[]; total: number; }[] = [];
  searchGrandTotal = 0;
  expandedFamilies: Set<string> = new Set<string>();
  private searchDebounceSub: { unsubscribe(): void } | null = null;

  constructor(
    private fb: FormBuilder,
    private depositService: DepositService,
    private friendGroupService: FriendGroupService,
    private familyService: FamilyService,
    private memberService: MemberService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const todayIso = today.toISOString().substring(0, 10);
    const currentYear = today.getFullYear();
    // Years: 5 years back, current, 5 years forward
    for (let y = currentYear - 5; y <= currentYear + 5; y++) {
      this.years.push(y);
    }

    // ── SINGLE form ───────────────────────────────────────────────────────
    this.singleForm = this.fb.group({
      groupId: ['', Validators.required],
      familyId: ['', Validators.required],
      memberId: ['', Validators.required],
      amount: [1000, [Validators.required, Validators.min(1)]],
      depositMonth: [today.getMonth() + 1, Validators.required],
      depositYear: [currentYear, Validators.required],
      depositDate: [todayIso, Validators.required],
      notes: ['']
    });

    // ── BULK form ─────────────────────────────────────────────────────────
    this.bulkForm = this.fb.group({
      groupId: ['', Validators.required],
      familyId: ['', Validators.required],
      totalAmount: [0, [Validators.required, Validators.min(0)]],
      depositMonth: [today.getMonth() + 1, Validators.required],
      depositYear: [currentYear, Validators.required],
      depositDate: [todayIso, Validators.required],
      notes: ['']
    });

    this.lookupForm = this.fb.group({ guid: ['', Validators.required] });
    this.memberLookupForm = this.fb.group({ memberId: ['', Validators.required] });
    this.familyLookupForm = this.fb.group({ familyId: ['', Validators.required] });
    this.periodForm = this.fb.group({
      month: [today.getMonth() + 1, Validators.required],
      year: [currentYear, Validators.required]
    });
    this.familyTotalForm = this.fb.group({
      familyId: ['', Validators.required],
      month: [today.getMonth() + 1, Validators.required],
      year: [currentYear, Validators.required]
    });

    this.editForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0)]],
      notes: ['']
    });

    // Role flag (drives RBAC gates in the template)
    const me = this.authService.getCurrentUser();
    this.isAdmin = (me?.role || '').toUpperCase() === 'ADMIN';

    // All-Deposits search form
    this.searchForm = this.fb.group({
      keyword: [''],
      month: [''],
      year: [''],
      status: ['ACTIVE']
    });

    // Auto-load with current month/year preselected so USER role still sees something useful
    this.searchForm.patchValue({
      month: today.getMonth() + 1,
      year: currentYear
    });

    // Debounced keyword search (300ms) so typing feels snappy but doesn't spam the API
    this.searchDebounceSub = this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) =>
          a.keyword === b.keyword &&
          a.month === b.month &&
          a.year === b.year &&
          a.status === b.status
        )
      )
      .subscribe(() => this.runSearch());

    // Kick off an initial search so the All Deposits tab shows results on load
    this.runSearch();

    // Load groups
    this.friendGroupService.list().subscribe({
      next: list => {
        this.groups = list || [];
        // Auto-select first group
        if (this.groups.length > 0) {
          this.singleForm.patchValue({ groupId: this.groups[0].guid });
          this.bulkForm.patchValue({ groupId: this.groups[0].guid });
          this.onSingleGroupChange();
          this.onBulkGroupChange();
        }
      },
      error: err => this.error = extractHttpErrorMessage(err, 'Failed to load groups')
    });

    // Watch for changes to single form's groupId / familyId to cascade dropdowns
    this.singleForm.get('groupId')!.valueChanges.subscribe(() => this.onSingleGroupChange());
    this.singleForm.get('familyId')!.valueChanges.subscribe(() => this.onSingleFamilyChange());
    this.bulkForm.get('groupId')!.valueChanges.subscribe(() => this.onBulkGroupChange());
    this.bulkForm.get('familyId')!.valueChanges.subscribe(() => this.onBulkFamilyChange());

    // Live preview debounce
    this.bulkForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged((a, b) =>
          a.familyId === b.familyId &&
          a.totalAmount === b.totalAmount &&
          a.depositMonth === b.depositMonth &&
          a.depositYear === b.depositYear &&
          a.depositDate === b.depositDate
        )
      )
      .subscribe(() => this.refreshPreview());
  }

  // ── SINGLE form cascade handlers ───────────────────────────────────────
  onSingleGroupChange(): void {
    const groupId = this.singleForm.get('groupId')!.value;
    if (!groupId) {
      this.familiesByGroup = [];
      this.membersByFamily = [];
      this.singleForm.patchValue({ familyId: '', memberId: '' });
      return;
    }
    this.familyService.getByGroup(groupId).subscribe({
      next: list => {
        this.familiesByGroup = list || [];
        // Auto-select first family
        if (this.familiesByGroup.length > 0) {
          this.singleForm.patchValue({ familyId: this.familiesByGroup[0].guid });
          this.onSingleFamilyChange();
        } else {
          this.singleForm.patchValue({ familyId: '' });
          this.membersByFamily = [];
          this.singleForm.patchValue({ memberId: '' });
        }
      },
      error: err => this.error = extractHttpErrorMessage(err, 'Failed to load families')
    });
  }

  onSingleFamilyChange(): void {
    const familyId = this.singleForm.get('familyId')!.value;
    if (!familyId) {
      this.membersByFamily = [];
      this.singleForm.patchValue({ memberId: '' });
      this.selectedFamilyHeadId = null;
      return;
    }
    this.memberService.getByFamilyId(familyId).subscribe({
      next: list => {
        this.membersByFamily = list || [];
        const head = this.membersByFamily.find(m => m.isFamilyHead);
        this.selectedFamilyHeadId = head?.guid || null;
        // Auto-select family head if available
        if (this.selectedFamilyHeadId) {
          this.singleForm.patchValue({ memberId: this.selectedFamilyHeadId });
        } else if (this.membersByFamily.length > 0) {
          this.singleForm.patchValue({ memberId: this.membersByFamily[0].guid });
        } else {
          this.singleForm.patchValue({ memberId: '' });
        }
      },
      error: err => this.error = extractHttpErrorMessage(err, 'Failed to load members')
    });
  }

  // ── BULK form cascade handlers ────────────────────────────────────────
  onBulkGroupChange(): void {
    const groupId = this.bulkForm.get('groupId')!.value;
    if (!groupId) {
      this.familiesByGroup = [];
      this.bulkForm.patchValue({ familyId: '' });
      return;
    }
    this.familyService.getByGroup(groupId).subscribe({
      next: list => {
        this.familiesByGroup = list || [];
        if (this.familiesByGroup.length > 0) {
          this.bulkForm.patchValue({ familyId: this.familiesByGroup[0].guid });
          this.onBulkFamilyChange();
        } else {
          this.bulkForm.patchValue({ familyId: '' });
          this.preview = null;
        }
      },
      error: err => this.error = extractHttpErrorMessage(err, 'Failed to load families')
    });
  }

  onBulkFamilyChange(): void {
    const familyId = this.bulkForm.get('familyId')!.value;
    if (!familyId) {
      this.preview = null;
      return;
    }
    this.memberService.getByFamilyId(familyId).subscribe({
      next: list => {
        const head = (list || []).find(m => m.isFamilyHead);
        this.selectedFamilyHeadId = head?.guid || null;
        this.refreshPreview();
      },
      error: err => this.error = extractHttpErrorMessage(err, 'Failed to load members')
    });
  }

  refreshPreview(): void {
    this.previewError = '';
    const v = this.bulkForm.value;
    if (!v.familyId || !v.totalAmount || v.totalAmount <= 0) {
      this.preview = null;
      return;
    }
    this.bulkJustSubmitted = false; // user changed the form → hide the Reset button again
    this.previewing = true;
    this.depositService
      .previewFamilyBulkDeposit(v.familyId, Number(v.totalAmount))
      .subscribe({
        next: p => {
          this.preview = p;
          this.previewing = false;
        },
        error: err => {
          this.preview = null;
          this.previewError = extractHttpErrorMessage(err, 'Preview not available');
          this.previewing = false;
        }
      });
  }

  // ── Submission ─────────────────────────────────────────────────────────
  submitSingle(): void {
    if (this.singleForm.invalid) {
      this.error = 'Please fill in all required fields';
      return;
    }
    const v = this.singleForm.value;
    // Backend's `deposited_by_id` is a FK to members_hdr.guid, NOT users_hdr.guid.
    // Prefer the selected family-head member; fall back to the selected member if no head is set.
    const depositedByGuid = this.selectedFamilyHeadId || v.memberId;
    const payload = {
      memberGuid: v.memberId,
      familyGuid: v.familyId,
      depositedByGuid,
      amount: Number(v.amount),
      sharesCovered: 1,
      depositMonth: Number(v.depositMonth),
      depositYear: Number(v.depositYear),
      depositDate: v.depositDate,
      notes: v.notes || ''
    };
    this.error = '';
    this.success = '';
    this.depositService.create(payload).subscribe({
      next: d => {
        this.success = `Deposit created: ${d.amount} — recorded`;
        if (d.guid && !this.knownGuids.includes(d.guid)) this.knownGuids.push(d.guid);
        this.singleForm.patchValue({
          amount: 1000,
          notes: ''
        });
        this.loadKnown();
      },
      error: err => {
        this.error = extractHttpErrorMessage(err, 'Failed to create deposit');
      }
    });
  }

  submitBulk(): void {
    if (!this.canSubmitBulk) {
      this.error = 'Please choose a family with a family head, and enter a valid total amount';
      return;
    }
    const v = this.bulkForm.value;
    const payload: FamilyBulkDepositRequest = {
      groupId: v.groupId,
      familyId: v.familyId,
      depositedById: this.selectedFamilyHeadId!,
      totalAmount: Number(v.totalAmount),
      depositMonth: Number(v.depositMonth),
      depositYear: Number(v.depositYear),
      depositDate: v.depositDate,
      notes: v.notes || '',
      createdBySubjectGuid: this.currentUserId
    };
    this.error = '';
    this.success = '';
    this.depositService.createFamilyBulkDeposit(payload).subscribe({
      next: list => {
        const cnt = list?.length || 0;
        this.success = `Created ${cnt} deposits — total ${v.totalAmount} distributed across the family`;
        (list || []).forEach(d => {
          if (d.guid && !this.knownGuids.includes(d.guid)) this.knownGuids.push(d.guid);
        });
        // Keep the form populated so the user can see what was just submitted.
        // Replace "Create" button with a "Reset" button.
        this.bulkJustSubmitted = true;
        this.loadKnown();
      },
      error: err => {
        this.error = extractHttpErrorMessage(err, 'Failed to create bulk deposits');
      }
    });
  }

  /** Whether the bulk form is ready to submit (preview valid + amount > 0 + family head known). */
  get canSubmitBulk(): boolean {
    const total = Number(this.bulkForm?.get('totalAmount')?.value || 0);
    return !this.bulkForm.invalid
      && total > 0
      && !!this.selectedFamilyHeadId
      && !!this.preview;
  }

  /** Clear the bulk form back to its initial empty state. */
  resetBulk(): void {
    const today = new Date();
    const todayIso = today.toISOString().substring(0, 10);
    this.bulkForm.reset({
      groupId: '',
      familyId: '',
      totalAmount: 0,
      depositMonth: today.getMonth() + 1,
      depositYear: today.getFullYear(),
      depositDate: todayIso,
      notes: ''
    });
    this.preview = null;
    this.previewing = false;
    this.previewError = '';
    this.bulkJustSubmitted = false;
    // Keep the user's selected group auto-pick (matches ngOnInit behaviour)
    if (this.groups.length > 0) {
      this.bulkForm.patchValue({ groupId: this.groups[0].guid });
      this.onBulkGroupChange();
    }
  }

  private get currentUserId(): string {
    const u = this.authService.getCurrentUser();
    return u?.id || u?.userId || u?.guid || '';
  }

  loadKnown(): void {
    if (this.knownGuids.length === 0) {
      this.deposits = [];
      return;
    }
    this.loading = true;
    this.error = '';
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

  // Lookup tabs (kept)
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

  /**
   * Start editing a row from the All Deposits search tab.
   * Maps DepositSearchResult -> Deposit so the existing editForm + saveEdit
   * (Deposit) flow also works. Only `amount` and `notes` are editable;
   * memberGuid/familyGuid/period are copied as-is from the search row.
   */
  startSearchEdit(row: DepositSearchResult): void {
    const asDeposit: Deposit = {
      guid: row.guid,
      memberGuid: row.memberId,
      familyGuid: row.familyId,
      depositedByGuid: row.depositedById,
      amount: row.amount,
      sharesCovered: row.sharesCovered,
      depositMonth: row.depositMonth,
      depositYear: row.depositYear,
      depositDate: row.depositDate,
      notes: row.notes,
      status: row.status
    };
    this.editing = asDeposit;
    this.editForm.patchValue({ amount: row.amount, notes: row.notes || '' });
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
        this.runSearch();
      },
      error: () => (this.error = 'Failed to update deposit')
    });
  }

  /**
   * Save edited row from the All Deposits tab.
   * Fetches the full record first to obtain `revision` (required by the
   * backend's update validator) and to preserve fields the search row
   * doesn't carry, then PUTs the merged payload and refreshes the search.
   */
  saveSearchEdit(): void {
    if (!this.editing || this.editForm.invalid) return;
    const guid = this.editing.guid;
    this.depositService.getById(guid).subscribe({
      next: (full) => {
        const payload: Deposit = {
          ...full,
          amount: this.editForm.value.amount,
          notes: this.editForm.value.notes
        };
        this.depositService.update(guid, payload).subscribe({
          next: () => {
            this.success = 'Deposit updated';
            this.editing = null;
            this.editForm.reset();
            this.runSearch();
          },
          error: () => (this.error = 'Failed to update deposit')
        });
      },
      error: () => (this.error = 'Failed to load deposit for editing')
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

  /**
   * Delete a row from the All Deposits tab with confirmation,
   * then refresh the grouped search results.
   */
  deleteSearchRow(row: DepositSearchResult): void {
    const label = `${row.memberName} · ${row.depositMonth}/${row.depositYear} · ${row.amount}`;
    if (!confirm(`Delete this deposit?\n${label}`)) return;
    this.depositService.delete(row.guid).subscribe({
      next: () => {
        this.success = 'Deposit deleted';
        this.runSearch();
      },
      error: () => (this.error = 'Failed to delete deposit')
    });
  }

  // ── ALL DEPOSITS SEARCH ───────────────────────────────────────────────
  runSearch(): void {
    const v = this.searchForm.value;
    const query = {
      keyword: v.keyword || '',
      month: v.month ? Number(v.month) : undefined,
      year: v.year ? Number(v.year) : undefined,
      status: v.status || undefined
    };
    this.searchLoading = true;
    this.searchError = '';
    this.depositService.search(query).subscribe({
      next: (rows) => {
        this.searchResults = rows || [];
        this.groupResultsByFamily();
        this.searchLoading = false;
      },
      error: (err) => {
        this.searchResults = [];
        this.groupedResults = [];
        this.searchGrandTotal = 0;
        this.searchLoading = false;
        this.searchError = extractHttpErrorMessage(err, 'Search failed');
      }
    });
  }

  clearSearch(): void {
    const today = new Date();
    this.searchForm.reset({
      keyword: '',
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      status: 'ACTIVE'
    });
    this.runSearch();
  }

  private groupResultsByFamily(): void {
    const byFamily = new Map<string, { familyId: string; familyName: string; rows: DepositSearchResult[]; total: number; }>();
    let grand = 0;
    for (const row of this.searchResults) {
      grand += Number(row.amount) || 0;
      const key = row.familyId || 'unassigned';
      if (!byFamily.has(key)) {
        byFamily.set(key, {
          familyId: row.familyId,
          familyName: row.familyName || '(unassigned)',
          rows: [],
          total: 0
        });
      }
      const bucket = byFamily.get(key)!;
      bucket.rows.push(row);
      bucket.total += Number(row.amount) || 0;
    }
    // Sort families alphabetically; sort each family's rows by year desc, month desc, date desc
    this.groupedResults = Array.from(byFamily.values())
      .sort((a, b) => a.familyName.localeCompare(b.familyName))
      .map(g => ({
        ...g,
        rows: g.rows.sort((a, b) => {
          const y = (b.depositYear || 0) - (a.depositYear || 0);
          if (y !== 0) return y;
          const m = (b.depositMonth || 0) - (a.depositMonth || 0);
          if (m !== 0) return m;
          return String(b.depositDate || '').localeCompare(String(a.depositDate || ''));
        })
      }));
    this.searchGrandTotal = grand;
  }

  toggleFamily(familyId: string): void {
    if (this.expandedFamilies.has(familyId)) {
      this.expandedFamilies.delete(familyId);
    } else {
      this.expandedFamilies.add(familyId);
    }
  }

  isFamilyExpanded(familyId: string): boolean {
    return this.expandedFamilies.has(familyId);
  }

  trackByGuid = <T extends { guid?: string; familyId?: string }>(_i: number, row: T): string => {
    return row.guid || row.familyId || String(_i);
  }
}
