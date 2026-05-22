import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Schedule from "@/models/Schedule";
import { getTimezone, formatLocalTime } from "@/utils/timezone";
import { fromZonedTime } from "date-fns-tz";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const departureAirport = searchParams.get("departureAirport");
    const arrivalAirport = searchParams.get("arrivalAirport");
    const date = searchParams.get("date");

    if (!departureAirport || !arrivalAirport || !date) {
      return NextResponse.json(
        { error: "Missing parameters: departureAirport, arrivalAirport, date" },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format, use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const depUpper = departureAirport.toUpperCase();
    const arrUpper = arrivalAirport.toUpperCase();

    // Calculate UTC range for the departure airport's local date
    const timezone = getTimezone(depUpper);
    const startUtc = fromZonedTime(`${date}T00:00:00`, timezone);
    const endUtc = fromZonedTime(`${date}T23:59:59.999`, timezone);

    const now = new Date();

    const schedules = await Schedule.find({
      departureAirport: depUpper,
      arrivalAirport: arrUpper,
      departureTimeUTC: { $gte: startUtc, $lte: endUtc },
      remainingSeats: { $gt: 0 },
      arrivalTimeUTC: { $gt: now },
    })
      .select("-bookings")
      .sort({ departureTimeUTC: 1 })
      .lean();

    const flights = schedules.map((s) => ({
      ...s,
      departureTimeLocal: formatLocalTime(
        new Date(s.departureTimeUTC),
        s.departureAirport
      ),
      arrivalTimeLocal: formatLocalTime(
        new Date(s.arrivalTimeUTC),
        s.arrivalAirport
      ),
    }));

    return NextResponse.json(flights);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
