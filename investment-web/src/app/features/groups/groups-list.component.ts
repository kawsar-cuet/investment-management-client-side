import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FriendGroupService } from '@core/services/friend-group.service';
import { FriendGroup } from '@core/models';
import { extractHttpErrorMessage } from '@core/utils/http-error';

@Component({
  selector: 'app-groups-list',
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.scss']
})
export class GroupsListComponent implements OnInit {
  groups: FriendGroup[] = [];
  loading = false;
  error = '';
  success = '';

  // Track groups created during this session (backend has no GET /api/groups list)
  knownGuids: string[] = [];

  createForm!: FormGroup;
  lookupForm!: FormGroup;
  editing: FriendGroup | null = null;
  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private friendGroupService: FriendGroupService
  ) {}

  ngOnInit(): void {
    this.createForm = this.fb.group({
      groupName: ['', Validators.required],
      description: ['']
    });
    this.lookupForm = this.fb.group({
      guid: ['', Validators.required]
    });
    this.editForm = this.fb.group({
      groupName: ['', Validators.required],
      description: ['']
    });
  }

  loadKnownGroups(): void {
    this.loading = true;
    this.error = '';
    let count = 0;
    let failures = 0;
    if (this.knownGuids.length === 0) {
      this.loading = false;
      this.groups = [];
      return;
    }
    const collected: FriendGroup[] = [];
    this.knownGuids.forEach(id => {
      this.friendGroupService.getById(id).subscribe({
        next: g => collected.push(g),
        error: () => failures++,
        complete: () => {
          count++;
          if (count === this.knownGuids.length) {
            this.groups = collected;
            this.loading = false;
            if (failures > 0) this.error = `${failures} group(s) could not be loaded`;
          }
        }
      });
    });
  }

  create(): void {
    if (this.createForm.invalid) return;
    this.error = '';
    this.success = '';
    this.friendGroupService.create(this.createForm.value as any).subscribe({
      next: g => {
        this.success = `Group created: ${g.groupName}`;
        if (g.guid && !this.knownGuids.includes(g.guid)) this.knownGuids.push(g.guid);
        this.createForm.reset();
        this.loadKnownGroups();
      },
      error: err => (this.error = extractHttpErrorMessage(err, 'Failed to create group'))
    });
  }

  lookup(): void {
    if (this.lookupForm.invalid) return;
    const id = this.lookupForm.value.guid.trim();
    this.error = '';
    this.friendGroupService.getById(id).subscribe({
      next: g => {
        if (!this.knownGuids.includes(g.guid)) this.knownGuids.push(g.guid);
        this.success = `Found: ${g.groupName}`;
        this.loadKnownGroups();
      },
      error: () => (this.error = 'Group not found with that ID')
    });
  }

  startEdit(g: FriendGroup): void {
    this.editing = { ...g };
    this.editForm.patchValue({ groupName: g.groupName, description: g.description || '' });
  }

  cancelEdit(): void {
    this.editing = null;
    this.editForm.reset();
  }

  saveEdit(): void {
    if (!this.editing || this.editForm.invalid) return;
    const payload = { ...this.editing, ...this.editForm.value };
    this.friendGroupService.update(this.editing.guid, payload).subscribe({
      next: () => {
        this.success = 'Group updated';
        this.editing = null;
        this.editForm.reset();
        this.loadKnownGroups();
      },
      error: err => (this.error = extractHttpErrorMessage(err, 'Failed to update group'))
    });
  }

  delete(g: FriendGroup): void {
    if (!confirm(`Delete group "${g.groupName}"?`)) return;
    this.friendGroupService.delete(g.guid).subscribe({
      next: () => {
        this.knownGuids = this.knownGuids.filter(x => x !== g.guid);
        this.loadKnownGroups();
        this.success = 'Group deleted';
      },
      error: () => (this.error = 'Failed to delete group')
    });
  }
}
