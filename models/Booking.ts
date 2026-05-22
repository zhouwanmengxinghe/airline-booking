import mongoose, { Schema, Document, Types } from "mongoose";

const BOOKING_STATUSES = ["confirmed", "cancelled"] as const;

export interface IPassenger {
  fullName: string;
  email: string;
  phone: string;
}

export interface IBooking extends Document {
  bookingReference: string;
  flightId: Types.ObjectId;
  passenger: IPassenger;
  status: (typeof BOOKING_STATUSES)[number];
  createdAt: Date;
}

const PassengerSchema = new Schema<IPassenger>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      match: /^[A-Z0-9]{8}$/,
    },
    flightId: { type: Schema.Types.ObjectId, ref: "Flight", required: true },
    passenger: { type: PassengerSchema, required: true },
    status: {
      type: String,
      required: true,
      enum: BOOKING_STATUSES,
      default: "confirmed",
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

export default mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);
