"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getTimezoneLabel } from "@/utils/timezone";

interface BookingDetail {
  bookingReference: string;
  status: string;
  createdAt: string;
  flight: {
    _id: string;
    flightNumber: string;
    departureAirport: string;
    arrivalAirport: string;
    departureTimeLocal: string;
    arrivalTimeLocal: string;
    aircraftType: string;
    totalSeats: number;
    price: number;
  };
  passenger: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  } | null;
}

export default function BookingSuccessPage() {
  const params = useParams();
  const bookingReference = params.bookingReference as string;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);


  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/bookings/${bookingReference}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Booking not found");
          return;
        }
        setBooking(data);
      } catch {
        setError("Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookingReference]);

  function copyReference() {
    navigator.clipboard.writeText(bookingReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }


  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this booking? This cannot be undone.")) {
      return;
    }

    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${bookingReference}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Cancel failed");
        return;
      }

  
      const refreshRes = await fetch(`/api/bookings/${bookingReference}`);
      const refreshed = await refreshRes.json();
      setBooking(refreshed);
    } catch {
      alert("Network error while cancelling");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto mb-3" />
        <p className="text-gray-400">Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="card p-8 text-center space-y-3">
        <p className="text-red-500">{error || "Booking not found"}</p>
        <Link href="/" className="btn-primary inline-flex">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-2">
        <p className="text-3xl">&#10003;</p>
        <h1 className="text-xl font-bold text-green-800">Booking Confirmed!</h1>
        <p className="text-sm text-green-700">
          Your booking has been confirmed. Please save your booking reference.
        </p>
      </div>

      {/* Booking reference */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Booking Reference</h2>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-mono font-bold text-primary-700 tracking-widest">
            {booking.bookingReference}
          </span>
          <button
            type="button"
            onClick={copyReference}
            className="btn-secondary btn-sm"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        {booking.status === "cancelled" && (
          <span className="inline-block text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
            Cancelled
          </span>
        )}
      </div>

      {/* Passenger info */}
      {booking.passenger && (
        <div className="card p-5 space-y-2">
          <h2 className="font-semibold text-gray-900">Passenger</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{booking.passenger.fullName}</p>
            <p>{booking.passenger.email}</p>
            <p>{booking.passenger.phone}</p>
          </div>
        </div>
      )}

      {/* Flight details */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Flight Details</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
            {booking.flight.flightNumber}
          </span>
          <span className="text-xs text-gray-400">{booking.flight.aircraftType}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold">{booking.flight.departureAirport}</span>
          <span className="text-gray-300">&rarr;</span>
          <span className="font-semibold">{booking.flight.arrivalAirport}</span>
        </div>
        <div className="text-sm text-gray-500">
          Depart: {booking.flight.departureTimeLocal} ({getTimezoneLabel(booking.flight.departureAirport)}) &middot; Arrive: {booking.flight.arrivalTimeLocal} ({getTimezoneLabel(booking.flight.arrivalAirport)})
        </div>
        <div className="text-sm">
          <span className="text-gray-500">
            Price: <strong className="text-gray-900">${booking.flight.price} NZD</strong>
          </span>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Link href="/my-bookings" className="btn-secondary">
          View My Bookings
        </Link>
        <Link href="/" className="btn-primary">
          Book Another Flight
        </Link>

        {/* Cancel Booking Button */}
        {booking.status === "confirmed" && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="btn-danger"
          >
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </button>
        )}
      </div>
    </div>
  );
}