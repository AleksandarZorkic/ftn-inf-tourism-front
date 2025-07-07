import { TourService } from "../../service/tour.service.js";
import { Tour } from "../../models/tour.model.js";


const tourService = new TourService();

function initialize(): void {
    const addBtn = document.querySelector('#addBtn') as HTMLButtonElement | null;
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            window.location.href = '../tourForm/tourForm.html';
        });
    }
    loadTours();
}

function loadTours(): void {
    const userId = localStorage.getItem('userId')!;
    tourService.getToursByAuthor(userId)
        .then((tours: Tour[]) => {
            renderData(tours);
        })
        .catch(error => {
            console.error('Error loading tours: ', error instanceof Error ? error.message : String (error));
            const table = document.querySelector('table') as HTMLTableElement | null;
            if (table) table.style.display = 'none';
            alert('Error loading tours. Please try again');
        });
}

function renderData(data: Tour[]): void {
    const tbody = document.querySelector('table tbody') as HTMLTableSectionElement | null;
    const thead = document.querySelector('table thead') as HTMLTableSectionElement | null;
    const noData = document.querySelector('#no-data-message') as HTMLElement | null;
    if (!tbody || !thead || !noData) return;
    tbody.innerHTML = '';

    if (data.length === 0) {
    document.querySelector('table')?.classList.add('hidden');
    noData?.classList.remove('hidden');
    return;
    }

    noData?.classList.add('hidden');
    document.querySelector('table')?.classList.remove('hidden');
    thead.classList.remove('hidden');


    for (const tour of data) {
        const tr = document.createElement('tr');
        [
            (tour.id!).toString(),
            tour.name,
            tour.description,
            tour.status || '-',
            tour.dateTime,
            tour.maxGuests.toString(),
        ].forEach(text => {
            const td = document.createElement('td');
            td.textContent = text;
            tr.appendChild(td);
        });
        const tdEdit = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Izmeni';
        editButton.addEventListener('click', () => {
            window.location.href = '../tourForm/tourForm.html?id=' + tour.id;
        });
        tdEdit.appendChild(editButton);
        tr.appendChild(tdEdit);
        tbody.appendChild(tr);

        const tdDelete = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Obriši';

        deleteButton.onclick = function () {
            tourService.deleteTour(tour.id.toString())
                .then(() => {loadTours()
                })
                .catch(error => {
                    console.error(error.status, error.message);
                });
        }
        tdDelete.appendChild(deleteButton)
        tr.appendChild(tdDelete)

        const userId = localStorage.getItem('userId');
        
        if (!userId) {
        alert('Niste ulogovani');
        return;
        }
    }
}

document.addEventListener('DOMContentLoaded', initialize);