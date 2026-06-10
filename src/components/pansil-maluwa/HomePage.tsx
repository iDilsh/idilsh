"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flower2, Heart, BookOpen, Users } from "lucide-react";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const features = [
  {
    icon: <Flower2 className="w-8 h-8" />,
    title: "Dharma Teachings",
    description:
      "Explore the timeless wisdom of the Buddha through our curated collection of teachings and articles.",
    tier: "glass-1",
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Meditation Guides",
    description:
      "Find peace and clarity with guided meditation practices rooted in ancient Buddhist traditions.",
    tier: "glass-2",
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: "Sacred Scriptures",
    description:
      "Delve into the Suttas and sacred texts with commentaries that illuminate their profound meanings.",
    tier: "glass-3",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Sangha Community",
    description:
      "Connect with fellow practitioners in a supportive community dedicated to the path of awakening.",
    tier: "glass-2",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-buddha.png"
            alt="Serene Buddhist temple at sunrise"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </div>

        {/* Warm gradient overlay */}
        <div className="absolute inset-0 z-[1] warm-gradient opacity-60" />

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center max-w-4xl mx-auto px-6"
        >
          {/* Decorative lotus */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <Flower2 className="w-16 h-16 text-saffron/60" />
              <div className="absolute inset-0 blur-xl bg-saffron/20 rounded-full" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-fraunces text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-warm-dark mb-6"
          >
            Pansil{" "}
            <span className="text-saffron italic">Maluwa</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="font-manrope text-lg md:text-xl text-warm max-w-2xl mx-auto mb-4 leading-relaxed"
          >
            A sacred digital space for Buddhist teachings, meditation, and
            community
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="font-ibm-mono text-sm text-warm-light tracking-wider uppercase"
          >
            පංසල් මලුව — The Garden of Precepts
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-10 rounded-full border-2 border-saffron/40 flex items-start justify-center pt-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-saffron/60" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-fraunces text-3xl md:text-5xl font-bold text-warm-dark mb-4">
              Discover the Path
            </h2>
            <p className="font-manrope text-warm text-lg max-w-xl mx-auto">
              Explore the foundations of Buddhist practice through our curated
              resources
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.3 }}
                className={`${feature.tier} rounded-2xl p-8 group cursor-default`}
              >
                <div className="flex items-start gap-5">
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-saffron/10 flex items-center justify-center text-saffron group-hover:bg-saffron/20 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-fraunces text-xl font-semibold text-warm-dark mb-2">
                      {feature.title}
                    </h3>
                    <p className="font-manrope text-warm leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-1 rounded-3xl p-10 md:p-16 text-center buddha-glow"
          >
            <div className="text-saffron/30 text-6xl font-fraunces leading-none mb-4">
              &ldquo;
            </div>
            <blockquote className="font-fraunces text-2xl md:text-3xl text-warm-dark italic leading-relaxed mb-6">
              Better than a thousand useless words is one useful word, hearing
              which one attains peace.
            </blockquote>
            <cite className="font-ibm-mono text-sm text-warm not-italic tracking-wider">
              — Dhammapada 100
            </cite>
          </motion.div>
        </div>
      </section>

      {/* Daily Practice Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-fraunces text-3xl md:text-5xl font-bold text-warm-dark mb-4">
              Daily Practice
            </h2>
            <p className="font-manrope text-warm text-lg max-w-xl mx-auto">
              Simple practices to bring mindfulness into every moment
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                time: "06:00",
                title: "Morning Meditation",
                desc: "Begin your day with 15 minutes of mindful breathing and loving-kindness meditation.",
                icon: "🪷",
              },
              {
                time: "08:00",
                title: "Mindful Eating",
                desc: "Practice gratitude and awareness during your meals. Savor each bite with full presence.",
                icon: "🍜",
              },
              {
                time: "12:00",
                title: "Noon Reflection",
                desc: "A moment of pause to reflect on your intentions and actions of the morning.",
                icon: "☀️",
              },
              {
                time: "15:00",
                title: "Walking Meditation",
                desc: "Transform your daily walk into a practice of mindful movement and earth connection.",
                icon: "🚶",
              },
              {
                time: "18:00",
                title: "Evening Chanting",
                desc: "Recite the Three Refuges and Five Precepts to center your mind as evening falls.",
                icon: "📿",
              },
              {
                time: "21:00",
                title: "Night Reflection",
                desc: "Review the day with compassion, releasing attachment and setting intentions for tomorrow.",
                icon: "🌙",
              },
            ].map((practice, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                whileHover={{ scale: 1.03, y: -2 }}
                className="glass-2 rounded-2xl p-6 group cursor-default"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{practice.icon}</span>
                  <span className="font-ibm-mono text-xs text-saffron tracking-widest">
                    {practice.time}
                  </span>
                </div>
                <h3 className="font-fraunces text-lg font-semibold text-warm-dark mb-2">
                  {practice.title}
                </h3>
                <p className="font-manrope text-warm text-sm leading-relaxed">
                  {practice.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
