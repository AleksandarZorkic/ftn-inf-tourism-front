import { TourService } from "../../service/tour.service.js";
import { KeyPointService } from "../../service/keyPoint.service.js";
import { Tour } from "../../models/tour.model.js";
import { KeyPoint } from "../../models/keyPoint.model.js";
import { notify } from "../../components/notify.js";

const tourSvc = new TourService();
const kpSvc = new KeyPointService();

const MIN_KP = 2;
let tourId = new URLSearchParams(window.location.search).get("id") || "";

let existingKps: KeyPoint[] = [];
const newKps: KeyPoint[] = [];
let currentIndex = 0;

function showStep(step: 1 | 2 | 3): void {
  document
    .querySelectorAll<HTMLElement>(".step-indicator .step")
    .forEach((el) => {
      const num = Number(el.dataset.step);
      el.classList.toggle("active", num === step);
    });

  [1, 2, 3].forEach((n) => {
    const section = document.getElementById(`step-${n}`);
    if (section) {
      section.classList.toggle("hidden", n !== step);
    }
  });
}

function updateKpUI() {
  const all = [...existingKps, ...newKps];

  document.getElementById("kpIndex")!.textContent = String(currentIndex + 1);
  document.getElementById("kpMax")!.textContent = String(all.length);

  const tbody =
    document.querySelector<HTMLTableSectionElement>("#kpTable tbody")!;
  tbody.innerHTML = all
    .map(
      (kp, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${kp.name}</td>
        <td>${kp.description}</td>
        <td><img src="${kp.imageUrl}" style="height:40px" alt="${
        kp.name
      }" /></td>
        <td>${kp.latitude}</td>
        <td>${kp.longitude}</td>
        <td>
          <button class="edit-kp" data-index="${i}">Edit</button>
          <button class="delete-kp" data-index="${i}">Delete</button>
        </td>
      </tr>`
    )
    .join("");

  const kpNextBtn = document.getElementById("kp-next") as HTMLButtonElement;
  const kpSaveBtn = document.getElementById("kp-save") as HTMLButtonElement;
  kpSaveBtn.classList.add("hidden");
  kpNextBtn.classList.remove("hidden");

  tbody.querySelectorAll<HTMLButtonElement>("button.edit-kp").forEach((btn) => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.index);
      currentIndex = idx;
      fillKpForm(idx);

      kpNextBtn.classList.add("hidden");
      kpSaveBtn.classList.remove("hidden");
    };
  });

  tbody
    .querySelectorAll<HTMLButtonElement>("button.delete-kp")
    .forEach((btn) => {
      btn.onclick = onDeleteKp;
    });

  const toStep3Btn = document.getElementById("to-step-3") as HTMLButtonElement;
  if (all.length >= MIN_KP) {
    toStep3Btn.classList.remove("hidden");
  } else {
    toStep3Btn.classList.add("hidden");
  }
}

function renderSummary() {
  document.getElementById("sumName")!.textContent = (
    document.getElementById("name") as HTMLInputElement
  ).value;
  document.getElementById("sumDesc")!.textContent = (
    document.getElementById("description") as HTMLTextAreaElement
  ).value;
  document.getElementById("sumDate")!.textContent = (
    document.getElementById("date") as HTMLInputElement
  ).value;
  document.getElementById("sumMax")!.textContent = (
    document.getElementById("maxParticipants") as HTMLInputElement
  ).value;

  const ul = document.getElementById("sumKeypoints")!;
  const all = [...existingKps, ...newKps];
  ul.innerHTML = all
    .map(
      (kp, i) =>
        `<li>${i + 1}. <strong>${kp.name}</strong>: ${kp.description}</li>`
    )
    .join("");
}

function updatePublishButton() {
  const total = existingKps.length + newKps.length;
  (document.getElementById("publishBtn") as HTMLButtonElement).disabled =
    total < MIN_KP;
}

document.addEventListener("DOMContentLoaded", async () => {
  const toStep2Btn = document.getElementById("to-step-2") as HTMLButtonElement;
  const trSaveBtn = document.getElementById("tr-save") as HTMLButtonElement;
  const trBackBtn = document.getElementById("tr-back") as HTMLButtonElement;

  const kpBackBtn = document.getElementById("kp-back") as HTMLButtonElement;
  const kpNextBtn = document.getElementById("kp-next") as HTMLButtonElement;
  const kpSaveBtn = document.getElementById("kp-save") as HTMLButtonElement;
  const toStep3Btn = document.getElementById("to-step-3") as HTMLButtonElement;

  const summaryBackBtn = document.getElementById(
    "summary-back"
  ) as HTMLButtonElement;
  const publishBtn = document.getElementById("publishBtn") as HTMLButtonElement;

  trSaveBtn.onclick = async () => {
    const t = readTourData("u pripremi");
    if (!t) return;
    if (!tourId) {
      const created = await tourSvc.createTour(t);
      tourId = String(created.id);
    } else {
      await tourSvc.updateTour(tourId, t);
    }
    location.href = "../tour/tour.html";
  };

  toStep2Btn.onclick = async () => {
    const t = readTourData("u pripremi");
    if (!t) return;
    if (!tourId) {
      const created = await tourSvc.createTour(t);
      tourId = String(created.id);
    } else {
      await tourSvc.updateTour(tourId, t);
    }
    existingKps = await kpSvc.getKeyPoints(tourId);
    currentIndex = existingKps.length;
    clearKpForm();
    showStep(2);
    updateKpUI();
  };

  trBackBtn.onclick = () => history.back();

  kpBackBtn.onclick = () => showStep(1);

  kpNextBtn.onclick = async () => {
    const kp = readKpData();
    if (!kp) return;
    if (currentIndex < existingKps.length) {
      kp.id = existingKps[currentIndex].id;
      kp.order = existingKps[currentIndex].order;
      await kpSvc.updateKeyPoint(tourId, String(kp.id!), kp);
      existingKps[currentIndex] = kp;
    } else {
      kp.order = existingKps.length + newKps.length + 1;
      const created = await kpSvc.createKeyPoint(tourId, kp);
      newKps.push(created);
    }
    currentIndex++;
    if (currentIndex < existingKps.length) {
      fillKpForm(currentIndex);
    } else {
      clearKpForm();
    }
    updateKpUI();
  };

  kpSaveBtn.onclick = async () => {
    const kp = readKpData();
    if (!kp) return;
    kp.id = existingKps[currentIndex].id;
    kp.order = existingKps[currentIndex].order;
    await kpSvc.updateKeyPoint(tourId, String(kp.id!), kp);
    existingKps[currentIndex] = kp;
    clearKpForm();
    updateKpUI();
  };

  toStep3Btn.onclick = () => {
    renderSummary();
    showStep(3);
    updatePublishButton();
  };

  summaryBackBtn.onclick = () => showStep(2);
  publishBtn.onclick = async () => {
    const t = readTourData("objavljeno");
    if (!t) return;
    await tourSvc.updateTour(tourId, t);
    notify.success("Tura je objavljena!");
    location.href = "../tour/tour.html";
  };

  if (tourId) {
    try {
      const tour = await tourSvc.getTourById(tourId);
      (document.getElementById("name") as HTMLInputElement).value = tour.name;
      (document.getElementById("description") as HTMLTextAreaElement).value =
        tour.description;

      const dt = new Date(tour.dateTime);
      (document.getElementById("date") as HTMLInputElement).value = dt
        .toISOString()
        .slice(0, 16);

      (document.getElementById("maxParticipants") as HTMLInputElement).value =
        String(tour.maxGuests);
    } catch (error) {
      console.error(error);
      notify.error(error?.message || "Ne mogu da učitam turu.");
    }
  }

  showStep(1);
});

function readTourData(status: string): Tour | null {
  const name = (
    document.getElementById("name") as HTMLInputElement
  ).value.trim();
  const description = (
    document.getElementById("description") as HTMLTextAreaElement
  ).value.trim();
  const dateTime = (document.getElementById("date") as HTMLInputElement).value;
  const maxGuests = Number(
    (document.getElementById("maxParticipants") as HTMLInputElement).value
  );
  const guideId = Number(localStorage.getItem("userId"));

  if (name.length < 3) {
    notify.info("Naziv min 3 karaktera.");
    return null;
  }
  if (description.length < 250) {
    notify.info("Opis min 250 karaktera.");
    return null;
  }
  if (!dateTime) {
    notify.info("Unesite datum i vreme.");
    return null;
  }
  if (isNaN(maxGuests) || maxGuests < 1) {
    notify.info("Max učesnika ≥1.");
    return null;
  }

  return {
    id: tourId ? Number(tourId) : undefined,
    name,
    description,
    dateTime,
    maxGuests,
    guideId,
    status,
    keyPoints: [],
    reservedCount: 0,
    availableSeats: maxGuests,
  };
}

function readKpData(): KeyPoint | null {
  const name = (
    document.getElementById("kpName") as HTMLInputElement
  ).value.trim();
  const description = (
    document.getElementById("kpDesc") as HTMLTextAreaElement
  ).value.trim();
  const imageUrl = (
    document.getElementById("kpImageUrl") as HTMLInputElement
  ).value.trim();
  const latitude = parseFloat(
    (document.getElementById("kpLat") as HTMLInputElement).value
  );
  const longitude = parseFloat(
    (document.getElementById("kpLng") as HTMLInputElement).value
  );

  if (
    !name ||
    !description ||
    !imageUrl ||
    isNaN(latitude) ||
    isNaN(longitude)
  ) {
    notify.info("Popunite sva polja ključne tačke.");
    return null;
  }
  return {
    id: undefined,
    order: 0,
    name,
    description,
    imageUrl,
    latitude,
    longitude,
    tourId: tourId ? Number(tourId) : 0,
  };
}

function fillKpForm(i: number) {
  const kp = [...existingKps, ...newKps][i];
  (document.getElementById("kpName") as HTMLInputElement).value = kp.name;
  (document.getElementById("kpDesc") as HTMLTextAreaElement).value =
    kp.description;
  (document.getElementById("kpImageUrl") as HTMLInputElement).value =
    kp.imageUrl;
  (document.getElementById("kpLat") as HTMLInputElement).value = String(
    kp.latitude
  );
  (document.getElementById("kpLng") as HTMLInputElement).value = String(
    kp.longitude
  );
}

async function onDeleteKp(this: HTMLButtonElement) {
  const idx = Number(this.dataset.index);
  if (idx < existingKps.length) {
    await kpSvc.deleteKeyPoint(tourId, String(existingKps[idx].id!));
    existingKps.splice(idx, 1);
  } else {
    newKps.splice(idx - existingKps.length, 1);
  }
  if (currentIndex > existingKps.length) currentIndex = existingKps.length;
  updateKpUI();
}

function clearKpForm() {
  ["kpName", "kpDesc", "kpImageUrl", "kpLat", "kpLng"].forEach((id) => {
    const el = document.getElementById(id);
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
      el.value = "";
  });
}
