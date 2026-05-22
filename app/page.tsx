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
  {
    name: "Sydney Premium",
    from: "NZNE",
    to: "YSSY",
    outbound: "Fri 10:00 – 12:00",
    return: "Sun 15:00 – 19:00",
    price: "$1,200",
    aircraft: "SyberJet SJ30i",
  },
  {
    name: "Rotorua Shuttle",
    from: "NZNE",
    to: "NZRO",
    outbound: "Mon–Fri 07:00 / 17:00",
    return: "Mon–Fri 08:15 / 18:15",
    price: "$150",
    aircraft: "Cirrus SF50",
  },
  {
    name: "Great Barrier Island",
    from: "NZNE",
    to: "NZGB",
    outbound: "Mon / Wed / Fri 09:00",
    return: "Tue / Thu / Sat 09:00",
    price: "$100",
    aircraft: "Cirrus SF50",
  },
  {
    name: "Chatham Islands",
    from: "NZNE",
    to: "NZCI",
    outbound: "Tue / Fri 10:00",
    return: "Wed / Sat 10:00",
    price: "$300",
    aircraft: "HondaJet Elite",
  },
  {
    name: "Lake Tekapo",
    from: "NZNE",
    to: "NZTL",
    outbound: "Mon 08:00 – 10:00",
    return: "Tue 09:00 – 11:00",
    price: "$250",
    aircraft: "HondaJet Elite",
  },
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ROUTES.map((r) => (
            <div key={r.name} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{r.name}</h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  {r.aircraft}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-primary-700">{r.from}</span>
                <span className="text-gray-300">⇄</span>
                <span className="font-medium text-primary-700">{r.to}</span>
                <span className="ml-auto text-sm font-semibold text-gray-900">
                  {r.price}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-green-50 rounded-lg p-2.5">
                  <div className="text-green-700 font-medium mb-0.5">
                    {r.from} → {r.to}
                  </div>
                  <div className="text-gray-500">{r.outbound}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-2.5">
                  <div className="text-blue-700 font-medium mb-0.5">
                    {r.to} → {r.from}
                  </div>
                  <div className="text-gray-500">{r.return}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
