import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, catchError, of, takeUntil } from 'rxjs';
import { FamilyService } from '@core/services/family.service';
import { FriendGroupService } from '@core/services/friend-group.service';
import { AuthService } from '@core/services/auth.service';
import { Family, FriendGroup } from '@core/models';
import { extractHttpErrorMessage } from '@core/utils/http-error';

@Component({
  selector: 'app-families-list',
  templateUrl: './families-list.component.html',
  styleUrls: ['./families-list.component.scss']
})
export class FamiliesListComponent implements OnInit, OnDestroy {
  families: Family[] = [];
  groups: FriendGroup[] = [];
  groupNameByGuid: { [guid: string]: string } = {};

  loading = false;
  error = '';
  success = '';
  isAdmin = false;

  createForm!: FormGroup;
  showCreate = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private familyService: FamilyService,
    private friendGroupService: FriendGroupService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.createForm = this.fb.group({
      groupId: ['', Validators.required],
      familyName: ['', Validators.required],
      description: ['']
    });

    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isAdmin = (user?.role ?? '').toUpperCase() === 'ADMIN';
        if (!this.isAdmin) this.showCreate = false;
      });

    // Load groups first so the dropdown is populated even if /api/families fails.
    // The two requests are now independent — a 500 on families will NOT blank
    // the group dropdown.
    this.loadGroups();
    this.loadFamilies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Load family groups and populate the create-form dropdown. */
  loadGroups(): void {
    this.friendGroupService.list()
      .pipe(
        catchError(err => {
          const msg = extractHttpErrorMessage(err, 'Failed to load family groups');
          this.error = this.error ? `${this.error}; ${msg}` : msg;
          return of([] as FriendGroup[]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(groups => {
        this.groups = groups;
        this.groupNameByGuid = groups.reduce((acc, g) => {
          acc[g.guid] = g.groupName;
          return acc;
        }, {} as { [k: string]: string });
        this.applyFirstGroupDefault();
      });
  }

  /** Load families for the listing table. */
  loadFamilies(): void {
    this.loading = true;
    this.familyService.list()
      .pipe(
        catchError(err => {
          const msg = extractHttpErrorMessage(err, 'Failed to load families');
          this.error = this.error ? `${this.error}; ${msg}` : msg;
          return of([] as Family[]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(families => {
        this.families = families;
        this.loading = false;
      });
  }

  /** Reload both lists (used after create). */
  load(): void {
    this.error = '';
    this.loading = true;
    this.loadGroups();
    this.loadFamilies();
  }

  /** If the create form has no group selected yet, default to the first group. */
  private applyFirstGroupDefault(): void {
    if (this.groups.length === 0) return;
    const current = this.createForm.get('groupId')?.value;
    if (!current) {
      this.createForm.patchValue({ groupId: this.groups[0].guid });
    }
  }

  groupNameFor(f: Family): string {
    if (!f.groupId) return '—';
    return this.groupNameByGuid[f.groupId] || this.shortId(f.groupId);
  }

  shortId(id: string): string {
    return id ? `${id.substring(0, 8)}…` : '';
  }

  openCreate(): void {
    if (!this.isAdmin) return;
    this.showCreate = true;
    // Always re-apply first-group default when the panel opens.
    this.applyFirstGroupDefault();
  }

  closeCreate(): void {
    this.showCreate = false;
    this.createForm.reset({ groupId: this.groups.length > 0 ? this.groups[0].guid : '' });
  }

  create(): void {
    if (this.createForm.invalid) return;
    const v = this.createForm.value;
    this.familyService.create({
      groupId: v.groupId,
      familyName: v.familyName,
      description: v.description
    }).subscribe({
      next: f => {
        this.success = `Family "${f.familyName}" created`;
        this.showCreate = false;
        this.createForm.reset({ groupId: this.groups.length > 0 ? this.groups[0].guid : '' });
        this.load();
      },
      error: err => (this.error = extractHttpErrorMessage(err, 'Failed to create'))
    });
  }

  openDetails(f: Family): void {
    this.router.navigate(['/families', f.guid]);
  }

  /**
   * Two-letter avatar label for a list card. Falls back to "F" when the name
   * is missing so the avatar circle never looks empty.
   */
  initials(name: string | undefined | null): string {
    const trimmed = (name || '').trim();
    if (!trimmed) return 'F';
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
