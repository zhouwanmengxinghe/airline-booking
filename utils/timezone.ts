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

const AIRPORT_TIMEZONE_LABELS: Record<string, string> = {
  NZNE: "NZST (UTC+12)",
  NZRO: "NZST (UTC+12)",
  NZGB: "NZST (UTC+12)",
  NZTL: "NZST (UTC+12)",
  NZCI: "CHAST (UTC+12:45)",
  YSSY: "AEST (UTC+10)",
};

export function getTimezone(airportCode: string): string {
  const timezone = AIRPORT_TIMEZONES[airportCode.toUpperCase()];
  if (!timezone) {
    throw new Error(`Unknown airport code: ${airportCode}`);
  }
  return timezone;
}

export function getTimezoneLabel(airportCode: string): string {
  const label = AIRPORT_TIMEZONE_LABELS[airportCode.toUpperCase()];
  if (!label) {
    throw new Error(`Unknown airport code: ${airportCode}`);
  }
  return label;
}

export function formatLocalTime(utcDate: Date, airportCode: string): string {
  const timezone = getTimezone(airportCode);
  const localDate = toZonedTime(utcDate, timezone);
  return format(localDate, "yyyy-MM-dd HH:mm");
}
