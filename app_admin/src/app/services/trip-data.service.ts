import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Trip } from '../models/trip';
import { User } from '../models/user';
import { AuthResponse } from '../models/user';
import { UserAdmin } from '../models/user-admin';
import { Booking } from '../models/booking';
import { BROWSER_STORAGE } from '../storage';

@Injectable({
  providedIn: 'root'
})

export class TripDataService {
  private url = 'http://localhost:3000/api/trips'; // Backend API URL
  baseUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    @Inject(BROWSER_STORAGE) private storage: Storage
  ) { }

  // Helper method to create headers with JWT token
  private getHeaders(): HttpHeaders {
    const token = this.storage.getItem('travlr-token');
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders();
  }

  // Method to retrieve all trips (unwraps paginated response)
  getTrips(): Observable<Trip[]> {
    return this.http.get<any>(this.url).pipe(
      map(response => response.data || response)
    );
  }

  // Method to add a new trip
  addTrip(formData: Trip): Observable<Trip> {
    return this.http.post<Trip>(this.url, formData, { headers: this.getHeaders() });
  }

  // Method to retrieve a single trip by tripCode
  getTrip(tripCode: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.url}/${tripCode}`);
  }

  // Method to update an existing trip
  updateTrip(formData: Trip): Observable<Trip> {
    return this.http.put<Trip>(`${this.url}/${formData.code}`, formData, { headers: this.getHeaders() });
  }

  // Method to delete a trip
  deleteTrip(tripCode: string): Observable<any> {
    return this.http.delete(`${this.url}/${tripCode}`, { headers: this.getHeaders() });
  }

  // Call to our /login endpoint, returns JWT
  login(user: User, passwd: string): Observable<AuthResponse> {
    // console.log('Inside TripDataService::login');
    return this.handleAuthAPICall('login', user, passwd);
  }

  // Call to our /register endpoint, creates user and returns JWT
  register(user: User, passwd: string): Observable<AuthResponse> {
    // console.log('Inside TripDataService::register');
    return this.handleAuthAPICall('register', user, passwd);
  }

  // helper method to process both login and register methods
  handleAuthAPICall(endpoint: string, user: User, passwd: string): Observable<AuthResponse> {
    // console.log('Inside TripDataService::handleAuthAPICall');
    let formData = {
      name: user.name,
      email: user.email,
      password: passwd
    };
    return this.http.post<AuthResponse>(this.baseUrl + '/' + endpoint, formData);
  }

  getUsers(): Observable<UserAdmin[]> {
    return this.http.get<UserAdmin[]>(`${this.baseUrl}/users`, { headers: this.getHeaders() });
  }

  getUser(userId: string): Observable<UserAdmin> {
    return this.http.get<UserAdmin>(`${this.baseUrl}/users/${userId}`, { headers: this.getHeaders() });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${userId}`, { headers: this.getHeaders() });
  }

  getBookings(): Observable<Booking[]> {
    const url = `${this.baseUrl}/bookings`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  getBooking(bookingId: string): Observable<Booking> {
    const url = `${this.baseUrl}/bookings/${bookingId}`;
    return this.http.get<Booking>(url, { headers: this.getHeaders() });
  }

  updateBookingStatus(bookingId: string, status: string): Observable<Booking> {
    const url = `${this.baseUrl}/bookings/${bookingId}/status`;
    return this.http.patch<Booking>(url, { status }, { headers: this.getHeaders() });
  }

  deleteBooking(bookingId: string): Observable<any> {
    const url = `${this.baseUrl}/bookings/${bookingId}`;
    return this.http.delete(url, { headers: this.getHeaders() });
  }
}