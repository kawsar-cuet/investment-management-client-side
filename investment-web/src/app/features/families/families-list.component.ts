import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FamilyService } from '@core/services/family.service';
import { Family } from '@core/models';

@Component({
  selector: 'app-families-list',
  templateUrl: './families-list.component.html',
  styleUrls: ['./families-list.component.scss']
})
export class FamiliesListComponent implements OnInit {
  families: Family[] = [];
  loading = false;
  error = '';
  success = '';

  // Track families the user has created / looked up
  knownGuids: string[] = [];

  createForm!: FormGroup;
  lookupForm!: FormGroup;
  groupLookupForm!: FormGroup;
  editing: Family | null = null;
  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private familyService: FamilyService
  ) {}

  ngOnInit(): void {
    this.createForm = this.fb.group({
      groupGuid: [''],
      familyName: ['', Validators.required],
      description: ['']
    });
    this.lookupForm = this.fb.group({
      guid: ['', Validators.required]
    });
    this.groupLookupForm = this.fb.group({
      groupId: ['', Validators.required]
    });
    this.editForm = this.fb.group({
      familyName: ['', Validators.required],
      description: ['']
    });
  }

  loadKnownFamilies(): void {
    this.loading = true;
    this.error = '';
    if (this.knownGuids.length === 0) {
      this.loading = false;
      this.families = [];
      return;
    }
    const collected: Family[] = [];
    let done = 0;
    let fails = 0;
    this.knownGuids.forEach(id => {
      this.familyService.getById(id).subscribe({
        next: f => collected.push(f),
        error: () => fails++,
        complete: () => {
          done++;
          if (done === this.knownGuids.length) {
            this.families = collected;
            this.loading = false;
            if (fails > 0) this.error = `${fails} family(ies) could not be loaded`;
          }
        }
      });
    });
  }

  create(): void {
    if (this.createForm.invalid) return;
    const payload: any = { ...this.createForm.value };
    if (!payload.groupGuid) delete payload.groupGuid;
    this.familyService.create(payload).subscribe({
      next: f => {
        this.success = `Family created: ${f.familyName}`;
        if (f.guid && !this.knownGuids.includes(f.guid)) this.knownGuids.push(f.guid);
        this.createForm.reset();
        this.loadKnownFamilies();
      },
      error: err => (this.error = err?.message || 'Failed to create family')
    });
  }

  lookup(): void {
    if (this.lookupForm.invalid) return;
    const id = this.lookupForm.value.guid.trim();
    this.familyService.getById(id).subscribe({
      next: f => {
        if (!this.knownGuids.includes(f.guid)) this.knownGuids.push(f.guid);
        this.success = `Found: ${f.familyName}`;
        this.loadKnownFamilies();
      },
      error: () => (this.error = 'Family not found with that ID')
    });
  }

  findByGroup(): void {
    if (this.groupLookupForm.invalid) return;
    const groupId = this.groupLookupForm.value.groupId.trim();
    this.error = '';
    this.familyService.getByGroup(groupId).subscribe({
      next: list => {
        list.forEach(f => { if (!this.knownGuids.includes(f.guid)) this.knownGuids.push(f.guid); });
        this.success = `Found ${list.length} families in that group`;
        this.loadKnownFamilies();
      },
      error: () => (this.error = 'No families found or group does not exist')
    });
  }

  startEdit(f: Family): void {
    this.editing = { ...f };
    this.editForm.patchValue({ familyName: f.familyName, description: f.description || '' });
  }

  cancelEdit(): void {
    this.editing = null;
    this.editForm.reset();
  }

  saveEdit(): void {
    if (!this.editing || this.editForm.invalid) return;
    const payload = { ...this.editing, ...this.editForm.value };
    this.familyService.update(this.editing.guid, payload).subscribe({
      next: () => {
        this.success = 'Family updated';
        this.editing = null;
        this.editForm.reset();
        this.loadKnownFamilies();
      },
      error: () => (this.error = 'Failed to update family')
    });
  }

  delete(f: Family): void {
    if (!confirm(`Delete family "${f.familyName}"?`)) return;
    this.familyService.delete(f.guid).subscribe({
      next: () => {
        this.knownGuids = this.knownGuids.filter(x => x !== f.guid);
        this.loadKnownFamilies();
        this.success = 'Family deleted';
      },
      error: () => (this.error = 'Failed to delete family')
    });
  }
}
