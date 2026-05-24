import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Schedule from "@/models/Schedule";
import Passenger from "@/models/Passenger";
import { formatLocalTime } from "@/utils/timezone";

//  GET /api/bookings/:bookingReference 
export async function GET(
  _request: NextRequest,
  { params }: { params: { bookingReference: string } }
) {
  try {
    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schedule: any = await Schedule.findOne({
      "bookings.bookingReference": params.bookingReference,
    }).lean();

    if (!schedule) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = schedule.bookings.find(
      (b: { bookingReference: string }) =>
        b.bookingReference === params.bookingReference
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const passenger: any = await Passenger.findById(booking.passengerId).lean();

    return NextResponse.json({
      bookingReference: booking.bookingReference,
      status: booking.status,
      createdAt: booking.createdAt,
      flight: {
        _id: schedule._id.toString(),
        flightNumber: schedule.flightNumber,
        departureAirport: schedule.departureAirport,
        arrivalAirport: schedule.arrivalAirport,
        departureTimeUTC: schedule.departureTimeUTC,
        arrivalTimeUTC: schedule.arrivalTimeUTC,
        departureTimeLocal: formatLocalTime(
          new Date(schedule.departureTimeUTC),
          schedule.departureAirport
        ),
        arrivalTimeLocal: formatLocalTime(
          new Date(schedule.arrivalTimeUTC),
          schedule.arrivalAirport
        ),
        aircraftType: schedule.aircraftType,
        totalSeats: schedule.totalSeats,
        price: schedule.price,
      },
      passenger: passenger
        ? {
            _id: passenger._id.toString(),
            fullName: passenger.fullName,
            email: passenger.email,
            phone: passenger.phone,
          }
        : null,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

//  DELETE /api/bookings/:bookingReference 

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { bookingReference: string } }
) {
  try {
    await connectDB();

    const schedule = await Schedule.findOneAndUpdate(
      {
        "bookings.bookingReference": params.bookingReference,
        "bookings.status": "confirmed",
      },
      {
        $inc: { remainingSeats: 1 },
        $set: { "bookings.$.status": "cancelled" },
      },
      { new: true }
    );

    if (!schedule) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const exists: any = await Schedule.findOne({
        "bookings.bookingReference": params.bookingReference,
      }).lean();

      if (!exists) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 409 }
      );
    }

    return NextResponse.json({ message: "Booking cancelled successfully" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
