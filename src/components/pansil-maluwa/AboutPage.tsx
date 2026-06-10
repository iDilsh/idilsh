"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flower2, BookOpen, Heart, Users, Star, Globe } from "lucide-react";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const values = [
  {
    icon: <Flower2 className="w-6 h-6" />,
    title: "Sila — Morality",
    description:
      "Living ethically through the Five Precepts, creating harmony within ourselves and our community.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Samadhi — Concentration",
    description:
      "Developing mental clarity and focus through meditation, cultivating a calm and peaceful mind.",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Panna — Wisdom",
    description:
      "Understanding the true nature of reality through direct experience and compassionate insight.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Sangha — Community",
    description:
      "Supporting one another on the path through shared practice, discussion, and fellowship.",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Dana — Generosity",
    description:
      "Cultivating the spirit of giving without expectation, the foundation of all Buddhist virtues.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Metta — Loving-Kindness",
    description:
      "Extending unconditional friendliness to all beings, breaking down the walls of separation.",
  },
];

const timeline = [
  {
    year: "2015",
    title: "Foundation",
    description:
      "Pansil Maluwa was established with a small group of devoted practitioners seeking to share the Dhamma.",
  },
  {
    year: "2017",
    title: "Community Growth",
    description:
      "Our sangha expanded to include regular meditation sessions, Dhamma discussions, and retreat programs.",
  },
  {
    year: "2019",
    title: "Digital Presence",
    description:
      "We began recording and sharing sermons online, making the teachings accessible to a global audience.",
  },
  {
    year: "2021",
    title: "Educational Programs",
    description:
      "Launched structured courses on Buddhist philosophy, Pali language, and meditation practice.",
  },
  {
    year: "2023",
    title: "Global Sangha",
    description:
      "Our community now spans across continents, united by the shared commitment to the Buddha's path.",
  },
  {
    year: "2024",
    title: "New Chapter",
    description:
      "Introducing our digital platform, bringing the wisdom of the Dhamma to seekers everywhere.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 warm-gradient opacity-40" />
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-ibm-mono text-sm text-saffron tracking-widest uppercase mb-4 block"
              >
                About Us
              </motion.span>
              <h1 className="font-fraunces text-4xl md:text-6xl font-bold text-warm-dark mb-6 leading-tight">
                Walking the Path{" "}
                <span className="text-saffron italic">Together</span>
              </h1>
              <p className="font-manrope text-warm text-lg leading-relaxed mb-6">
                Pansil Maluwa — The Garden of Precepts — is a Buddhist
                community dedicated to preserving and sharing the authentic
                teachings of the Buddha. We believe that the Dhamma is a living
                tradition, as relevant today as it was 2,600 years ago.
              </p>
              <p className="font-manrope text-warm leading-relaxed">
                Our name reflects our mission: to cultivate a space where the
                precepts (pansil) flourish like flowers in a garden (maluwa). We
                are committed to making Buddhist teachings accessible,
                practical, and transformative for modern practitioners.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="glass-1 rounded-3xl overflow-hidden buddha-glow">
                <img
                  src="/about-dharma.png"
                  alt="Dharma wheel with lotus petals"
                  className="w-full h-auto object-cover"
                />
              </div>
              {/* Decorative blur */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-saffron/10 rounded-full blur-3xl" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-saffron/5 rounded-full blur-2xl" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-2 rounded-3xl p-10"
            >
              <div className="w-12 h-12 rounded-xl bg-saffron/10 flex items-center justify-center text-saffron mb-6">
                <Flower2 className="w-6 h-6" />
              </div>
              <h2 className="font-fraunces text-2xl font-bold text-warm-dark mb-4">
                Our Mission
              </h2>
              <p className="font-manrope text-warm leading-relaxed">
                To illuminate the path of the Buddha for contemporary seekers by
                providing authentic teachings, guided meditation, and a
                supportive community. We strive to make the Dhamma accessible to
                all, regardless of background, and to foster understanding,
                compassion, and wisdom in everyday life.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-3 rounded-3xl p-10"
            >
              <div className="w-12 h-12 rounded-xl bg-saffron/10 flex items-center justify-center text-saffron mb-6">
                <Star className="w-6 h-6" />
              </div>
              <h2 className="font-fraunces text-2xl font-bold text-warm-dark mb-4">
                Our Vision
              </h2>
              <p className="font-manrope text-warm leading-relaxed">
                A world where the wisdom of the Buddha brings peace to every
                heart. We envision a global sangha connected through technology,
                where ancient wisdom meets modern life, and where every being has
                the opportunity to discover the freedom that the Buddha taught.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-fraunces text-3xl md:text-5xl font-bold text-warm-dark mb-4">
              Our Core Values
            </h2>
            <p className="font-manrope text-warm text-lg max-w-xl mx-auto">
              The pillars that guide our community and practice
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ duration: 0.3 }}
                className={`rounded-2xl p-6 group cursor-default ${
                  index % 3 === 0
                    ? "glass-1"
                    : index % 3 === 1
                    ? "glass-2"
                    : "glass-3"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-saffron/10 flex items-center justify-center text-saffron mb-4 group-hover:bg-saffron/20 transition-colors">
                  {value.icon}
                </div>
                <h3 className="font-fraunces text-lg font-semibold text-warm-dark mb-2">
                  {value.title}
                </h3>
                <p className="font-manrope text-warm text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-fraunces text-3xl md:text-5xl font-bold text-warm-dark mb-4">
              Our Journey
            </h2>
            <p className="font-manrope text-warm text-lg max-w-xl mx-auto">
              The evolution of Pansil Maluwa through the years
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="relative"
          >
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-saffron/20 md:-translate-x-px" />

            {timeline.map((item, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                className={`relative flex items-start gap-6 mb-12 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-saffron rounded-full -translate-x-1.5 mt-2 z-10 shadow-lg shadow-saffron/20" />

                {/* Content */}
                <div
                  className={`ml-12 md:ml-0 md:w-1/2 ${
                    index % 2 === 0
                      ? "md:pr-12 md:text-right"
                      : "md:pl-12 md:text-left"
                  }`}
                >
                  <span className="font-ibm-mono text-sm text-saffron tracking-widest">
                    {item.year}
                  </span>
                  <h3 className="font-fraunces text-lg font-semibold text-warm-dark mt-1 mb-2">
                    {item.title}
                  </h3>
                  <p className="font-manrope text-warm text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-1 rounded-3xl p-10 md:p-14 text-center buddha-glow"
          >
            <div className="text-saffron/30 text-5xl font-fraunces leading-none mb-4">
              &ldquo;
            </div>
            <blockquote className="font-fraunces text-xl md:text-2xl text-warm-dark italic leading-relaxed mb-6">
              Thousands of candles can be lighted from a single candle, and the
              life of the candle will not be shortened. Happiness never decreases
              by being shared.
            </blockquote>
            <cite className="font-ibm-mono text-sm text-warm not-italic tracking-wider">
              — The Buddha
            </cite>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
