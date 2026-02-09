import { Routes } from '@angular/router';
import { AddTripComponent } from './add-trip/add-trip.component';
import { EditTripComponent } from './edit-trip/edit-trip.component';
import { TripListingComponent } from './trip-listing/trip-listing.component';
import { LoginComponent } from './login/login.component';
import { UserListingComponent } from './user-listing/user-listing.component';
import { BookingListingComponent } from './booking-listing/booking-listing.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'add-trip', component: AddTripComponent },
    { path: 'edit-trip', component: EditTripComponent },
    { path: 'users', component: UserListingComponent },
    { path: 'bookings', component: BookingListingComponent },
    { path: '', component: TripListingComponent, pathMatch: 'full' }
];