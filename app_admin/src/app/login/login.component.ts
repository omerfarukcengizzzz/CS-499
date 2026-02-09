import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { User } from '../models/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public formError: string = '';
  submitted = false;
  credentials = {
    email: '',
    password: ''
  }

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void { }

  public onLoginSubmit(): void {
    this.formError = '';
    if (!this.credentials.email || !this.credentials.password) {
      this.formError = 'Email and password are required, please try again';
      this.router.navigateByUrl('#'); // Return to login page
    } else {
      this.doLogin();
    }
  }

  private doLogin(): void {
    let newUser = {
      name: '',
      email: this.credentials.email
    } as User;
    
    this.authenticationService.login(newUser, this.credentials.password);
    
    setTimeout(() => {
      if (this.authenticationService.isLoggedIn()) {
        this.router.navigate(['']);
      } else if (this.authenticationService.loginError) {
        this.formError = this.authenticationService.loginError;
      } else {
        this.formError = 'Invalid email or password. Please try again.';
      }
    }, 1000);
  }
}
