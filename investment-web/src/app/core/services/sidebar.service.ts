import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Tiny shared state for the mobile navigation drawer.
 *
 * The header's hamburger button calls `toggle()` to flip the drawer, and the
 * sidebar component (which renders as a fixed overlay on mobile) subscribes
 * via `isOpen$` to know whether it should slide into view. Main layout
 * subscribes too so it can render the dimmed backdrop and block body scroll
 * while the drawer is open.
 *
 * On desktop (md+ tailwind breakpoint and up) the sidebar renders as a
 * permanent left rail regardless of this flag — the drawer only matters
 * for smaller screens. We keep the flag in the service so the header can
 * decide whether to show the hamburger button at all.
 */
@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly _isOpen = new BehaviorSubject<boolean>(false);
  readonly isOpen$: Observable<boolean> = this._isOpen.asObservable();

  get isOpen(): boolean {
    return this._isOpen.value;
  }

  toggle(): void {
    this._isOpen.next(!this._isOpen.value);
  }

  open(): void {
    if (!this._isOpen.value) this._isOpen.next(true);
  }

  close(): void {
    if (this._isOpen.value) this._isOpen.next(false);
  }
}
