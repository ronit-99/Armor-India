"use client";

import dynamic from "next/dynamic";

const CrimeMap = dynamic(() => import("@/components/CrimeMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center text-gray-500 text-sm">
      Loading map...
    </div>
  ),
});

import { Map, Navigation } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface GeoData {
  hotspots: { id: string; lat: number; lng: number; type: string; district: string; count: number; severity: string; category: string }[];
  patrol_zones: { zone_id: string; name: string; priority: number; units: number }[];
  district_summary: { district: string; complaints: number; counterfeit: number; trend: string }[];
  stats: Record<string, number>;
}

export default function GeospatialPage() {
  const [data, setData] = useState<GeoData | null>(null);

  useEffect(() => {
    apiGet<{ data: GeoData }>("/api/geo/hotspots").then((r) => setData(r.data));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Map className="w-7 h-7 text-purple-400" />
          Geospatial Crime Pattern Intelligence
        </h1>
        <p className="text-gray-400 mt-1">
          Maps fraud complaints, counterfeit seizures, and cybercrime hotspots for patrol prioritisation and inter-district sharing
        </p>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-white">{data.stats.total_complaints}</p>
              <p className="text-xs text-gray-400">Fraud Complaints</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{data.stats.total_counterfeit_seizures}</p>
              <p className="text-xs text-gray-400">Counterfeit Seizures</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-white">{data.stats.active_hotspots}</p>
              <p className="text-xs text-gray-400">Active Hotspots</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{data.stats.patrol_units_deployed}</p>
              <p className="text-xs text-gray-400">Patrol Units</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card overflow-hidden rounded-2xl" style={{ height: 480 }}>
              <CrimeMap hotspots={data.hotspots} />
            </div>

            <div className="space-y-4">
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Navigation className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Patrol Zones</h3>
                </div>
                <div className="space-y-2">
                  {data.patrol_zones.map((z) => (
                    <div key={z.zone_id} className="flex justify-between items-center p-2.5 rounded-lg bg-shield-dark">
                      <div>
                        <p className="text-sm text-white">{z.name}</p>
                        <p className="text-xs text-gray-500">Priority {z.priority}</p>
                      </div>
                      <span className="text-sm text-shield-accent">{z.units} units</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-3">District Summary</h3>
                <div className="space-y-2">
                  {data.district_summary.map((d) => (
                    <div key={d.district} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">{d.district}</span>
                      <div className="text-right">
                        <span className="text-white">{d.complaints}</span>
                        <span className="text-red-400 text-xs ml-2">{d.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
