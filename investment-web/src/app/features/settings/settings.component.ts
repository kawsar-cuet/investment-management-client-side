import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserInfo } from '@core/models';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  user: UserInfo | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((u: UserInfo | null) => (this.user = u));
  }

  /** Two-letter avatar initials from the username (or email fallback). */
  initials(): string {
    const raw =
      this.user?.username ||
      this.user?.email?.split('@')[0] ||
      '';
    const cleaned = raw.trim();
    if (!cleaned) return '?';
    const parts = cleaned.split(/\s+|\.|_|-/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleaned.slice(0, 2).toUpperCase();
  }

  /** End the current session and send the user back to the login page. */
  logout(): void {
    if (!confirm('Sign out of this device?')) return;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
