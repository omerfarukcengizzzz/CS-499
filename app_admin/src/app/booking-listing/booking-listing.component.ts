import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Booking } from '../models/booking';
import { TripDataService } from '../services/trip-data.service';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-booking-listing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-listing.component.html',
  styleUrl: './booking-listing.component.css',
  providers: [TripDataService]
})
export class BookingListingComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  message: string = '';
  error: string = '';
  filterStatus: string = 'all';

  stats = {
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    totalRevenue: 0
  };

  constructor(
    private tripDataService: TripDataService,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  private loadBookings(): void {
    this.tripDataService.getBookings()
      .subscribe({
        next: (bookings: Booking[]) => {
          this.bookings = bookings;
          this.filteredBookings = bookings;
          this.calculateStats();
          
          if (bookings.length > 0) {
            this.message = `There are ${bookings.length} total bookings.`;
            this.error = '';
          } else {
            this.message = 'No bookings found in the database.';
            this.error = '';
          }
        },
        error: (error: any) => {
          this.error = 'Failed to load bookings. ' + (error.message || '');
          this.message = '';
        }
      });
  }

  private calculateStats(): void {
    this.stats.total = this.bookings.length;
    this.stats.pending = this.bookings.filter(b => b.status === 'pending').length;
    this.stats.confirmed = this.bookings.filter(b => b.status === 'confirmed').length;
    this.stats.cancelled = this.bookings.filter(b => b.status === 'cancelled').length;
    this.stats.completed = this.bookings.filter(b => b.status === 'completed').length;
    this.stats.totalRevenue = this.bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.totalPrice, 0);
  }

  public filterByStatus(status: string): void {
    this.filterStatus = status;
    if (status === 'all') {
      this.filteredBookings = this.bookings;
    } else {
      this.filteredBookings = this.bookings.filter(b => b.status === status);
    }
  }

  public updateStatus(booking: Booking, newStatus: string): void {
    if (confirm(`Change booking status to ${newStatus}?`)) {
      this.tripDataService.updateBookingStatus(booking._id, newStatus).subscribe({
        next: () => {
          this.loadBookings();
        },
        error: (error: any) => {
          this.error = 'Failed to update status. ' + (error.message || '');
        }
      });
    }
  }

  public deleteBooking(booking: Booking): void {
    if (confirm(`Are you sure you want to delete booking for ${booking.userName}?`)) {
      this.tripDataService.deleteBooking(booking._id).subscribe({
        next: () => {
          this.loadBookings();
        },
        error: (error: any) => {
          this.error = 'Failed to delete booking. ' + (error.message || '');
        }
      });
    }
  }

  public getStatusClass(status: string): string {
    switch(status) {
      case 'pending': return 'badge-warning';
      case 'confirmed': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      case 'completed': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }
}
