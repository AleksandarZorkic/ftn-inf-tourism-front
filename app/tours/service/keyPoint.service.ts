import { KeyPoint } from "../models/keyPoint.model.js";

export class KeyPointService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = "http://localhost:48696/api/tours";
  }

  getKeyPoints(tourId: string): Promise<KeyPoint[]> {
    return fetch(`${this.apiUrl}/${tourId}/key-points`).then(
      async (response) => {
        if (!response.ok) {
          const msg = await response.text();
          throw { status: response.status, message: msg };
        }
        return response.json();
      }
    );
  }

  createKeyPoint(tourId: string, keyPoint: KeyPoint): Promise<KeyPoint> {
    return fetch(`${this.apiUrl}/${tourId}/key-points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(keyPoint),
    }).then(async (response) => {
      if (!response.ok) {
        const msg = await response.text();
        throw { status: response.status, message: msg };
      }
      return response.json();
    });
  }

  updateKeyPoint(
    tourId: string,
    keyPointId: string,
    keyPoint: KeyPoint
  ): Promise<KeyPoint> {
    return fetch(`${this.apiUrl}/${tourId}/key-points/${keyPointId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(keyPoint),
    }).then(async (response) => {
      if (!response.ok) {
        const msg = await response.text();
        throw { status: response.status, message: msg };
      }
      return response.json();
    });
  }

  deleteKeyPoint(tourId: string, keyPointId: string): Promise<void> {
    return fetch(`${this.apiUrl}/${tourId}/key-points/${keyPointId}`, {
      method: "DELETE",
    }).then(async (response) => {
      if (!response.ok) {
        const msg = await response.text();
        throw { status: response.status, message: msg };
      }
    });
  }
}
