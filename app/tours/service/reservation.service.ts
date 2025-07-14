import { Reservation } from "../models/reservation.model";


export class ReservationService {
    private apiUrl = 'http://localhost:48696/api/reservations';

    create(r: Reservation): Promise<Reservation> {
        return fetch(this.apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(r)
        }).then(async resonse => {
            if(!resonse.ok) throw new Error(await resonse.text());
            return resonse.json();
        });
    }

    getByUser(userId: number): Promise<Reservation[]> {
        return fetch(`${this.apiUrl}?userId=${userId}`)
            .then(response => response.json());
    }

    cancel(id: number, userId: number): Promise<void> {
        return fetch(`${this.apiUrl}/${id}?userId=${userId}`, {
            method: "DELETE"
        }).then(async response => {
            if (!response.ok) throw new Error(await response.text());
        });
    }
}