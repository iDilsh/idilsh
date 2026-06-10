"use client";

import React from "react";
import { Flower2, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Flower2 className="w-5 h-5 text-saffron" />
            <span className="font-fraunces text-lg font-semibold text-warm-dark">
              Pansil <span className="text-saffron italic">Maluwa</span>
            </span>
          </div>

          {/* Center text */}
          <div className="text-center">
            <p className="font-manrope text-sm text-warm">
              Cultivating wisdom, compassion, and peace
            </p>
            <p className="font-ibm-mono text-xs text-warm-light mt-1">
              පංසල් මලුව — The Garden of Precepts
            </p>
          </div>

          {/* Made with love */}
          <div className="flex items-center gap-1.5 font-manrope text-sm text-warm-light">
            Made with <Heart className="w-3.5 h-3.5 text-saffron fill-saffron" /> for the Dhamma
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border/30 text-center">
          <p className="font-ibm-mono text-xs text-warm-light/60">
            © {new Date().getFullYear()} Pansil Maluwa. All rights reserved. May all beings be happy.
          </p>
        </div>
      </div>
    </footer>
  );
}
