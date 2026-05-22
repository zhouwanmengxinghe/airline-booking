import mongoose, { Schema, Document } from "mongoose";

const AIRPORTS = ["NZNE", "YSSY", "NZRO", "NZGB", "NZCI", "NZTL"] as const;
const AIRCRAFT_TYPES = ["SyberJet SJ30i", "Cirrus SF50", "HondaJet Elite"] as const;

export interface IFlight extends Document {
  flightNumber: string;
  departureAirport: (typeof AIRPORTS)[number];
  arrivalAirport: (typeof AIRPORTS)[number];
  departureTimeUTC: Date;
  arrivalTimeUTC: Date;
  aircraftType: (typeof AIRCRAFT_TYPES)[number];
  totalSeats: number;
  remainingSeats: number;
  price: number;
}

const FlightSchema = new Schema<IFlight>(
  {
    flightNumber: { type: String, required: true, unique: true },
    departureAirport: { type: String, required: true, enum: AIRPORTS, uppercase: true },
    arrivalAirport: { type: String, required: true, enum: AIRPORTS, uppercase: true },
    departureTimeUTC: { type: Date, required: true },
    arrivalTimeUTC: { type: Date, required: true },
    aircraftType: { type: String, required: true, enum: AIRCRAFT_TYPES },
    totalSeats: { type: Number, required: true },
    remainingSeats: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Flight ||
  mongoose.model<IFlight>("Flight", FlightSchema);
