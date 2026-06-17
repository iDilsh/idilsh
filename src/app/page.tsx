"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flower2 } from "lucide-react";
import Navigation, { PageKey } from "@/components/pansil-maluwa/Navigation";
import HomePage from "@/components/pansil-maluwa/HomePage";
import AboutPage from "@/components/pansil-maluwa/AboutPage";
import BlogPage from "@/components/pansil-maluwa/BlogPage";
import VideosPage from "@/components/pansil-maluwa/VideosPage";
import Footer from "@/components/pansil-maluwa/Footer";
import ThemeToggle from "@/components/pansil-maluwa/ThemeToggle";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function PansilMaluwa() {
  const [activePage, setActivePage] = useState<PageKey>("home");

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return <HomePage />;
      case "about":
        return <AboutPage />;
      case "blog":
        return <BlogPage />;
      case "videos":
        return <VideosPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col warm-gradient relative">
      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      {/* Header */}
      <header className="sticky top-0 z-40 glass-3 border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => setActivePage("home")}
              className="flex items-center gap-2.5 group"
            >
              <div className="relative">
                <Flower2 className="w-7 h-7 text-saffron group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 blur-md bg-saffron/20 rounded-full" />
              </div>
              <div>
                <span className="font-fraunces text-xl font-bold text-warm-dark">
                  Pansil{" "}
                  <span className="text-saffron italic">Maluwa</span>
                </span>
              </div>
            </button>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <Navigation
                activePage={activePage}
                onPageChange={setActivePage}
              />
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer - pushed to bottom */}
      <Footer />

      {/* Mobile bottom nav spacer */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
