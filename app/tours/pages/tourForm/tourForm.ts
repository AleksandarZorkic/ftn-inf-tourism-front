import { TourService } from "../../service/tour.service.js";
import { KeyPointService } from "../../service/keyPoint.service.js";
import { Tour } from "../../models/tour.model.js";
import { KeyPoint } from "../../models/keyPoint.model.js";

const tourService = new TourService();
const keyPointService = new KeyPointService();

const MIN_KP = 2;
let tourId = new URLSearchParams(window.location.search).get("id") || "";

let existingKps: KeyPoint[] = [];
const newKps: KeyPoint[] = [];
let currentIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("kpNext")?.addEventListener("click", onNextKp);
    document.getElementById("kpFinish")?.addEventListener("click", onFinishKp);
    document.getElementById("kpCancel")?.addEventListener("click", () => history.back());

    document.getElementById("back3")?.addEventListener("click", showKpStep);
    document.getElementById("submitBtn")?.addEventListener("click", saveTour);
    document.getElementById("publishBtn")?.addEventListener("click", publishTour);

    document.getElementById("description")?.addEventListener("input", updatePublishButton);
    document.getElementById("keypointsList")?.addEventListener("click", onDeleteKp);

    if (tourId) {
        loadExistingTour();
    } else {
        showKpStep();
        updatePublishButton();
        updateKpUI();
    }
});

function showKpStep() {
    document.getElementById("kp-step")!.classList.remove("hidden");
    document.getElementById("step-3")!.classList.add("hidden");

    if (tourId && currentIndex < existingKps.length) {
        fillKpForm(currentIndex);
    } else {
        clearKpForm();
    }
     updateKpUI();
}
function showTourForm() {
    document.getElementById("kp-step")!.classList.add("hidden");
    document.getElementById("step-3")!.classList.remove("hidden");
    updatePublishButton();
}

function updatePublishButton() {
    const desc = (document.getElementById("description") as HTMLTextAreaElement).value;
    const btn = document.getElementById("publishBtn") as HTMLButtonElement;
    btn.disabled = !((existingKps.length + newKps.length) >= MIN_KP && desc.length >= 250);
}

function updateKpUI() {
  const total = existingKps.length + newKps.length;

  document.getElementById('kpIndex')!.textContent = String(currentIndex + 1);
  document.getElementById('kpMax')!.textContent   = String(total);


  const all = [...existingKps, ...newKps];
  const ul = document.getElementById("keypointsList")!;
  ul.innerHTML = all.map((kp, i) => `
    <li>
      ${i+1}. ${kp.name}
      <button class="delete-kp" data-index="${i}" type="button">Obriši</button>
    </li>
  `).join("");

  document.getElementById("kpFinish")!
    .classList.toggle("hidden", total < MIN_KP);
}


function readKp(): KeyPoint | null {
    const get = (id: string) =>
        (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement).value.trim();
    const name = get("kpName"),
        desc = get("kpDesc"),
        img = get("kpImageUrl"),
        lat = parseFloat(get("kpLat")),
        lng = parseFloat(get("kpLng"));
    if (!name || !desc || !img || isNaN(lat) || isNaN(lng)) {
        alert("Popunite sva polja ključne tačke.");
        return null;
    }
    return {
        id: undefined,
        order: existingKps.length + newKps.length + 1,
        name,
        description: desc,
        imageUrl: img,
        latitude: lat,
        longitude: lng,
        tourId: tourId ? Number(tourId) : 0
    };
}

function fillKpForm(i: number) {
    const kp = existingKps[i];
    (document.getElementById("kpName") as HTMLInputElement).value = kp.name;
    (document.getElementById("kpDesc") as HTMLTextAreaElement).value = kp.description;
    (document.getElementById("kpImageUrl") as HTMLInputElement).value = kp.imageUrl;
    (document.getElementById("kpLat") as HTMLInputElement).value = String(kp.latitude);
    (document.getElementById("kpLng") as HTMLInputElement).value = String(kp.longitude);
}

function clearKpForm() {
    ["kpName", "kpDesc", "kpImageUrl", "kpLat", "kpLng"]
        .forEach(id => {
            const el = document.getElementById(id);
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.value = "";
        });
}

async function onNextKp() {
    const kp = readKp();
    if (!kp) return;

    if (currentIndex < existingKps.length) {
        const old = existingKps[currentIndex];
        kp.id = old.id;
        kp.tourId = old.tourId;
        await keyPointService.updateKeyPoint(tourId, String(kp.id!), kp);
        existingKps[currentIndex] = kp;
    } else {
        newKps.push(kp);
        if (tourId) {
            kp.tourId = Number(tourId);
            const created = await keyPointService.createKeyPoint(tourId, kp);
            newKps[newKps.length - 1] = created;
        }
    }

    currentIndex++;

    if (currentIndex < existingKps.length) {
        fillKpForm(currentIndex);
    } else {
        clearKpForm();
    }

    updateKpUI();
}

function onFinishKp() {
    const total = existingKps.length + newKps.length;
    if (total < MIN_KP) {
        alert(`Morate uneti bar ${MIN_KP} tačke.`);
        return;
    }
    showTourForm();
}

async function saveTour() {
    const t = readTourData("u pripremi");
    if (!t) return;

    if (!tourId) {
        const created = await tourService.createTour(t);
        tourId = String(created.id);

        for (const kp of newKps) {
            kp.tourId = Number(tourId);
            await keyPointService.createKeyPoint(tourId, kp);
        }
    } else {
        await tourService.updateTour(tourId, t);
    }

    window.location.href = "../tour/tour.html";
}


async function publishTour() {
    if (!tourId) await saveTour();
    const t = readTourData("objavljeno");
    if (!t) return;
    await tourService.updateTour(tourId, t);
    alert("Tura je objavljena!");
    window.location.href = "../tour/tour.html";
}

function readTourData(status: string): Tour | null {
    const nameEl = document.getElementById("name") as HTMLInputElement;
    const descEl = document.getElementById("description") as HTMLTextAreaElement;
    const dateEl = document.getElementById("date") as HTMLInputElement;
    const maxEl = document.getElementById("maxParticipants") as HTMLInputElement;

    const name = nameEl.value.trim();
    const description = descEl.value.trim();
    const dateTime = dateEl.value;
    const maxGuests = Number(maxEl.value);
    const guideId = Number(localStorage.getItem("userId"));

    if (!name || name.length < 3) { alert("Naziv min 3 karaktera."); return null; }
    if (!description || description.length < 250) { alert("Opis min 250 karaktera."); return null; }
    if (!dateTime) { alert("Unesite datum i vreme."); return null; }
    if (isNaN(maxGuests) || maxGuests < 1) { alert("Max učesnika ≥1."); return null; }

    return {
        id: tourId ? Number(tourId) : undefined,
        name, description, dateTime, maxGuests, guideId,
        status, keyPoints: []
    };
}

async function loadExistingTour() {
    const tour = await tourService.getTourById(tourId);
    (document.getElementById("name") as HTMLInputElement).value = tour.name;
    (document.getElementById("description") as HTMLTextAreaElement).value = tour.description;
    (document.getElementById("date") as HTMLInputElement).value = tour.dateTime;
    (document.getElementById("maxParticipants") as HTMLInputElement).value = String(tour.maxGuests);

    existingKps = await keyPointService.getKeyPoints(tourId);
    currentIndex = 0;

    showKpStep();
    updatePublishButton();
    updateKpUI();
}

async function onDeleteKp(ev: Event) {
  const btn = (ev.target as HTMLElement).closest(".delete-kp") as HTMLElement;
  if (!btn) return;
  const idx = Number(btn.dataset.index);

  if (idx < existingKps.length) {
    const kpToDel = existingKps.splice(idx, 1)[0];
    await keyPointService.deleteKeyPoint(tourId, String(kpToDel.id!));
    if (currentIndex > existingKps.length) currentIndex = existingKps.length;
  } else {
    newKps.splice(idx - existingKps.length, 1);
  }

  updateKpUI();
  showKpStep();
  updatePublishButton();
}
