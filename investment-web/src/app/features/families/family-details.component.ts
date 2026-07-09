import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, catchError, debounceTime, distinctUntilChanged, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { DepositService } from '../../core/services/deposit.service';
import { FamilyService } from '../../core/services/family.service';
import { FriendGroupService } from '../../core/services/friend-group.service';
import { MemberService } from '../../core/services/member.service';
import {
  Deposit,
  FamilyBulkDepositPreview,
  FamilyBulkDepositRequest
} from '../../core/models';
import { Family } from '../../core/models/family.model';
import { FriendGroup } from '../../core/models/friend-group.model';
import { Member } from '../../core/models/member.model';
import { extractHttpErrorMessage } from '../../core/utils/http-error';

@Component({
  selector: 'app-family-details',
  templateUrl: './family-details.component.html',
  styleUrls: ['./family-details.component.scss']
})
export class FamilyDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  family: Family | null = null;
  group: FriendGroup | null = null;
  loading = true;
  error = '';
  success = '';

  isAdmin = false;
  editing = false;
  editForm!: FormGroup;

  /** Fallback cache so the Group field has a name even if /groups/{id} 404s. */
  groupNameByGuid: { [guid: string]: string } = {};

  // ── Members ──────────────────────────────────────────────────────────
  members: Member[] = [];
  membersLoading = false;
  memberCount = 0;
  showCreateMember = false;
  createMemberForm!: FormGroup;
  memberTypes = ['FAMILY', 'FRIEND'];
  memberFormError = '';
  memberFormSaving = false;

  // ── Total deposit (no listing) ───────────────────────────────────────
  totalDeposit = 0;
  depositCount = 0;
  depositsLoading = false;

  // ── Bulk deposit form (hidden behind a button) ───────────────────────
  showBulkForm = false;
  bulkForm!: FormGroup;
  bulkFormError = '';
  bulkFormSaving = false;
  bulkPreview: FamilyBulkDepositPreview | null = null;
  bulkPreviewing = false;
  bulkMonths = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];
  bulkYears: number[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private familyService: FamilyService,
    private friendGroupService: FriendGroupService,
    private memberService: MemberService,
    private depositService: DepositService
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isAdmin = (user?.role ?? '').toUpperCase() === 'ADMIN';
      });

    // Edit form for the family itself.
    this.editForm = this.fb.group({
      familyName: ['', Validators.required],
      description: ['']
    });

    // Create-member inline form (family auto-set later).
    this.createMemberForm = this.fb.group({
      fullName: ['', Validators.required],
      memberType: ['FAMILY', Validators.required],
      isFamilyHead: [false],
      shareCount: [1, [Validators.min(0)]],
      phoneNumber: [''],
      address: ['']
    });

    // Bulk-deposit form (family + group auto-set later).
    const today = new Date();
    const todayIso = today.toISOString().substring(0, 10);
    const currentYear = today.getFullYear();
    for (let y = currentYear - 5; y <= currentYear + 5; y++) {
      this.bulkYears.push(y);
    }
    this.bulkForm = this.fb.group({
      totalAmount: [1000, [Validators.required, Validators.min(1)]],
      depositMonth: [today.getMonth() + 1, Validators.required],
      depositYear: [currentYear, Validators.required],
      depositDate: [todayIso, Validators.required],
      notes: ['']
    });

    // Live preview of the bulk deposit as the user types.
    this.bulkForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.refreshBulkPreview());

    // Best-effort populate the group-name cache so the Group field always has
    // something to show.
    this.friendGroupService.list()
      .pipe(
        catchError(() => of([] as FriendGroup[])),
        takeUntil(this.destroy$)
      )
      .subscribe(groups =>
        (this.groupNameByGuid = (groups ?? []).reduce(
          (m, g) => ({ ...m, [g.guid]: g.groupName }),
          {} as { [guid: string]: string }
        ))
      );

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const guid = params.get('guid');
        if (guid) this.load(guid);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Loading ──────────────────────────────────────────────────────────
  load(guid: string): void {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.family = null;
    this.group = null;
    this.members = [];
    this.totalDeposit = 0;
    this.depositCount = 0;

    this.familyService.getById(guid)
      .pipe(
        catchError(err => {
          this.error = extractHttpErrorMessage(err, 'Failed to load family.');
          this.loading = false;
          return of(null as Family | null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(family => {
        if (!family) return;
        this.family = family;
        this.loading = false;
        this.resolveGroup(family.groupId);
        this.loadMembers(family.guid);
        this.loadFamilyTotals(family.guid);
        this.editForm.patchValue({
          familyName: family.familyName,
          description: family.description ?? ''
        });
      });
  }

  private resolveGroup(groupGuid?: string): void {
    if (!groupGuid) return;
    this.friendGroupService.getById(groupGuid)
      .pipe(
        catchError(() => of(null as FriendGroup | null)),
        takeUntil(this.destroy$)
      )
      .subscribe(g => (this.group = g));
  }

  groupDisplay(): string {
    if (this.group?.groupName) return this.group.groupName;
    const gid = this.family?.groupId;
    if (gid && this.groupNameByGuid[gid]) return this.groupNameByGuid[gid];
    if (gid) return `Group ${gid.substring(0, 8)}…`;
    return '—';
  }

  // ── Members ──────────────────────────────────────────────────────────
  private loadMembers(familyGuid: string): void {
    this.membersLoading = true;
    this.memberService.getByFamilyId(familyGuid)
      .pipe(
        catchError(() => of([] as Member[])),
        takeUntil(this.destroy$)
      )
      .subscribe(list => {
        this.members = list ?? [];
        this.memberCount = this.members.length;
        this.membersLoading = false;
      });
  }

  toggleCreateMember(): void {
    if (!this.isAdmin || !this.family) return;
    this.showCreateMember = !this.showCreateMember;
    this.memberFormError = '';
    if (this.showCreateMember) {
      this.createMemberForm.reset({
        fullName: '',
        memberType: 'FAMILY',
        isFamilyHead: false,
        shareCount: 1,
        phoneNumber: '',
        address: ''
      });
    }
  }

  saveNewMember(): void {
    if (!this.family || this.createMemberForm.invalid) return;
    const v = this.createMemberForm.value;
    const payload = {
      familyId: this.family.guid,
      groupId: this.family.groupId,
      fullName: v.fullName,
      memberType: v.memberType,
      isFamilyHead: !!v.isFamilyHead,
      shareCount: Number(v.shareCount) || 0,
      phoneNumber: v.phoneNumber || undefined,
      address: v.address || undefined
    };
    this.memberFormSaving = true;
    this.memberFormError = '';
    this.memberService.create(payload).subscribe({
      next: () => {
        this.success = `Member "${v.fullName}" added.`;
        this.memberFormSaving = false;
        this.showCreateMember = false;
        this.loadMembers(this.family!.guid);
      },
      error: err => {
        this.memberFormSaving = false;
        this.memberFormError = extractHttpErrorMessage(err, 'Failed to create member.');
      }
    });
  }

  openMember(m: Member): void {
    this.router.navigate(['/members', m.guid]);
  }

  memberInitials(name?: string): string {
    return (name ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase() ?? '')
      .join('') || '?';
  }

  // ── Total deposit ────────────────────────────────────────────────────
  private loadFamilyTotals(familyGuid: string): void {
    this.depositsLoading = true;
    this.depositService.getByFamily(familyGuid)
      .pipe(
        catchError(() => of([] as Deposit[])),
        takeUntil(this.destroy$)
      )
      .subscribe(list => {
        const items = list ?? [];
        this.depositCount = items.length;
        this.totalDeposit = items.reduce(
          (s, d) => s + (Number(d?.amount) || 0),
          0
        );
        this.depositsLoading = false;
      });
  }

  // ── Bulk deposit (hidden behind button) ──────────────────────────────
  toggleBulkForm(): void {
    if (!this.isAdmin || !this.family) return;
    this.showBulkForm = !this.showBulkForm;
    this.bulkFormError = '';
    this.bulkPreview = null;
  }

  refreshBulkPreview(): void {
    if (!this.family) return;
    const total = Number(this.bulkForm.value?.totalAmount) || 0;
    if (total <= 0 || this.members.length === 0) {
      this.bulkPreview = null;
      return;
    }
    this.bulkPreviewing = true;
    this.depositService.previewFamilyBulkDeposit(this.family.guid, total)
      .pipe(
        catchError(() => of(null as FamilyBulkDepositPreview | null)),
        takeUntil(this.destroy$)
      )
      .subscribe(p => {
        this.bulkPreview = p;
        this.bulkPreviewing = false;
      });
  }

  familyHeadGuid(): string | null {
    return this.members.find(m => m.isFamilyHead)?.guid ?? null;
  }

  get canSubmitBulk(): boolean {
    return !!this.family
      && !!this.familyHeadGuid()
      && this.bulkForm.valid
      && (Number(this.bulkForm.value?.totalAmount) || 0) > 0
      && !!this.bulkPreview
      && !!this.bulkPreview.rows?.length
      && !this.bulkFormSaving;
  }

  submitBulk(): void {
    if (!this.canSubmitBulk || !this.family) return;
    const headId = this.familyHeadGuid();
    if (!headId) {
      this.bulkFormError = 'This family has no family head; bulk deposit cannot proceed.';
      return;
    }
    const v = this.bulkForm.value;
    const payload: FamilyBulkDepositRequest = {
      groupId: this.family.groupId,
      familyId: this.family.guid,
      depositedById: headId,
      totalAmount: Number(v.totalAmount),
      depositMonth: Number(v.depositMonth),
      depositYear: Number(v.depositYear),
      depositDate: v.depositDate,
      notes: v.notes || ''
    };
    this.bulkFormSaving = true;
    this.bulkFormError = '';
    this.depositService.createFamilyBulkDeposit(payload).subscribe({
      next: created => {
        const n = Array.isArray(created) ? created.length : (this.bulkPreview?.rows.length ?? 0);
        this.success = `Recorded ${n} deposit${n === 1 ? '' : 's'} across the family.`;
        this.bulkFormSaving = false;
        this.showBulkForm = false;
        this.bulkPreview = null;
        this.loadFamilyTotals(this.family!.guid);
        this.bulkForm.patchValue({ notes: '' });
      },
      error: err => {
        this.bulkFormSaving = false;
        this.bulkFormError = extractHttpErrorMessage(err, 'Failed to record bulk deposit.');
      }
    });
  }

  // ── Edit / delete family ─────────────────────────────────────────────
  startEdit(): void {
    if (!this.family) return;
    this.editing = true;
    this.error = '';
    this.success = '';
  }
  cancelEdit(): void {
    this.editing = false;
    if (this.family) {
      this.editForm.patchValue({
        familyName: this.family.familyName,
        description: this.family.description ?? ''
      });
    }
  }
  saveEdit(): void {
    if (this.editForm.invalid || !this.family) return;
    const v = this.editForm.value;
    this.familyService.update(this.family.guid, {
      familyName: v.familyName,
      description: v.description || ''
    }).subscribe({
      next: () => {
        this.success = 'Family updated.';
        this.editing = false;
        this.load(this.family!.guid);
      },
      error: err => {
        this.error = extractHttpErrorMessage(err, 'Failed to update family.');
      }
    });
  }

  delete(): void {
    if (!this.family) return;
    if (!confirm(`Delete family "${this.family.familyName}"? This cannot be undone.`)) return;
    this.familyService.delete(this.family.guid).subscribe({
      next: () => this.router.navigate(['/families']),
      error: err => (this.error = extractHttpErrorMessage(err, 'Failed to delete family.'))
    });
  }

  back(): void {
    this.router.navigate(['/families']);
  }
}