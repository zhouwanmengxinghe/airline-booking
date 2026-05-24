import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Schedule from "@/models/Schedule";
import Passenger from "@/models/Passenger";
import { formatLocalTime } from "@/utils/timezone";
import { v4 as uuidv4 } from "uuid";

function generateBookingReference(): string {
  return uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/bookings 

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { flightId, passenger } = body || {};

    if (
      !flightId ||
      !passenger?.fullName ||
      !passenger?.email ||
      !passenger?.phone
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: flightId, passenger.fullName, passenger.email, passenger.phone",
        },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(passenger.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    let passengerDoc = await Passenger.findOne({ email: passenger.email });
    if (!passengerDoc) {
      passengerDoc = await Passenger.create({
        fullName: passenger.fullName,
        email: passenger.email,
        phone: passenger.phone,
      });
    }

    const bookingReference = generateBookingReference();

    const schedule = await Schedule.findOneAndUpdate(
      {
        _id: flightId,
        remainingSeats: { $gt: 0 },
        bookings: {
          $not: {
            $elemMatch: {
              passengerId: passengerDoc._id,
              status: "confirmed",
            },
          },
        },
      },
      {
        $inc: { remainingSeats: -1 },
        $push: {
          bookings: {
            bookingReference,
            passengerId: passengerDoc._id,
            status: "confirmed",
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!schedule) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flight: any = await Schedule.findById(flightId).lean();
      if (!flight) {
        return NextResponse.json({ error: "Flight not found" }, { status: 404 });
      }
      if (flight.remainingSeats <= 0) {
        return NextResponse.json(
          { error: "Flight is fully booked" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "You have already booked this flight" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        bookingReference,
        status: "confirmed",
        flight: {
          _id: schedule._id.toString(),
          flightNumber: schedule.flightNumber,
          departureAirport: schedule.departureAirport,
          arrivalAirport: schedule.arrivalAirport,
          departureTimeUTC: schedule.departureTimeUTC,
          arrivalTimeUTC: schedule.arrivalTimeUTC,
          departureTimeLocal: formatLocalTime(
            schedule.departureTimeUTC,
            schedule.departureAirport
          ),
          arrivalTimeLocal: formatLocalTime(
            schedule.arrivalTimeUTC,
            schedule.arrivalAirport
          ),
          aircraftType: schedule.aircraftType,
          totalSeats: schedule.totalSeats,
          price: schedule.price,
        },
        passenger: {
          _id: passengerDoc._id.toString(),
          fullName: passengerDoc.fullName,
          email: passengerDoc.email,
          phone: passengerDoc.phone,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

//  GET /api/bookings?email=xxx 

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
    }

    const passenger = await Passenger.findOne({ email });
    if (!passenger) {
      return NextResponse.json([]);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schedules: any[] = await Schedule.find({
      "bookings.passengerId": passenger._id,
    }).lean();

    const bookings = schedules.flatMap((s) => {
      const relevant = s.bookings.filter(
        (b: { passengerId: { toString: () => string } }) =>
          b.passengerId.toString() === passenger._id.toString()
      );
      return relevant.map((b: Record<string, unknown>) => ({
        bookingReference: b.bookingReference,
        status: b.status,
        createdAt: b.createdAt,
        flight: {
          _id: s._id.toString(),
          flightNumber: s.flightNumber,
          departureAirport: s.departureAirport,
          arrivalAirport: s.arrivalAirport,
          departureTimeUTC: s.departureTimeUTC,
          arrivalTimeUTC: s.arrivalTimeUTC,
          departureTimeLocal: formatLocalTime(
            new Date(s.departureTimeUTC),
            s.departureAirport
          ),
          arrivalTimeLocal: formatLocalTime(
            new Date(s.arrivalTimeUTC),
            s.arrivalAirport
          ),
          aircraftType: s.aircraftType,
          totalSeats: s.totalSeats,
          price: s.price,
        },
        passenger: {
          _id: passenger._id.toString(),
          fullName: passenger.fullName,
          email: passenger.email,
          phone: passenger.phone,
        },
      }));
    });

    return NextResponse.json(bookings);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
