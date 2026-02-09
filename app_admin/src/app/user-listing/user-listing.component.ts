import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserAdmin } from '../models/user-admin';
import { TripDataService } from '../services/trip-data.service';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-user-listing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-listing.component.html',
  styleUrl: './user-listing.component.css',
  providers: [TripDataService]
})
export class UserListingComponent implements OnInit {
  users: UserAdmin[] = [];
  message: string = '';
  error: string = '';

  constructor(
    private tripDataService: TripDataService,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    console.log('user-listing constructor');
  }

  ngOnInit(): void {
    console.log('ngOnInit - user listing');
    this.loadUsers();
  }

  private loadUsers(): void {
    this.tripDataService.getUsers()
      .subscribe({
        next: (users: UserAdmin[]) => {
          this.users = users;
          if (users.length > 0) {
            this.message = `There are ${users.length} registered users.`;
            this.error = '';
          } else {
            this.message = 'No users found in the database.';
            this.error = '';
          }
          console.log(this.message);
        },
        error: (error: any) => {
          console.log('Error: ' + error);
          this.error = 'Failed to load users. ' + (error.message || '');
          this.message = '';
        }
      });
  }

  public deleteUser(user: UserAdmin): void {
    if (confirm(`Are you sure you want to delete user: ${user.name} (${user.email})?`)) {
      this.tripDataService.deleteUser(user._id).subscribe({
        next: () => {
          console.log('User deleted successfully');
          this.loadUsers();
        },
        error: (error: any) => {
          console.log('Error deleting user: ' + error);
          this.error = 'Failed to delete user. ' + (error.message || '');
        }
      });
    }
  }

  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }
}
