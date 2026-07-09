import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FriendGroupService } from '@core/services/friend-group.service';
import { AuthService } from '@core/services/auth.service';
import { FriendGroup } from '@core/models';
import { extractHttpErrorMessage } from '@core/utils/http-error';

@Component({
  selector: 'app-family-group-list',
  templateUrl: './family-group-list.component.html',
  styleUrls: ['./family-group-list.component.scss']
})
export class FamilyGroupListComponent implements OnInit, OnDestroy {
  groups: FriendGroup[] = [];
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
    private friendGroupService: FriendGroupService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.createForm = this.fb.group({
      groupName: ['', Validators.required],
      description: ['']
    });

    // React to login/logout so role visibility stays accurate
    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isAdmin = (user?.role ?? '').toUpperCase() === 'ADMIN';
        // Hide any in-progress create form when role drops
        if (!this.isAdmin) this.showCreate = false;
      });

    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.friendGroupService.list().subscribe({
      next: list => {
        this.groups = list;
        this.loading = false;
      },
      error: err => {
        this.error = extractHttpErrorMessage(err, 'Failed to load family groups');
        this.loading = false;
      }
    });
  }

  openCreate(): void {
    if (!this.isAdmin) return;
    this.showCreate = true;
  }

  closeCreate(): void {
    this.showCreate = false;
    this.createForm.reset();
  }

  create(): void {
    if (this.createForm.invalid) return;
    this.friendGroupService.create(this.createForm.value).subscribe({
      next: g => {
        this.success = `Family group "${g.groupName}" created`;
        this.showCreate = false;
        this.createForm.reset();
        this.load();
      },
      error: err => (this.error = extractHttpErrorMessage(err, 'Failed to create'))
    });
  }

  openDetails(g: FriendGroup): void {
    this.router.navigate(['/family-groups', g.guid]);
  }
}