import { notify } from "../../components/notify.js";
import { Tour } from "../../models/tour.model.js";
import { TourService } from "../../service/tour.service.js";

const tourService = new TourService();

function initialize(): void {
  const addBtn = document.querySelector("#addBtn") as HTMLButtonElement | null;
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      window.location.href = "../tourForm/tourForm.html";
    });
  }
  loadTours();
}

async function loadTours(): Promise<void> {
  const userId = localStorage.getItem("userId")!;
  try {
    const tours = await tourService.getToursByAuthor(userId);
    renderData(tours);
  } catch (error) {
    console.error("Error loading tours:", error);
    const table = document.querySelector("table") as HTMLTableElement | null;
    if (table) table.style.display = "none";
    notify.error("Error loading tours. Please try again");
  }
}

function renderData(data: Tour[]): void {
  const tbody = document.querySelector("table tbody")!;
  const thead = document.querySelector("table thead")!;
  const noData = document.querySelector("#no-data-message")!;

  tbody.innerHTML = "";
  if (data.length === 0) {
    document.querySelector("table")?.classList.add("hidden");
    noData.classList.remove("hidden");
    notify.info("Trenutno nema tura za prikaz.");
    return;
  }

  noData.classList.add("hidden");
  document.querySelector("table")?.classList.remove("hidden");
  thead.classList.remove("hidden");

  data.forEach((tour) => {
    const tr = document.createElement("tr");

    const formattedDate = new Date(tour.dateTime).toLocaleString("sr-Latn-RS", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    [
      tour.id!.toString(),
      tour.name,
      tour.description,
      tour.status || "-",
      formattedDate,
      tour.maxGuests.toString(),
    ].forEach((text) => {
      const td = document.createElement("td");
      td.textContent = text;
      tr.appendChild(td);
    });

    const tdEdit = document.createElement("td");
    const editButton = document.createElement("button");
    editButton.textContent = "Izmeni";
    editButton.addEventListener("click", () => {
      window.location.href = `../tourForm/tourForm.html?id=${tour.id}`;
    });
    tdEdit.appendChild(editButton);
    tr.appendChild(tdEdit);

    const tdDelete = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Obriši";
    deleteButton.addEventListener("click", async () => {
      const count = tour.reservedCount ?? 0;
      const msg =
        count > 0
          ? `Ova tura ima ${count} rezervacija.\nDa li ste sigurni da je želite obrisati?`
          : "Da li ste sigurni da želite obrisati ovu turu?";

      const ok = await confirmDialog(msg);
      if (!ok) {
        notify.info("Brisanje otkazano.");
        return;
      }

      try {
        await tourService.deleteTour(String(tour.id));
        notify.success("Tura je obrisana.");
        loadTours();
      } catch (error) {
        if (error?.status === 400 && error?.message) {
          notify.error(error.message);
        } else {
          console.error(error);
          notify.error("Greška pri brisanju ture. Pokušajte ponovo.");
        }
      }
    });
    tdDelete.appendChild(deleteButton);
    tr.appendChild(tdDelete);

    tbody.appendChild(tr);
  });
}
function confirmDialog(
  message: string,
  yes = "Da",
  no = "Ne"
): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    const box = document.createElement("div");
    box.className = "modal-box";

    const p = document.createElement("p");
    p.textContent = message;

    const y = document.createElement("button");
    y.className = "modal-btn yes";
    y.textContent = yes;
    const n = document.createElement("button");
    n.className = "modal-btn no";
    n.textContent = no;

    box.append(p, y, n);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    const close = (v: boolean) => {
      overlay.remove();
      resolve(v);
    };
    y.onclick = () => close(true);
    n.onclick = () => close(false);
    overlay.onclick = (e) => {
      if (e.target === overlay) close(false);
    };
  });
}

document.addEventListener("DOMContentLoaded", initialize);
