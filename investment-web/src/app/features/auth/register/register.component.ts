import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { extractHttpErrorMessage } from '@core/utils/http-error';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  error = '';
  success = '';
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, this.emailOrPhoneValidator]],
      fullName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Accepts either a real email address OR a phone number.
   * Email pattern is intentionally simple; phone accepts digits, spaces,
   * dashes, parentheses, and a leading +.
   */
  emailOrPhoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = String(control.value).trim();
    if (!value) return null;
    const emailRe = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const phoneRe = /^\+?[0-9](?:[0-9\s\-()]{6,28}[0-9])$/;
    return emailRe.test(value) || phoneRe.test(value) ? null : { emailOrPhone: true };
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const payload = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.authService.signup(payload).subscribe({
      next: (response) => {
        this.loading = false;
        if (response && response.accessToken) {
          this.success = 'Account created successfully! Redirecting to dashboard...';
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1200);
        } else {
          this.error = 'Registration failed. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = extractHttpErrorMessage(err, 'Registration failed. Please try again.');
        console.error('Registration error:', err);
      }
    });
  }

  get f() {
    return this.registerForm.controls;
  }
}
