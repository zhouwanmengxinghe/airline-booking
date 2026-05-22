"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import { getTimezoneLabel } from "@/utils/timezone";

interface FlightInfo {
  _id: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTimeLocal: string;
  arrivalTimeLocal: string;
  aircraftType: string;
  totalSeats: number;
  remainingSeats: number;
  price: number;
}

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const flightId = params.flightId as string;

  const [flight, setFlight] = useState<FlightInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadFlight() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/flights/${flightId}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Flight not found");
          return;
        }
        setFlight(data);
      } catch {
        setError("Failed to load flight details.");
      } finally {
        setLoading(false);
      }
    }
    loadFlight();
  }, [flightId]);

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = "Full name is required";
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email format";
    }
    if (!phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[\d\s\-+()]{6,}$/.test(phone)) {
      errors.phone = "Invalid phone number";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flightId,
          passenger: {
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Booking failed. Please try again.");
        return;
      }

      router.push(`/booking/${data.bookingReference}`);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto mb-3" />
        <p className="text-gray-400">Loading flight details...</p>
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="card p-8 text-center space-y-3">
        <p className="text-red-500">{error || "Flight not found"}</p>
        <button type="button" onClick={() => router.push("/")} className="btn-primary">
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button type="button" onClick={() => router.back()} className="btn-secondary btn-sm">
        &larr; Back
      </button>

      {/* Flight summary */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Flight Summary</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
            {flight.flightNumber}
          </span>
          <span className="text-xs text-gray-400">{flight.aircraftType}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold">{flight.departureAirport}</span>
          <span className="text-gray-300">&rarr;</span>
          <span className="font-semibold">{flight.arrivalAirport}</span>
        </div>
        <div className="text-sm text-gray-500">
          Depart: {flight.departureTimeLocal} ({getTimezoneLabel(flight.departureAirport)}) &middot; Arrive: {flight.arrivalTimeLocal} ({getTimezoneLabel(flight.arrivalAirport)})
        </div>
        <div className="flex gap-6 text-sm">
          <span className="text-gray-500">
            Price: <strong className="text-gray-900">${flight.price} NZD</strong>
          </span>
          <span className="text-gray-500">
            Seats left: <strong className="text-gray-900">{flight.remainingSeats}</strong>
          </span>
        </div>
      </div>

      {/* Booking form */}
      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Passenger Information</h2>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setFieldErrors((p) => ({ ...p, fullName: "" }));
            }}
            className={`input-field ${fieldErrors.fullName ? "border-red-400 focus:ring-red-500" : ""}`}
            placeholder="John Smith"
          />
          {fieldErrors.fullName && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.fullName}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((p) => ({ ...p, email: "" }));
            }}
            className={`input-field ${fieldErrors.email ? "border-red-400 focus:ring-red-500" : ""}`}
            placeholder="john@example.com"
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setFieldErrors((p) => ({ ...p, phone: "" }));
            }}
            className={`input-field ${fieldErrors.phone ? "border-red-400 focus:ring-red-500" : ""}`}
            placeholder="+64 21 123 4567"
          />
          {fieldErrors.phone && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
          )}
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            {submitError}
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Booking...
            </span>
          ) : (
            `Confirm Booking — $${flight.price} NZD`
          )}
        </button>
      </form>
    </div>
  );
}
