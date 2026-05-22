import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const AIRPORT_TIMEZONES: Record<string, string> = {
  NZNE: "Pacific/Auckland",   // Dairy Flat
  NZRO: "Pacific/Auckland",   // Rotorua
  NZGB: "Pacific/Auckland",   // Claris
  NZTL: "Pacific/Auckland",   // Lake Tekapo
  NZCI: "Pacific/Chatham",    // Tuuta
  YSSY: "Australia/Sydney",   // Sydney
};

export function getTimezone(airportCode: string): string {
  const timezone = AIRPORT_TIMEZONES[airportCode.toUpperCase()];
  if (!timezone) {
    throw new Error(`Unknown airport code: ${airportCode}`);
  }
  return timezone;
}

export function formatLocalTime(utcDate: Date, airportCode: string): string {
  const timezone = getTimezone(airportCode);
  const localDate = toZonedTime(utcDate, timezone);
  return format(localDate, "yyyy-MM-dd HH:mm");
}
