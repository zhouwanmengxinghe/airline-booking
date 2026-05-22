import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Schedule from "@/models/Schedule";
import { formatLocalTime } from "@/utils/timezone";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schedule: any = await Schedule.findById(params.id)
      .select("-bookings")
      .lean();

    if (!schedule) {
      return NextResponse.json({ error: "Flight not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...schedule,
      _id: schedule._id.toString(),
      departureTimeLocal: formatLocalTime(
        new Date(schedule.departureTimeUTC),
        schedule.departureAirport
      ),
      arrivalTimeLocal: formatLocalTime(
        new Date(schedule.arrivalTimeUTC),
        schedule.arrivalAirport
      ),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
