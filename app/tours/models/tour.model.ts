import { KeyPoint } from "./keyPoint.model.js";

export interface Tour {
    id?: number;
    name: string;
    description: string;
    dateTime: string;
    maxGuests: number;
    guideId: number;
    status?: string;
    keyPoints: KeyPoint[];
}