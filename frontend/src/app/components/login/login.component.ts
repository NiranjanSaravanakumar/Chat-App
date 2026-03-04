import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
})
export class LoginComponent {
    email = '';
    password = '';
    errorMessage = '';
    isLoading = false;

    constructor(private authService: AuthService, private router: Router) { }

    onLogin(): void {
        if (!this.email || !this.password) {
            this.errorMessage = 'Please fill in all fields';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        this.authService.login({ email: this.email, password: this.password }).subscribe({
            next: (res) => {
                if (res.success) {
                    this.router.navigate(['/chat']);
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Login failed. Please try again.';
            },
            complete: () => {
                this.isLoading = false;
            },
        });
    }
}
