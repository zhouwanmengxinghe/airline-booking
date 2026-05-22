import mongoose, { Schema, Document, Types } from "mongoose";

const AIRPORTS = ["NZNE", "YSSY", "NZRO", "NZGB", "NZCI", "NZTL"] as const;
const AIRCRAFT_TYPES = ["SyberJet SJ30i", "Cirrus SF50", "HondaJet Elite"] as const;
const BOOKING_STATUSES = ["confirmed", "cancelled"] as const;

// ---------------------------------------------------------------------------
// Embedded booking sub-document
// ---------------------------------------------------------------------------

export interface IBookingEmbedded {
  _id?: Types.ObjectId;
  bookingReference: string;
  passengerId: Types.ObjectId;
  status: (typeof BOOKING_STATUSES)[number];
  createdAt: Date;
}

const BookingEmbeddedSchema = new Schema<IBookingEmbedded>(
  {
    bookingReference: {
      type: String,
      required: true,
      match: /^[A-Z0-9]{8}$/,
    },
    passengerId: {
      type: Schema.Types.ObjectId,
      ref: "Passenger",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: BOOKING_STATUSES,
      default: "confirmed",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ---------------------------------------------------------------------------
// Schedule (parent) document
// ---------------------------------------------------------------------------

export interface ISchedule extends Document {
  flightNumber: string;
  departureAirport: (typeof AIRPORTS)[number];
  arrivalAirport: (typeof AIRPORTS)[number];
  departureTimeUTC: Date;
  arrivalTimeUTC: Date;
  aircraftType: (typeof AIRCRAFT_TYPES)[number];
  totalSeats: number;
  remainingSeats: number;
  price: number;
  bookings: IBookingEmbedded[];
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    flightNumber: { type: String, required: true, unique: true },
    departureAirport: {
      type: String,
      required: true,
      enum: AIRPORTS,
      uppercase: true,
    },
    arrivalAirport: {
      type: String,
      required: true,
      enum: AIRPORTS,
      uppercase: true,
    },
    departureTimeUTC: { type: Date, required: true },
    arrivalTimeUTC: { type: Date, required: true },
    aircraftType: {
      type: String,
      required: true,
      enum: AIRCRAFT_TYPES,
    },
    totalSeats: { type: Number, required: true },
    remainingSeats: { type: Number, required: true },
    price: { type: Number, required: true },
    bookings: {
      type: [BookingEmbeddedSchema],
      default: [],
      validate: {
        validator: function (this: ISchedule, arr: IBookingEmbedded[]) {
          if (arr.length > this.totalSeats) return false;
          const refs = arr.map((b) => b.bookingReference);
          return new Set(refs).size === refs.length;
        },
        message:
          "Bookings validation failed: exceeds totalSeats or duplicate bookingReference",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Schedule ||
  mongoose.model<ISchedule>("Schedule", ScheduleSchema);
