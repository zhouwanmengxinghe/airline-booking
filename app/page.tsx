"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AIRPORTS = [
  { code: "NZNE", name: "Dairy Flat (Auckland)" },
  { code: "YSSY", name: "Sydney" },
  { code: "NZRO", name: "Rotorua" },
  { code: "NZGB", name: "Great Barrier Island" },
  { code: "NZCI", name: "Chatham Islands" },
  { code: "NZTL", name: "Lake Tekapo" },
];

const AIRCRAFT = [
  {
    type: "SyberJet SJ30i",
    seats: 6,
    desc: "Luxury light jet for trans-Tasman routes",
    speed: "830 km/h",
  },
  {
    type: "Cirrus SF50",
    seats: 4,
    desc: "Vision Jet for regional shuttle services",
    speed: "560 km/h",
  },
  {
    type: "HondaJet Elite",
    seats: 5,
    desc: "Advanced light jet with best-in-class efficiency",
    speed: "782 km/h",
  },
];

const ROUTES = [
  { from: "NZNE", to: "YSSY", name: "Sydney Premium", frequency: "Fri / Sun" },
  { from: "NZNE", to: "NZRO", name: "Rotorua Shuttle", frequency: "Mon–Fri, 2× daily" },
  { from: "NZNE", to: "NZGB", name: "Great Barrier Island", frequency: "Mon/Wed/Fri & Tue/Thu/Sat" },
  { from: "NZNE", to: "NZCI", name: "Chatham Islands", frequency: "Tue/Fri & Wed/Sat" },
  { from: "NZNE", to: "NZTL", name: "Lake Tekapo", frequency: "Mon & Tue" },
];

export default function Home() {
  const router = useRouter();
  const [departure, setDeparture] = useState("NZNE");
  const [arrival, setArrival] = useState("YSSY");
  const [date, setDate] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    router.push(
      `/flights?departureAirport=${departure}&arrivalAirport=${arrival}&date=${date}`
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 89 * 86400000).toISOString().split("T")[0];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          KiwiAir
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Premium light-jet airline connecting New Zealand and Sydney.
          Fast, comfortable, and efficient regional air travel.
        </p>
      </section>

      {/* Search Form */}
      <section className="card p-6 max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">Search Flights</h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <select
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="input-field"
              >
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <select
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                className="input-field"
              >
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              max={maxDate}
              className="input-field"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Search Flights
          </button>
        </form>
      </section>

      {/* Fleet */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8">Our Fleet</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AIRCRAFT.map((a) => (
            <div key={a.type} className="card p-6 text-center space-y-2">
              <span className="text-3xl">✈</span>
              <h3 className="font-semibold text-gray-900">{a.type}</h3>
              <p className="text-sm text-gray-500">{a.desc}</p>
              <div className="flex justify-center gap-4 text-xs text-gray-400">
                <span>{a.seats} seats</span>
                <span>{a.speed}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Routes */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8">Routes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROUTES.map((r) => (
            <div key={r.name} className="card p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{r.name}</div>
                <div className="text-sm text-gray-500">
                  {r.from} → {r.to}
                </div>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {r.frequency}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
