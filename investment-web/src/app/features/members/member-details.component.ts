import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, catchError, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { FamilyService } from '../../core/services/family.service';
import { FriendGroupService } from '../../core/services/friend-group.service';
import { MemberService } from '../../core/services/member.service';
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

  editing = false;
  editForm!: FormGroup;
  isAdmin = false;

  memberTypes = ['FAMILY', 'FRIEND'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private familyService: FamilyService,
    private friendGroupService: FriendGroupService,
    private memberService: MemberService
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

    // Always load the family list so the edit-form dropdown has options, even
    // if /api/members/{id} succeeds in isolation.
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
        catchError(err => {
          this.error = extractHttpErrorMessage(err, 'Failed to load families.');
          return of([] as Family[]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(families => (this.families = families));
  }

  loadMember(guid: string): void {
    this.loading = true;
    this.error = '';
    this.success = '';
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
      });
  }

  /** Resolve the family record and from it the group record. */
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

  startEdit(): void {
    if (!this.member) return;
    this.editForm.patchValue({
      fullName: this.member.fullName ?? '',
      familyId: this.member.familyId ?? '',
      memberType: this.member.memberType ?? 'FAMILY',
      isFamilyHead: !!this.member.isFamilyHead,
      shareCount: this.member.shareCount ?? 0,
      phoneNumber: this.member.phoneNumber ?? '',
      address: this.member.address ?? ''
    });
    this.editing = true;
    this.error = '';
    this.success = '';
  }

  cancelEdit(): void {
    this.editing = false;
  }

  saveEdit(): void {
    if (this.editForm.invalid || !this.member) return;
    const v = this.editForm.value;
    const payload = {
      fullName: v.fullName,
      familyId: v.familyId,
      memberType: v.memberType,
      isFamilyHead: v.isFamilyHead,
      shareCount: Number(v.shareCount) || 0,
      phoneNumber: v.phoneNumber || undefined,
      address: v.address || undefined
    };
    this.memberService.update(this.member.guid, payload).subscribe({
      next: updated => {
        this.success = 'Member updated.';
        this.editing = false;
        this.loadMember(updated.guid);
      },
      error: err => {
        this.error = extractHttpErrorMessage(err, 'Failed to update member.');
      }
    });
  }

  delete(): void {
    if (!this.member) return;
    if (!confirm(`Delete member "${this.member.fullName}"? This cannot be undone.`)) return;
    this.memberService.delete(this.member.guid).subscribe({
      next: () => {
        this.router.navigate(['/members']);
      },
      error: err => {
        this.error = extractHttpErrorMessage(err, 'Failed to delete member.');
      }
    });
  }

  back(): void {
    this.router.navigate(['/members']);
  }
}