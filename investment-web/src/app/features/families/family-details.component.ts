import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, catchError, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { FamilyService } from '../../core/services/family.service';
import { FriendGroupService } from '../../core/services/friend-group.service';
import { Family } from '../../core/models/family.model';
import { FriendGroup } from '../../core/models/friend-group.model';
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

  editing = false;
  editForm!: FormGroup;
  isAdmin = false;

  /**
   * Cache of every group we know about, used as a fallback when the family
   * references a group_id that the per-id endpoint can no longer resolve
   * (deleted group, etc.). Populated on init.
   */
  groupNameByGuid: { [guid: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private familyService: FamilyService,
    private friendGroupService: FriendGroupService
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isAdmin = (user?.role ?? '').toUpperCase() === 'ADMIN';
      });

    this.editForm = this.fb.group({
      familyName: ['', Validators.required],
      description: ['']
    });

    // Populate the group-name cache up-front so it can be used as a fallback
    // when resolveGroup() fails (e.g. orphaned group_id pointing at a
    // soft-deleted group). Failures here are non-fatal — they just mean the
    // fallback won't have the missing name.
    this.friendGroupService.list()
      .pipe(
        catchError(() => of([] as FriendGroup[])),
        takeUntil(this.destroy$)
      )
      .subscribe(groups => {
        this.groupNameByGuid = (groups ?? []).reduce((m, g) => {
          if (g?.guid) m[g.guid] = g.groupName ?? '';
          return m;
        }, {} as { [k: string]: string });
      });

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

  load(guid: string): void {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.group = null;
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

  /**
   * Best-effort display name for the family's group. Uses the live FriendGroup
   * record first; falls back to the cache of all groups; finally falls back to
   * a truncated GUID so the user can still see *something* identifying.
   */
  groupDisplay(): string {
    if (this.group?.groupName) return this.group.groupName;
    const gid = this.family?.groupId;
    if (!gid) return '—';
    if (this.groupNameByGuid[gid]) return this.groupNameByGuid[gid];
    return gid.length > 13 ? `${gid.substring(0, 8)}…` : gid;
  }

  startEdit(): void {
    if (!this.family) return;
    this.editForm.patchValue({
      familyName: this.family.familyName ?? '',
      description: this.family.description ?? ''
    });
    this.editing = true;
    this.error = '';
    this.success = '';
  }

  cancelEdit(): void {
    this.editing = false;
  }

  saveEdit(): void {
    if (this.editForm.invalid || !this.family) return;
    const v = this.editForm.value;
    this.familyService.update(this.family.guid, {
      familyName: v.familyName,
      description: v.description || undefined
    }).subscribe({
      next: updated => {
        this.success = 'Family updated.';
        this.editing = false;
        this.load(updated.guid);
      },
      error: err => {
        this.error = extractHttpErrorMessage(err, 'Failed to update family.');
      }
    });
  }

  delete(): void {
    if (!this.family) return;
    const confirmed = confirm(
      `Delete family "${this.family.familyName}"? This cannot be undone.`
    );
    if (!confirmed) return;
    this.familyService.delete(this.family.guid).subscribe({
      next: () => {
        this.router.navigate(['/families']);
      },
      error: err => {
        this.error = extractHttpErrorMessage(err, 'Failed to delete family.');
      }
    });
  }

  back(): void {
    this.router.navigate(['/families']);
  }
}