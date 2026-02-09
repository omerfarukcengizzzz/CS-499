export interface Booking {
    _id: string;
    tripCode: string;
    tripName: string;
    userEmail: string;
    userName: string;
    travelers: number;
    totalPrice: number;
    bookingDate: Date;
    travelDate: Date;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    specialRequests?: string;
    contactPhone?: string;
}
