import { TourService } from "../../service/tour.service.js";
import { Tour } from "../../models/tour.model.js";

const tourService = new TourService();

function initializeForm(): void {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString)
    const id = urlParams.get('id');

    document.querySelector('#cancelBtn')
        ?.addEventListener('click', () => window.history.back());

    const button = document.querySelector('#submitBtn')
    if (button) {
        button.addEventListener('click', submit)
    }

    if (id) {
        tourService.getTourById(id)
            .then (tour => {
                (document.querySelector('#name') as HTMLInputElement).value = tour.name;
                (document.querySelector('#description') as HTMLInputElement).value = tour.description;
                (document.querySelector('#date') as HTMLInputElement).value = tour.dateTime;
                (document.querySelector('#maxParticipants') as HTMLInputElement).value = tour.maxGuests.toString();
            }).catch (error => {
                console.error(error.status, error.text);
            })
    }
}

function submit(): void {
    const name = (document.querySelector('#name') as HTMLInputElement).value.trim()
    const description = (document.querySelector('#description') as HTMLInputElement).value.trim()
    const date = (document.querySelector('#date') as HTMLInputElement).value.trim()
    const maxParticipants = (document.querySelector('#maxParticipants') as HTMLInputElement).value.trim()
    const authorId = Number(localStorage.getItem('userId'));

    const formData: Tour = {name: name, description: description, dateTime: date, maxGuests: Number(maxParticipants), guideId: Number(authorId)}
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id')

    if (id) {
        tourService.updateTour(id, formData)
        .then(() => {
            window.location.href = '../tour/tour.html'
        }).catch(error => {
            console.error(error.status, error.text);
        })
    } else {
        tourService.createTour(formData)
        .then (() => {
            window.location.href = '../tour/tour.html'
        }).catch(error =>{
            console.error(error.status, error.text);
        })
    }
}

document.addEventListener("DOMContentLoaded", initializeForm)