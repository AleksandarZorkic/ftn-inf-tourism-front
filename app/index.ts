import { Tour } from "./tours/models/tour.model.js";
import { TourService } from "./tours/service/tour.service.js";

const tourService = new TourService();
let currentPage = 1;
let currentSize = 10;
let currentOrderBy = "Name";
let currentDir = "ASC";

document.addEventListener("DOMContentLoaded", () => {
  initControls();
  loadTours();
});

function initControls(): void {
  const pageSizeSelect = document.getElementById(
    "pageSize"
  ) as HTMLSelectElement;
  pageSizeSelect.addEventListener("change", () => {
    currentSize = parseInt(pageSizeSelect.value, 10);
    currentPage = 1;
    loadTours();
  });

  document.getElementById("prevPage")!.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadTours();
    }
  });

  document.getElementById("nextPage")!.addEventListener("click", () => {
    currentPage++;
    loadTours();
  });

  document.querySelectorAll("th.sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const col = (th as HTMLElement).dataset.column!;
      if (currentOrderBy === col) {
        currentDir = currentDir === "ASC" ? "DESC" : "ASC";
      } else {
        currentOrderBy = col;
        currentDir = "ASC";
      }
      currentPage = 1;
      loadTours();
    });
  });
}

async function loadTours(): Promise<void> {
  try {
    const response = await tourService.getPublishedTours(
      currentPage,
      currentSize,
      currentOrderBy,
      currentDir
    );
    const { data, totalCount } = response;
    renderTable(data);
    updatePagination(totalCount);
  } catch (err) {
    console.error("Greška pri učitavanju tura:", err);
    alert("Došlo je do greške pri učitavanju tura.");
  }
}

function renderTable(tours: Tour[]): void {
  const tbody = document.querySelector(
    "#toursTable tbody"
  ) as HTMLTableSectionElement;
  tbody.innerHTML = "";

  tours.forEach((tour) => {
    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.textContent = tour.name;
    tr.appendChild(tdName);

    const tdDate = document.createElement("td");
    tdDate.textContent = new Date(tour.dateTime).toLocaleString("sr-Latn-RS", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    tr.appendChild(tdDate);

    const tdMax = document.createElement("td");
    tdMax.textContent = String(tour.maxGuests);
    tr.appendChild(tdMax);

    const tdDesc = document.createElement("td");
    tdDesc.textContent =
      tour.description.length > 250
        ? tour.description.slice(0, 250) + "…"
        : tour.description;
    tr.appendChild(tdDesc);

    const tdAvail = document.createElement("td");
    tdAvail.textContent = String(tour.availableSeats);
    tr.appendChild(tdAvail);

    const tdDetail = document.createElement("td");
    const link = document.createElement("a");
    link.href = `tours/pages/details/details.html?id=${tour.id}`;
    link.textContent = "Rezervisi";
    tdDetail.appendChild(link);
    tr.appendChild(tdDetail);

    tbody.appendChild(tr);
  });
}

function updatePagination(totalCount: number): void {
  const totalPages = Math.ceil(totalCount / currentSize);
  document.getElementById(
    "pageInfo"
  )!.textContent = `Strana ${currentPage} od ${totalPages}`;

  (document.getElementById("prevPage") as HTMLButtonElement).disabled =
    currentPage <= 1;
  (document.getElementById("nextPage") as HTMLButtonElement).disabled =
    currentPage >= totalPages;
}
