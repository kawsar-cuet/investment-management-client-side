import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, catchError, of, takeUntil } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { FriendGroupService } from '../../core/services/friend-group.service';
import { FamilyService } from '../../core/services/family.service';
import { MemberService } from '../../core/services/member.service';
import { FriendGroup } from '../../core/models/friend-group.model';
import { Family } from '../../core/models/family.model';
import { Member } from '../../core/models/member.model';
import { extractHttpErrorMessage } from '../../core/utils/http-error';

@Component({
  selector: 'app-members-list',
  templateUrl: './members-list.component.html',
  styleUrls: ['./members-list.component.scss']
})
export class MembersListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  members: Member[] = [];
  families: Family[] = [];
  groups: FriendGroup[] = [];

  /** Lookup tables used by the listing and detail templates. */
  familyNameByGuid: { [guid: string]: string } = {};
  groupNameByGuid: { [guid: string]: string } = {};

  loading = true;
  error = '';
  success = '';

  showCreate = false;
  createForm!: FormGroup;
  isAdmin = false;

  memberTypes = ['FAMILY', 'FRIEND'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private friendGroupService: FriendGroupService,
    private familyService: FamilyService,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isAdmin = (user?.role ?? '').toUpperCase() === 'ADMIN';
        if (!this.isAdmin) this.showCreate = false;
      });

    this.createForm = this.fb.group({
      groupId: ['', Validators.required],
      familyId: ['', Validators.required],
      fullName: ['', [Validators.required, Validators.maxLength(120)]],
      memberType: ['FAMILY', Validators.required],
      isFamilyHead: [false],
      shareCount: [1, [Validators.min(1)]],
      phoneNumber: [''],
      address: ['']
    });

    // When family changes, auto-fill group from that family's groupId so the
    // two values stay consistent in case the user only edits one of them.
    this.createForm.get('familyId')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(familyGuid => {
        const f = this.families.find(x => x.guid === familyGuid);
        if (f?.groupId && this.createForm.get('groupId')!.value !== f.groupId) {
          this.createForm.patchValue({ groupId: f.groupId }, { emitEvent: false });
        }
      });

    // Independent loads so a 500 on members does not blank the dropdowns.
    this.loadGroups();
    this.loadFamilies();
    this.loadMembers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private appendError(msg: string): void {
    this.error = this.error ? `${this.error}; ${msg}` : msg;
  }

  /** Convert any thrown value into a user-friendly message string. */
  private friendlyError(err: unknown, fallback: string): string {
    return extractHttpErrorMessage(err, fallback);
  }

  /** Load family groups. */
  loadGroups(): void {
    this.friendGroupService.list()
      .pipe(
        catchError(err => {
          this.appendError(this.friendlyError(err, 'Failed to load groups'));
          return of([] as FriendGroup[]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(groups => {
        this.groups = groups;
        this.groupNameByGuid = (groups ?? []).reduce((m, g) => {
          if (g?.guid) m[g.guid] = g.groupName ?? '';
          return m;
        }, {} as { [k: string]: string });
        this.applyFirstGroupDefault();
      });
  }

  /** Load families — populates the family dropdown and the auto-fill lookup. */
  loadFamilies(): void {
    this.familyService.list()
      .pipe(
        catchError(err => {
          this.appendError(this.friendlyError(err, 'Failed to load families'));
          return of([] as Family[]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(families => {
        this.families = families;
        this.familyNameByGuid = (families ?? []).reduce((m, f) => {
          if (f?.guid) m[f.guid] = f.familyName ?? '';
          return m;
        }, {} as { [k: string]: string });
        // If the create panel is open and the previously-selected family is no
        // longer in the filtered list, re-pick the first available one.
        this.applyFamilyDefault();
      });
  }

  /** Load members for the listing table. */
  loadMembers(): void {
    this.loading = true;
    this.memberService.list()
      .pipe(
        catchError(err => {
          this.appendError(this.friendlyError(err, 'Failed to load members'));
          return of([] as Member[]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(members => {
        this.members = members;
        this.loading = false;
      });
  }

  /** Reload everything (used after a successful create). */
  loadAll(): void {
    this.error = '';
    this.loading = true;
    this.loadGroups();
    this.loadFamilies();
    this.loadMembers();
  }

  /** Families that belong to the given groupId (used by the filtered dropdown). */
  familiesInGroup(groupGuid: string | null | undefined): Family[] {
    if (!groupGuid) return this.families;
    return this.families.filter(f => f.groupId === groupGuid);
  }

  /** Currently selected group's id from the form. */
  selectedGroupId(): string {
    return this.createForm?.get('groupId')?.value || '';
  }

  familyNameFor(m: Member): string {
    return this.familyNameByGuid[m.familyId ?? ''] ?? '—';
  }

  groupNameFor(m: Member): string {
    const f = this.families.find(x => x.guid === m.familyId);
    if (!f?.groupId) return '—';
    return this.groupNameByGuid[f.groupId] ?? '—';
  }

  /** Set group dropdown to first available group if it has no value yet. */
  private applyFirstGroupDefault(): void {
    if (!this.showCreate) return;
    const ctrl = this.createForm?.get('groupId');
    if (!ctrl) return;
    if (!ctrl.value && this.groups.length > 0) {
      ctrl.patchValue(this.groups[0].guid);
      this.applyFamilyDefault();
    }
  }

  /** Set family dropdown to first available family in selected group. */
  applyFamilyDefault(): void {
    if (!this.showCreate) return;
    const familyCtrl = this.createForm?.get('familyId');
    if (!familyCtrl) return;
    const groupGuid: string = this.selectedGroupId();
    const inGroup = this.familiesInGroup(groupGuid);
    const currentIsValid = inGroup.some(f => f.guid === familyCtrl.value);
    if (inGroup.length > 0 && !currentIsValid) {
      familyCtrl.patchValue(inGroup[0].guid);
    } else if (inGroup.length === 0) {
      familyCtrl.patchValue('');
    }
  }

  openCreate(): void {
    const firstGroup = this.groups[0];
    const firstFamily = firstGroup
      ? this.familiesInGroup(firstGroup.guid)[0]
      : (this.families[0] ?? null);
    this.createForm.reset({
      groupId: firstGroup?.guid ?? '',
      familyId: firstFamily?.guid ?? '',
      fullName: '',
      memberType: 'FAMILY',
      isFamilyHead: false,
      shareCount: 1,
      phoneNumber: '',
      address: ''
    });
    this.showCreate = true;
    this.error = '';
    this.success = '';
  }

  closeCreate(): void {
    this.showCreate = false;
  }

  create(): void {
    if (this.createForm.invalid) return;
    const v = this.createForm.value;
    const payload = {
      familyId: v.familyId,
      groupId: v.groupId || undefined,
      fullName: v.fullName,
      memberType: v.memberType,
      isFamilyHead: v.isFamilyHead,
      shareCount: Math.max(1, Number(v.shareCount) || 1),
      phoneNumber: v.phoneNumber || undefined,
      address: v.address || undefined
    };
    this.memberService.create(payload).subscribe({
      next: () => {
        this.success = 'Member created.';
        this.showCreate = false;
        this.loadAll();
      },
      error: (err) => {
        this.error = this.friendlyError(err, 'Failed to create member.');
      }
    });
  }

  openDetails(m: Member): void {
    this.router.navigate(['/members', m.guid]);
  }

  /**
   * Two-letter avatar label for a list card. Falls back to "M" when the name
   * is missing so the avatar circle never looks empty.
   */
  initials(name: string | undefined | null): string {
    const trimmed = (name || '').trim();
    if (!trimmed) return 'M';
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
