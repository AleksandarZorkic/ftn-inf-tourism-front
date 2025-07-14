export interface Reservation {
    id?: number;
    tourId: number;
    userId: number;
    numPeople: number;
    createdAt?: string;
}