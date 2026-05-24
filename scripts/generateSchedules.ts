import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { connectDB } from "../lib/db";
import { getTimezone } from "../utils/timezone";
import { fromZonedTime } from "date-fns-tz";
import { addDays, format, getDay } from "date-fns";
import Schedule from "../models/Schedule";

// Route definitions one entry per directional leg
interface RouteDefinition {
  departure: string;
  arrival: string;
  departLocalTime: string; //  in departure airport local time
  arriveLocalTime: string; //  in arrival airport local time
  aircraftType: string;
  totalSeats: number;
  price: number;
  daysOfWeek: number[]; // 0=Sun, 1=Mon...
}

const ROUTES: RouteDefinition[] = [
  //  1. Sydney (SyberJet SJ30i, 6 seats, $1200)
  {
    departure: "NZNE",
    arrival: "YSSY",
    departLocalTime: "10:00",
    arriveLocalTime: "12:00",
    aircraftType: "SyberJet SJ30i",
    totalSeats: 6,
    price: 1200,
    daysOfWeek: [5], // Friday only
  },
  {
    departure: "YSSY",
    arrival: "NZNE",
    departLocalTime: "15:00",
    arriveLocalTime: "19:00",
    aircraftType: "SyberJet SJ30i",
    totalSeats: 6,
    price: 1200,
    daysOfWeek: [0], // Sunday only
  },

  // 2. Rotorua Shuttle (Cirrus SF50, 4 seats, $150)
  {
    departure: "NZNE",
    arrival: "NZRO",
    departLocalTime: "07:00",
    arriveLocalTime: "07:45",
    aircraftType: "Cirrus SF50",
    totalSeats: 4,
    price: 150,
    daysOfWeek: [1, 2, 3, 4, 5], // Mon–Fri morning outbound
  },
  {
    departure: "NZRO",
    arrival: "NZNE",
    departLocalTime: "08:15",
    arriveLocalTime: "09:00",
    aircraftType: "Cirrus SF50",
    totalSeats: 4,
    price: 150,
    daysOfWeek: [1, 2, 3, 4, 5], // Mon–Fri morning return
  },
  {
    departure: "NZNE",
    arrival: "NZRO",
    departLocalTime: "17:00",
    arriveLocalTime: "17:45",
    aircraftType: "Cirrus SF50",
    totalSeats: 4,
    price: 150,
    daysOfWeek: [1, 2, 3, 4, 5], // Mon–Fri late afternoon outbound
  },
  {
    departure: "NZRO",
    arrival: "NZNE",
    departLocalTime: "18:15",
    arriveLocalTime: "19:00",
    aircraftType: "Cirrus SF50",
    totalSeats: 4,
    price: 150,
    daysOfWeek: [1, 2, 3, 4, 5], // Mon–Fri evening return
  },

  // 3. Great Barrier Island (Cirrus SF50, 4 seats, $100) 
  {
    departure: "NZNE",
    arrival: "NZGB",
    departLocalTime: "09:00",
    arriveLocalTime: "09:45",
    aircraftType: "Cirrus SF50",
    totalSeats: 4,
    price: 100,
    daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
  },
  {
    departure: "NZGB",
    arrival: "NZNE",
    departLocalTime: "09:00",
    arriveLocalTime: "09:45",
    aircraftType: "Cirrus SF50",
    totalSeats: 4,
    price: 100,
    daysOfWeek: [2, 4, 6], // Tue, Thu, Sat
  },

  //4. Chatham Islands (HondaJet Elite, 5 seats, $300)
  {
    departure: "NZNE",
    arrival: "NZCI",
    departLocalTime: "10:00",
    arriveLocalTime: "11:45",
    aircraftType: "HondaJet Elite",
    totalSeats: 5,
    price: 300,
    daysOfWeek: [2, 5], // Tue, Fri
  },
  {
    departure: "NZCI",
    arrival: "NZNE",
    departLocalTime: "10:00",
    arriveLocalTime: "11:15",
    aircraftType: "HondaJet Elite",
    totalSeats: 5,
    price: 300,
    daysOfWeek: [3, 6], // Wed, Sat
  },

  //5. Lake Tekapo (HondaJet Elite, 5 seats, $250)
  {
    departure: "NZNE",
    arrival: "NZTL",
    departLocalTime: "08:00",
    arriveLocalTime: "10:00",
    aircraftType: "HondaJet Elite",
    totalSeats: 5,
    price: 250,
    daysOfWeek: [1], // Monday
  },
  {
    departure: "NZTL",
    arrival: "NZNE",
    departLocalTime: "09:00",
    arriveLocalTime: "11:00",
    aircraftType: "HondaJet Elite",
    totalSeats: 5,
    price: 250,
    daysOfWeek: [2], // Tuesday
  },
];

// convert time
function localToUtc(dateStr: string, timeStr: string, airportCode: string): Date {
  const timezone = getTimezone(airportCode);
  return fromZonedTime(`${dateStr} ${timeStr}:00`, timezone);
}

interface RawSchedule {
  departureAirport: string;
  arrivalAirport: string;
  departureTimeUTC: Date;
  arrivalTimeUTC: Date;
  localDepartureDate: string; 
  aircraftType: string;
  totalSeats: number;
  price: number;
}

interface ScheduleDoc {
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTimeUTC: Date;
  arrivalTimeUTC: Date;
  aircraftType: string;
  totalSeats: number;
  remainingSeats: number;
  price: number;
  bookings: [];
}

async function main() {
  // 1. Connect
  console.log(" Connecting to MongoDB");
  await connectDB();
  console.log("  OK\n");

  // 2. Clear existing schedules
  console.log(" Clearing existing Schedule collection");
  const deleteResult = await Schedule.deleteMany({});
  console.log(`  Deleted ${deleteResult.deletedCount} existing schedule(s)\n`);

  // 3. Generate raw schedules
  console.log(" Generating schedules for the next 90 days\n");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rawSchedules: RawSchedule[] = [];
  let totalLegs = 0;

  for (let i = 0; i < 90; i++) {
    const date = addDays(today, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayOfWeek = getDay(date);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let dayCount = 0;

    for (const route of ROUTES) {
      if (!route.daysOfWeek.includes(dayOfWeek)) continue;

      const departUtc = localToUtc(dateStr, route.departLocalTime, route.departure);
      const arriveUtc = localToUtc(dateStr, route.arriveLocalTime, route.arrival);

      if (arriveUtc <= departUtc) {
        arriveUtc.setUTCDate(arriveUtc.getUTCDate() + 1);
      }

      rawSchedules.push({
        departureAirport: route.departure,
        arrivalAirport: route.arrival,
        departureTimeUTC: departUtc,
        arrivalTimeUTC: arriveUtc,
        localDepartureDate: dateStr,
        aircraftType: route.aircraftType,
        totalSeats: route.totalSeats,
        price: route.price,
      });

      dayCount++;
      totalLegs++;
    }

    
  }

  console.log(`\n  Total raw schedules: ${totalLegs}\n`);

  // 4. Assign unique flight numbers
  console.log(" Assigning flight numbers...\n");

  // Group by (departure, arrival, localDepartureDate) to detect duplicates
  const groups = new Map<string, RawSchedule[]>();
  for (const s of rawSchedules) {
    const key = `${s.departureAirport}-${s.arrivalAirport}-${s.localDepartureDate}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }

  const toInsert: ScheduleDoc[] = [];

  groups.forEach((group) => {
    const datePart = group[0].localDepartureDate.replace(/-/g, "");
    if (group.length === 1) {
      toInsert.push({
        flightNumber: `${group[0].departureAirport}-${group[0].arrivalAirport}-${datePart}`,
        departureAirport: group[0].departureAirport,
        arrivalAirport: group[0].arrivalAirport,
        departureTimeUTC: group[0].departureTimeUTC,
        arrivalTimeUTC: group[0].arrivalTimeUTC,
        aircraftType: group[0].aircraftType,
        totalSeats: group[0].totalSeats,
        remainingSeats: group[0].totalSeats,
        price: group[0].price,
        bookings: [],
      });
    } else {
      group.forEach((s, idx) => {
        toInsert.push({
          flightNumber: `${s.departureAirport}-${s.arrivalAirport}-${datePart}-${idx + 1}`,
          departureAirport: s.departureAirport,
          arrivalAirport: s.arrivalAirport,
          departureTimeUTC: s.departureTimeUTC,
          arrivalTimeUTC: s.arrivalTimeUTC,
          aircraftType: s.aircraftType,
          totalSeats: s.totalSeats,
          remainingSeats: s.totalSeats,
          price: s.price,
          bookings: [],
        });
      });
    }
  });



  // 5. Insert
  console.log("Inserting schedules into database");
  const inserted = await Schedule.insertMany(toInsert);
  console.log(`  Inserted ${inserted.length} schedule(s)\n`);

  // Summary
  console.log("Generation Complete \n");

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
