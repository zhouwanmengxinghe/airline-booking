import mongoose, { Schema, Document } from "mongoose";

export interface Passenger extends Document {
  fullName: string;
  email: string;
  phone: string;
  createdAt: Date;
}

const PassengerSchema = new Schema<Passenger>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

export default mongoose.models.Passenger ||
  mongoose.model<Passenger>("Passenger", PassengerSchema);
