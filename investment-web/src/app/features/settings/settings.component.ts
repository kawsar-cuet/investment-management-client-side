import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { UserInfo } from '@core/models';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  user: UserInfo | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => (this.user = u));
  }
}
