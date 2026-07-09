import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FriendGroupService } from '@core/services/friend-group.service';
import { AuthService } from '@core/services/auth.service';
import { FriendGroup } from '@core/models';
import { extractHttpErrorMessage } from '@core/utils/http-error';

@Component({
  selector: 'app-family-group-details',
  templateUrl: './family-group-details.component.html',
  styleUrls: ['./family-group-details.component.scss']
})
export class FamilyGroupDetailsComponent implements OnInit, OnDestroy {
  group: FriendGroup | null = null;
  loading = false;
  error = '';
  success = '';
  isAdmin = false;

  editForm!: FormGroup;
  editing = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private friendGroupService: FriendGroupService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      groupName: ['', Validators.required],
      description: ['']
    });

    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isAdmin = (user?.role ?? '').toUpperCase() === 'ADMIN';
        if (!this.isAdmin) this.editing = false;
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
    this.friendGroupService.getById(guid).subscribe({
      next: g => {
        this.group = g;
        this.editForm.patchValue({
          groupName: g.groupName,
          description: g.description || ''
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Family group not found';
        this.loading = false;
      }
    });
  }

  startEdit(): void {
    if (!this.isAdmin) return;
    this.editing = true;
  }

  cancelEdit(): void {
    this.editing = false;
    if (this.group) {
      this.editForm.patchValue({
        groupName: this.group.groupName,
        description: this.group.description || ''
      });
    }
  }

  saveEdit(): void {
    if (!this.group || this.editForm.invalid) return;
    this.friendGroupService.update(this.group.guid, this.editForm.value).subscribe({
      next: g => {
        this.group = g;
        this.editing = false;
        this.success = 'Family group updated';
      },
      error: err => (this.error = extractHttpErrorMessage(err, 'Failed to update'))
    });
  }

  delete(): void {
    if (!this.group) return;
    if (!confirm(`Delete family group "${this.group.groupName}"?`)) return;
    this.friendGroupService.delete(this.group.guid).subscribe({
      next: () => {
        this.success = 'Family group deleted';
        this.router.navigate(['/family-groups']);
      },
      error: () => (this.error = 'Failed to delete')
    });
  }

  back(): void {
    this.router.navigate(['/family-groups']);
  }
}