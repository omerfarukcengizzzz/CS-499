import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Import Router for navigation
import { Trip } from '../models/trip'; // Import Trip model
import { TripDataService } from '../services/trip-data.service';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-card.component.html',
  styleUrls: ['./trip-card.component.css']
})

export class TripCardComponent implements OnInit {
  @Input('trip') trip: any;

  constructor(
    private router: Router,
    private tripDataService: TripDataService,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void { }

  // Add editTrip method
  public editTrip(trip: Trip): void {
    localStorage.removeItem('tripCode'); // Remove any previous trip code
    localStorage.setItem('tripCode', trip.code); // Store the current trip code
    this.router.navigate(['/edit-trip']); // Navigate to the edit trip page
  }

  // Add deleteTrip method
  public deleteTrip(trip: Trip): void {
    if (confirm(`Are you sure you want to delete ${trip.name}?`)) {
      this.tripDataService.deleteTrip(trip.code).subscribe({
        next: () => {
          window.location.reload();
        },
        error: (error: any) => {
          console.log('Error: ' + error);
        }
      });
    }
  }

  public isLoggedIn() {
    return this.authenticationService.isLoggedIn();
  }
}