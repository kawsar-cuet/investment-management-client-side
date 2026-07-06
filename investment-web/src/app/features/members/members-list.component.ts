import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MemberService } from '@core/services/member.service';
import { Member } from '@core/models';

@Component({
  selector: 'app-members-list',
  templateUrl: './members-list.component.html',
  styleUrls: ['./members-list.component.scss']
})
export class MembersListComponent implements OnInit {
  members: Member[] = [];
  loading = false;
  error = '';
  success = '';

  // Track members the user has created / looked up
  knownGuids: string[] = [];

  createForm!: FormGroup;
  lookupForm!: FormGroup;
  familyLookupForm!: FormGroup;
  familyHeadForm!: FormGroup;
  editing: Member | null = null;
  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {
    this.createForm = this.fb.group({
      familyGuid: ['', Validators.required],
      fullName: ['', Validators.required],
      memberType: ['FAMILY'],
      isFamilyHead: [false],
      shareCount: [1, [Validators.min(0)]],
      phone: [''],
      address: ['']
    });
    this.lookupForm = this.fb.group({
      guid: ['', Validators.required]
    });
    this.familyLookupForm = this.fb.group({
      familyId: ['', Validators.required]
    });
    this.familyHeadForm = this.fb.group({
      familyId: ['', Validators.required]
    });
    this.editForm = this.fb.group({
      fullName: ['', Validators.required],
      memberType: ['FAMILY'],
      isFamilyHead: [false],
      shareCount: [1],
      phone: [''],
      address: ['']
    });
  }

  loadKnownMembers(): void {
    this.loading = true;
    this.error = '';
    if (this.knownGuids.length === 0) {
      this.loading = false;
      this.members = [];
      return;
    }
    const collected: Member[] = [];
    let done = 0;
    let fails = 0;
    this.knownGuids.forEach(id => {
      this.memberService.getById(id).subscribe({
        next: m => collected.push(m),
        error: () => fails++,
        complete: () => {
          done++;
          if (done === this.knownGuids.length) {
            this.members = collected;
            this.loading = false;
            if (fails > 0) this.error = `${fails} member(s) could not be loaded`;
          }
        }
      });
    });
  }

  create(): void {
    if (this.createForm.invalid) return;
    this.memberService.create(this.createForm.value as any).subscribe({
      next: m => {
        this.success = `Member created: ${m.fullName}`;
        if (m.guid && !this.knownGuids.includes(m.guid)) this.knownGuids.push(m.guid);
        this.createForm.reset({ memberType: 'FAMILY', isFamilyHead: false, shareCount: 1 });
        this.loadKnownMembers();
      },
      error: err => (this.error = err?.message || 'Failed to create member')
    });
  }

  lookup(): void {
    if (this.lookupForm.invalid) return;
    const id = this.lookupForm.value.guid.trim();
    this.memberService.getById(id).subscribe({
      next: m => {
        if (!this.knownGuids.includes(m.guid)) this.knownGuids.push(m.guid);
        this.success = `Found: ${m.fullName}`;
        this.loadKnownMembers();
      },
      error: () => (this.error = 'Member not found with that ID')
    });
  }

  findByFamily(): void {
    if (this.familyLookupForm.invalid) return;
    const familyId = this.familyLookupForm.value.familyId.trim();
    this.error = '';
    this.memberService.getByFamilyId(familyId).subscribe({
      next: list => {
        list.forEach(m => { if (!this.knownGuids.includes(m.guid)) this.knownGuids.push(m.guid); });
        this.success = `Found ${list.length} member(s) in that family`;
        this.loadKnownMembers();
      },
      error: () => (this.error = 'No members found or family does not exist')
    });
  }

  findFamilyHead(): void {
    if (this.familyHeadForm.invalid) return;
    const familyId = this.familyHeadForm.value.familyId.trim();
    this.error = '';
    this.memberService.getFamilyHead(familyId).subscribe({
      next: m => {
        if (!this.knownGuids.includes(m.guid)) this.knownGuids.push(m.guid);
        this.success = `Family head: ${m.fullName}`;
        this.loadKnownFamilies_One(m);
      },
      error: () => (this.error = 'No family head found')
    });
  }

  private loadKnownFamilies_One(m: Member): void {
    this.members = [m];
  }

  startEdit(m: Member): void {
    this.editing = { ...m };
    this.editForm.patchValue({
      fullName: m.fullName,
      memberType: m.memberType || 'FAMILY',
      isFamilyHead: !!m.isFamilyHead,
      shareCount: m.shareCount ?? 1,
      phone: m.phone || '',
      address: m.address || ''
    });
  }

  cancelEdit(): void {
    this.editing = null;
    this.editForm.reset();
  }

  saveEdit(): void {
    if (!this.editing || this.editForm.invalid) return;
    const payload = { ...this.editing, ...this.editForm.value };
    this.memberService.update(this.editing.guid, payload).subscribe({
      next: () => {
        this.success = 'Member updated';
        this.editing = null;
        this.editForm.reset();
        this.loadKnownMembers();
      },
      error: () => (this.error = 'Failed to update member')
    });
  }

  delete(m: Member): void {
    if (!confirm(`Delete member "${m.fullName}"?`)) return;
    this.memberService.delete(m.guid).subscribe({
      next: () => {
        this.knownGuids = this.knownGuids.filter(x => x !== m.guid);
        this.loadKnownMembers();
        this.success = 'Member deleted';
      },
      error: () => (this.error = 'Failed to delete member')
    });
  }
}
