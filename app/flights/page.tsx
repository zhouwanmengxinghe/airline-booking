"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { getTimezoneLabel } from "@/utils/timezone";

interface FlightData {
  _id: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTimeUTC: string;
  arrivalTimeUTC: string;
  departureTimeLocal: string;
  arrivalTimeLocal: string;
  aircraftType: string;
  totalSeats: number;
  remainingSeats: number;
  price: number;
}

function formatDuration(departureUTC: string, arrivalUTC: string): string {
  const diff = new Date(arrivalUTC).getTime() - new Date(departureUTC).getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (minutes > 0) return `${hours}h ${minutes}m`;
  return `${hours}h`;
}

function FlightResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const departure = searchParams.get("departureAirport") ?? "";
  const arrival = searchParams.get("arrivalAirport") ?? "";
  const date = searchParams.get("date") ?? "";

  const [flights, setFlights] = useState<FlightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!departure || !arrival || !date) {
      setLoading(false);
      setError("Missing search parameters.");
      return;
    }

    setLoading(true);
    setError("");

    fetch(
      `/api/flights?departureAirport=${departure}&arrivalAirport=${arrival}&date=${date}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setFlights(data);
        }
      })
      .catch(() => setError("Failed to fetch flights. Please try again."))
      .finally(() => setLoading(false));
  }, [departure, arrival, date]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="btn-secondary btn-sm"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold">
          {departure} → {arrival}
        </h1>
        <span className="text-sm text-gray-500">{date}</span>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto mb-3" />
          Searching flights...
        </div>
      )}

      {error && !loading && (
        <div className="card p-8 text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="btn-primary mt-4"
          >
            Back to Search
          </button>
        </div>
      )}

      {!loading && !error && flights.length === 0 && (
        <div className="card p-12 text-center space-y-3">
          <p className="text-3xl">🔍</p>
          <p className="text-gray-500 text-lg">
            No flights found for this route and date.
          </p>
          <p className="text-sm text-gray-400">
            Try a different date or route combination.
          </p>
          <Link href="/" className="btn-primary inline-flex mt-4">
            New Search
          </Link>
        </div>
      )}

      {!loading && !error && flights.length > 0 && (
        <div className="grid gap-4">
          {flights.map((f) => (
            <div key={f._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
                      {f.flightNumber}
                    </span>
                    <span className="text-xs text-gray-400">{f.aircraftType}</span>
                  </div>

                  {/* Departure / Duration / Arrival */}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 text-lg">
                        {f.departureTimeLocal.split(" ")[1] || f.departureTimeLocal}
                      </div>
                      <div className="text-xs text-gray-400">{f.departureAirport}</div>
                      <div className="text-[10px] text-gray-400">
                        {getTimezoneLabel(f.departureAirport)}
                      </div>
                    </div>

                    <div className="flex flex-col items-center text-center min-w-[70px]">
                      <span className="text-gray-300 text-lg">→</span>
                      <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                        {formatDuration(f.departureTimeUTC, f.arrivalTimeUTC)}
                      </span>
                    </div>

                    <div className="text-center">
                      <div className="font-semibold text-gray-900 text-lg">
                        {f.arrivalTimeLocal.split(" ")[1] || f.arrivalTimeLocal}
                      </div>
                      <div className="text-xs text-gray-400">{f.arrivalAirport}</div>
                      <div className="text-[10px] text-gray-400">
                        {getTimezoneLabel(f.arrivalAirport)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    {f.departureTimeLocal} — {f.arrivalTimeLocal}
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:flex-col sm:items-end">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${f.price}
                    </div>
                    <div className="text-xs text-gray-400">NZD</div>
                  </div>
                  {f.remainingSeats === 0 ? (
                    <span className="text-sm font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full">
                      Sold Out
                    </span>
                  ) : (
                    <div
                      className={`text-sm font-medium ${
                        f.remainingSeats < 2 ? "text-red-600" : "text-gray-500"
                      }`}
                    >
                      {f.remainingSeats} seat{f.remainingSeats !== 1 ? "s" : ""} left
                    </div>
                  )}
                  {f.remainingSeats > 0 ? (
                    <Link
                      href={`/book/${f._id}`}
                      className="btn-primary whitespace-nowrap"
                    >
                      Book Now
                    </Link>
                  ) : (
                    <span className="btn bg-gray-200 text-gray-400 cursor-not-allowed px-6 py-2.5 text-sm rounded-lg whitespace-nowrap">
                      Sold Out
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FlightsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-16 text-gray-400">Loading...</div>
      }
    >
      <FlightResults />
    </Suspense>
  );
}
