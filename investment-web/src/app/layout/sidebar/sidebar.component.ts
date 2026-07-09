import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { SidebarService } from '@core/services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  open = false;
  isAdmin = false;
  private readonly subs = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    const me = this.authService.getCurrentUser();
    this.isAdmin = (me?.role || '').toUpperCase() === 'ADMIN';

    this.subs.add(
      this.sidebarService.isOpen$.subscribe(open => (this.open = open))
    );
    // Close the mobile drawer after every successful navigation. On desktop
    // this is a no-op because the rail is always visible.
    this.subs.add(
      this.router.events.subscribe(evt => {
        if (evt instanceof NavigationEnd) {
          this.sidebarService.close();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  close(): void {
    this.sidebarService.close();
  }

  logout(): void {
    this.sidebarService.close();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
