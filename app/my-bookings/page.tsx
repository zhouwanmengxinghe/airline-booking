"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

interface FlightBrief {
  _id: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTimeLocal: string;
  arrivalTimeLocal: string;
  aircraftType: string;
  totalSeats: number;
  price: number;
}

interface BookingItem {
  bookingReference: string;
  status: string;
  createdAt: string;
  flight: FlightBrief;
  passenger: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
}

export default function MyBookingsPage() {
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState<BookingItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setBookings(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/bookings?email=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to fetch bookings");
        return;
      }
      setBookings(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(bookingReference: string) {
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${bookingReference}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to cancel booking");
        return;
      }

      // Update local state
      setBookings((prev) =>
        prev
          ? prev.map((b) =>
              b.bookingReference === bookingReference ? { ...b, status: "cancelled" } : b
            )
          : null
      );
      setCancelTarget(null);
    } catch {
      alert("Network error while cancelling.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Bookings</h1>

      {/* Search form */}
      <form onSubmit={handleSearch} className="card p-5 space-y-3">
        <label htmlFor="searchEmail" className="block text-sm font-medium text-gray-700">
          Enter your email to find your bookings
        </label>
        <div className="flex gap-2">
          <input
            id="searchEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field flex-1"
            placeholder="john@example.com"
            required
          />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto mb-3" />
          <p className="text-gray-400">Searching bookings...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Empty */}
      {searched && !loading && !error && bookings && bookings.length === 0 && (
        <div className="card p-12 text-center space-y-3">
          <p className="text-3xl">&#9993;</p>
          <p className="text-gray-500 text-lg">No bookings found for this email.</p>
          <Link href="/" className="btn-primary inline-flex">
            Book a Flight
          </Link>
        </div>
      )}

      {/* Booking list */}
      {bookings && bookings.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
          </p>
          {bookings.map((b) => (
            <div key={b.bookingReference} className="card p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-primary-700">
                    {b.bookingReference}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      b.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                {b.status === "confirmed" && (
                  <button
                    onClick={() => setCancelTarget(b.bookingReference)}
                    className="text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
                  {b.flight.flightNumber}
                </span>
                <span className="text-xs text-gray-400">{b.flight.aircraftType}</span>
              </div>

              <div className="text-sm text-gray-600">
                <span className="font-medium">{b.flight.departureAirport}</span>
                <span className="mx-2 text-gray-300">&rarr;</span>
                <span className="font-medium">{b.flight.arrivalAirport}</span>
              </div>

              <div className="text-xs text-gray-400">
                {b.flight.departureTimeLocal} — {b.flight.arrivalTimeLocal}
              </div>

              <div className="flex gap-6 text-xs text-gray-500">
                <span>Passenger: {b.passenger.fullName}</span>
                <span>Price: ${b.flight.price} NZD</span>
              </div>

              <Link
                href={`/booking/${b.bookingReference}`}
                className="text-xs text-primary-600 hover:text-primary-800"
              >
                View details &rarr;
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Cancel confirmation dialog */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl space-y-4">
            <h3 className="font-semibold text-gray-900">Cancel Booking</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to cancel booking{" "}
              <strong className="font-mono">{cancelTarget}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="btn-secondary btn-sm"
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleCancel(cancelTarget)}
                disabled={cancelling}
                className="btn-danger"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
