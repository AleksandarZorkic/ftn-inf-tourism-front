import { ReservationService } from "../../service/reservation.service.js";
import { TourService } from "../../service/tour.service.js";

const resSvc = new ReservationService();
const tourSvc = new TourService();
const userId = Number(localStorage.getItem("userId"));

async function load() {
  const reservations = await resSvc.getByUser(userId);
  const tbody = document.querySelector("#resTable tbody")!;
  tbody.innerHTML = "";
  for (const r of reservations) {
    const tour = await tourSvc.getTourById(String(r.tourId));
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${tour.name}</td>
            <td>${new Date(tour.dateTime).toLocaleDateString()}</td>
            <td>${r.numPeople}</td>
            <td>${new Date(r.createdAt!).toLocaleString("sr-Latn-RS", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</td>
            <td><button data-id="${r.id}">Otkaži</button></td>
        `;
    tbody.appendChild(tr);
  }
  tbody.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      try {
        await resSvc.cancel(id, userId);
        load();
      } catch (error: unknown) {
        let msg = "Došlo je do greške";
        if (error instanceof Error) {
          msg = error.message;
        }
        alert(msg);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", load);
