import { TourService } from "../../service/tour.service.js";
import { ReservationService } from "../../service/reservation.service.js";
import { Tour } from "../../models/tour.model.js";

const tourSvc = new TourService();
const resSvc = new ReservationService();
const userId = Number(localStorage.getItem("userId"));
const tourId = Number(new URLSearchParams(location.search).get("id"));

const nameEl = document.getElementById("tourName")! as HTMLElement;
const descEl = document.getElementById("tourDesc")! as HTMLElement;
const dateEl = document.getElementById("tourDate")! as HTMLElement;
const maxEl = document.getElementById("tourMax")! as HTMLElement;
const availEl = document.getElementById("tourAvailable")! as HTMLElement;
const kpList = document.getElementById("keypointList")! as HTMLUListElement;
const numInput = document.getElementById("numPeople")! as HTMLInputElement;
const reserveBtn = document.getElementById("reserveBtn")! as HTMLButtonElement;
const errorEl = document.getElementById("reserveError")! as HTMLElement;
const toastDuration = 1000;

async function loadDetails(): Promise<void> {
  try {
    const tour: Tour = await tourSvc.getTourById(String(tourId));

    nameEl.textContent = tour.name;
    descEl.textContent = tour.description;
    dateEl.textContent = new Date(tour.dateTime).toLocaleString("sr-Latn-RS", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    maxEl.textContent = String(tour.maxGuests);
    availEl.textContent = String(tour.availableSeats);

    numInput.min = "1";
    numInput.max = String(tour.availableSeats);
    reserveBtn.disabled = tour.availableSeats === 0;

    kpList.innerHTML = "";
    for (const kp of tour.keyPoints) {
      const li = document.createElement("li");

      const img = document.createElement("img");
      img.src = kp.imageUrl;
      img.alt = kp.name;
      img.style.maxWidth = "100%";
      img.style.borderRadius = "4px";

      const h3 = document.createElement("h3");
      h3.textContent = kp.name;

      const p = document.createElement("p");
      p.textContent = kp.description;

      li.append(img, h3, p);
      kpList.appendChild(li);
    }

    errorEl.textContent = "";
  } catch (e) {
    console.error("Greška pri učitavanju detalja ture:", e);
    showMsg("Ne mogu da učitam detalje ture.", "error");
  }
}

reserveBtn.addEventListener("click", async () => {
  const num = Number(numInput.value);

  if (num < 1 || num > Number(numInput.max)) {
    const msg = `Trenutno je dostupno samo ${numInput.max} mesta.`;
    errorEl.textContent = msg;
    showMsg(msg, "error");
    return;
  }

  try {
    await resSvc.create({ tourId, userId, numPeople: num });
    showMsg("Rezervacija uspešna!", "success", toastDuration);
    errorEl.textContent = "";
    await loadDetails();

    setTimeout(() => {
      window.location.href = "../../../index.html";
    }, toastDuration);
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : "Došlo je do greške pri rezervaciji.";
    errorEl.textContent = msg;
    showMsg(msg, "error");
  }
});

function showMsg(
  message: string,
  type: "success" | "error" = "success",
  duration = 2000
) {
  const container = document.getElementById("toast-container")!;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => {
      toast.remove();
    });
  }, duration);
}

document.addEventListener("DOMContentLoaded", loadDetails);
