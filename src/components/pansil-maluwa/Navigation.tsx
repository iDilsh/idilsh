"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Info, BookOpen, PlayCircle, Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

export type PageKey = "home" | "about" | "blog" | "videos";

interface NavigationProps {
  activePage: PageKey;
  onPageChange: (page: PageKey) => void;
}

const navItems: { key: PageKey; label: string; icon: React.ReactNode }[] = [
  { key: "home", label: "Home", icon: <Home className="w-4 h-4" /> },
  { key: "about", label: "About Us", icon: <Info className="w-4 h-4" /> },
  { key: "blog", label: "සදහම් ලිපි", icon: <BookOpen className="w-4 h-4" /> },
  { key: "videos", label: "Videos", icon: <PlayCircle className="w-4 h-4" /> },
];

export default function Navigation({
  activePage,
  onPageChange,
}: NavigationProps) {
  return (
    <>
      {/* Desktop Navigation - Film Tab Style */}
      <nav className="hidden md:flex items-center justify-center gap-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onPageChange(item.key)}
            className={cn(
              "film-tab relative px-6 py-3 font-manrope text-sm tracking-wide transition-all duration-300",
              "hover:text-saffron",
              activePage === item.key
                ? "active text-saffron font-semibold"
                : "text-warm-dark/70"
            )}
          >
            <span className="flex items-center gap-2">
              {item.icon}
              {item.label}
            </span>
            {activePage === item.key && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-saffron rounded-t-full"
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* Mobile Navigation - Bottom Film Strip */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-3 rounded-t-2xl">
        <div className="flex items-center justify-around py-2 px-2">
          {/* Film sprocket decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-saffron/20 to-transparent" />
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onPageChange(item.key)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300",
                activePage === item.key
                  ? "text-saffron"
                  : "text-warm-dark/50"
              )}
            >
              {item.icon}
              <span className="text-[10px] font-manrope tracking-wide">
                {item.label}
              </span>
              {activePage === item.key && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute -top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-saffron rounded-b-full"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
            </button>
          ))}
          {/* Theme toggle in mobile nav */}
          <div className="flex flex-col items-center gap-1">
            <ThemeToggle />
            <span className="text-[10px] font-manrope tracking-wide text-warm-dark/50">
              Theme
            </span>
          </div>
        </div>
      </nav>
    </>
  );
}
