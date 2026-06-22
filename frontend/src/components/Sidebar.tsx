"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Phone,
  Banknote,
  Network,
  Map,
  MessageCircle,
  LayoutDashboard,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Command Center", icon: LayoutDashboard },
  { href: "/scam-detection", label: "Scam Detection", icon: Phone },
  { href: "/counterfeit", label: "Counterfeit ID", icon: Banknote },
  { href: "/fraud-network", label: "Fraud Network", icon: Network },
  { href: "/geospatial", label: "Crime Map", icon: Map },
  { href: "/citizen-shield", label: "Citizen Shield", icon: MessageCircle },
  { href: "/setup", label: "Setup", icon: Key },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white/95 border-r border-shield-border flex flex-col z-50 shadow-sm">
      <div className="p-6 border-b border-shield-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-shield-accent flex items-center justify-center glow-accent">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900">Armor India</h1>
            <p className="text-xs text-gray-500">Public Safety Intelligence</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-shield-accent/15 text-shield-accent border border-shield-accent/30"
                  : "text-slate-600 hover:text-emerald-800 hover:bg-emerald-50"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-shield-border">
        <div className="h-1 rounded-full saffron-gradient mb-3 opacity-60" />
        <p className="text-xs text-gray-500 text-center">
          MHA · I4C · NCRB Compatible
        </p>
      </div>
    </aside>
  );
}
