import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, catchError, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { DepositService } from '../../core/services/deposit.service';
import { FamilyService } from '../../core/services/family.service';
import { FriendGroupService } from '../../core/services/friend-group.service';
import { MemberService } from '../../core/services/member.service';
import { Deposit, CreateDepositRequest } from '../../core/models';
import { Member } from '../../core/models/member.model';
import { Family } from '../../core/models/family.model';
import { FriendGroup } from '../../core/models/friend-group.model';
import { extractHttpErrorMessage } from '../../core/utils/http-error';

@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.scss']
})
export class MemberDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  member: Member | null = null;
  family: Family | null = null;
  group: FriendGroup | null = null;
  families: Family[] = [];

  loading = true;
  error = '';
  success = '';

  isAdmin = false;
  editing = false;
  editForm!: FormGroup;
  memberTypes = ['FAMILY', 'FRIEND'];

  // ── Total deposit (no listing) ───────────────────────────────────────
  totalDeposit = 0;
  depositCount = 0;
  depositsLoading = false;

  // ── Single-deposit form (hidden behind a button) ─────────────────────
  showDepositForm = false;
  depositForm!: FormGroup;
  depositFormError = '';
  depositFormSaving = false;
  depositMonths = [
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
  depositYears: number[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    protected router: Router,
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

    this.editForm = this.fb.group({
      fullName: ['', Validators.required],
      familyId: ['', Validators.required],
      memberType: ['FAMILY', Validators.required],
      isFamilyHead: [false],
      shareCount: [0, [Validators.min(0)]],
      phoneNumber: [''],
      address: ['']
    });

    // Single-deposit form (member + family + group auto-set later).
    const today = new Date();
    const todayIso = today.toISOString().substring(0, 10);
    const currentYear = today.getFullYear();
    for (let y = currentYear - 5; y <= currentYear + 5; y++) {
      this.depositYears.push(y);
    }
    this.depositForm = this.fb.group({
      amount: [1000, [Validators.required, Validators.min(1)]],
      depositMonth: [today.getMonth() + 1, Validators.required],
      depositYear: [currentYear, Validators.required],
      depositDate: [todayIso, Validators.required],
      notes: ['']
    });

    // Edit-dropdown needs the full family list.
    this.loadFamilies();

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const guid = params.get('guid');
        if (guid) this.loadMember(guid);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFamilies(): void {
    this.familyService.list()
      .pipe(
        catchError(() => of([] as Family[])),
        takeUntil(this.destroy$)
      )
      .subscribe(families => (this.families = families ?? []));
  }

  loadMember(guid: string): void {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.member = null;
    this.family = null;
    this.group = null;
    this.totalDeposit = 0;
    this.depositCount = 0;

    this.memberService.getById(guid)
      .pipe(
        catchError(err => {
          this.error = extractHttpErrorMessage(err, 'Failed to load member.');
          this.loading = false;
          return of(null as Member | null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(member => {
        if (!member) return;
        this.member = member;
        this.loading = false;
        this.resolveFamily(member.familyId);
        this.loadMemberTotals(guid);
        this.editForm.patchValue({
          fullName: member.fullName ?? '',
          familyId: member.familyId ?? '',
          memberType: member.memberType ?? 'FAMILY',
          isFamilyHead: !!member.isFamilyHead,
          shareCount: member.shareCount ?? 0,
          phoneNumber: member.phoneNumber ?? '',
          address: member.address ?? ''
        });
      });
  }

  private resolveFamily(familyGuid?: string): void {
    if (!familyGuid) return;
    this.familyService.getById(familyGuid)
      .pipe(
        catchError(() => of(null as Family | null)),
        takeUntil(this.destroy$)
      )
      .subscribe(family => {
        this.family = family;
        if (family?.groupId) {
          this.friendGroupService.getById(family.groupId)
            .pipe(
              catchError(() => of(null as FriendGroup | null)),
              takeUntil(this.destroy$)
            )
            .subscribe(g => (this.group = g));
        }
      });
  }

  // ── Total deposit ────────────────────────────────────────────────────
  private loadMemberTotals(memberGuid: string): void {
    this.depositsLoading = true;
    this.depositService.getByMember(memberGuid)
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

  // ── Single-deposit (button-gated) ────────────────────────────────────
  toggleDepositForm(): void {
    if (!this.isAdmin || !this.member) return;
    this.showDepositForm = !this.showDepositForm;
    this.depositFormError = '';
    if (this.showDepositForm) this.resetDepositForm();
  }

  resetDepositForm(): void {
    const today = new Date();
    const todayIso = today.toISOString().substring(0, 10);
    this.depositForm.reset({
      amount: 1000,
      depositMonth: today.getMonth() + 1,
      depositYear: today.getFullYear(),
      depositDate: todayIso,
      notes: ''
    });
  }

  submitDeposit(): void {
    if (!this.member || !this.family || this.depositForm.invalid) return;

    // Prefer the family head as depositor; fall back to this member.
    const headId = this.family.familyHeadId ?? this.member.guid;
    const v = this.depositForm.value;
    const payload: CreateDepositRequest = {
      memberGuid: this.member.guid,
      familyGuid: this.family.guid,
      depositedByGuid: headId,
      amount: Number(v.amount),
      sharesCovered: 1,
      depositMonth: Number(v.depositMonth),
      depositYear: Number(v.depositYear),
      depositDate: v.depositDate,
      notes: v.notes || ''
    };
    this.depositFormSaving = true;
    this.depositFormError = '';
    this.depositService.create(payload).subscribe({
      next: () => {
        const amt = Number(v.amount);
        this.success = `Deposit of ${amt.toLocaleString()} recorded.`;
        this.depositFormSaving = false;
        this.showDepositForm = false;
        this.loadMemberTotals(this.member!.guid);
      },
      error: err => {
        this.depositFormSaving = false;
        this.depositFormError = extractHttpErrorMessage(err, 'Failed to create deposit.');
      }
    });
  }

  // ── Edit / delete member ─────────────────────────────────────────────
  startEdit(): void {
    if (!this.member) return;
    this.editing = true;
    this.error = '';
    this.success = '';
  }
  cancelEdit(): void {
    this.editing = false;
    if (this.member) {
      this.editForm.patchValue({
        fullName: this.member.fullName ?? '',
        familyId: this.member.familyId ?? '',
        memberType: this.member.memberType ?? 'FAMILY',
        isFamilyHead: !!this.member.isFamilyHead,
        shareCount: this.member.shareCount ?? 0,
        phoneNumber: this.member.phoneNumber ?? '',
        address: this.member.address ?? ''
      });
    }
  }
  saveEdit(): void {
    if (this.editForm.invalid || !this.member) return;
    const v = this.editForm.value;
    this.memberService.update(this.member.guid, {
      fullName: v.fullName,
      familyId: v.familyId,
      memberType: v.memberType,
      isFamilyHead: v.isFamilyHead,
      shareCount: Number(v.shareCount) || 0,
      phoneNumber: v.phoneNumber || undefined,
      address: v.address || undefined
    }).subscribe({
      next: () => {
        this.success = 'Member updated.';
        this.editing = false;
        this.loadMember(this.member!.guid);
      },
      error: err => (this.error = extractHttpErrorMessage(err, 'Failed to update member.'))
    });
  }

  delete(): void {
    if (!this.member) return;
    if (!confirm(`Delete member "${this.member.fullName}"? This cannot be undone.`)) return;
    this.memberService.delete(this.member.guid).subscribe({
      next: () => this.router.navigate(['/members']),
      error: err => (this.error = extractHttpErrorMessage(err, 'Failed to delete member.'))
    });
  }

  back(): void {
    this.router.navigate(['/members']);
  }

  initials(name?: string): string {
    return (name ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase() ?? '')
      .join('') || '?';
  }
}