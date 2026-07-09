import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { SidebarService } from '@core/services/sidebar.service';
import { UserInfo } from '@core/models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: UserInfo | null = null;
  showUserMenu = false;
  sidebarOpen = false;

  private readonly subs = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.authService.currentUser$.subscribe(user => (this.currentUser = user))
    );
    this.subs.add(this.sidebarService.isOpen$.subscribe(open => (this.sidebarOpen = open)));

    // Close any open drawer when the user navigates so the new page doesn't
    // appear behind the menu.
    this.subs.add(
      this.router.events.subscribe(evt => {
        if (evt instanceof NavigationEnd) {
          this.sidebarService.close();
          this.showUserMenu = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  /** Header hamburger — only meaningful on mobile, but harmless everywhere. */
  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  logout(): void {
    this.sidebarService.close();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  /** Pressing Escape always closes the drawer if it's open. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.sidebarService.isOpen) {
      this.sidebarService.close();
    }
    if (this.showUserMenu) {
      this.showUserMenu = false;
    }
  }
}
