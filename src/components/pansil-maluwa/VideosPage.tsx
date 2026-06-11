"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, Tag, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Video {
  id: string;
  title: string;
  description: string | null;
  youtubeId: string;
  category: string;
  createdAt: string;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const categoryColors: Record<string, string> = {
  Beginner: "bg-sky-500/15 text-sky-700",
  Meditation: "bg-emerald-500/15 text-emerald-700",
  History: "bg-amber-500/15 text-amber-700",
  Dharma: "bg-saffron/15 text-saffron-dark",
  Scripture: "bg-violet-500/15 text-violet-700",
};

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/videos");
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setVideos(data);
        if (data.length > 0) setActiveVideo(data[0]);
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError("Failed to load videos. Please try again.");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const categories = ["All", ...Array.from(new Set(videos.map((v) => v.category)))];
  const filteredVideos =
    activeFilter === "All"
      ? videos
      : videos.filter((v) => v.category === activeFilter);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 warm-gradient opacity-30" />
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="font-ibm-mono text-sm text-saffron tracking-widest uppercase mb-4 block">
              Video Library
            </span>
            <h1 className="font-fraunces text-4xl md:text-6xl font-bold text-warm-dark mb-6">
              Dharma{" "}
              <span className="text-saffron italic">Discourses</span>
            </h1>
            <p className="font-manrope text-warm text-lg max-w-2xl mx-auto">
              Watch and listen to Buddhist sermons, guided meditations, and
              teachings from respected monastics and teachers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Featured Video Player */}
          {activeVideo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="glass-2 rounded-3xl overflow-hidden">
                <div className="aspect-video relative">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?rel=0`}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-t-3xl"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge
                      variant="secondary"
                      className={`text-xs font-ibm-mono ${
                        categoryColors[activeVideo.category] ||
                        "bg-saffron/15 text-saffron-dark"
                      }`}
                    >
                      {activeVideo.category}
                    </Badge>
                  </div>
                  <h2 className="font-fraunces text-2xl font-bold text-warm-dark mb-2">
                    {activeVideo.title}
                  </h2>
                  {activeVideo.description && (
                    <p className="font-manrope text-warm leading-relaxed">
                      {activeVideo.description}
                    </p>
                  )}
                  <a
                    href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 font-manrope text-sm text-saffron hover:text-saffron-dark transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Watch on YouTube
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* Filter */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Tag className="w-4 h-4 text-warm-light" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`font-manrope text-sm px-4 py-1.5 rounded-full transition-all duration-300 ${
                  activeFilter === cat
                    ? "bg-saffron text-white shadow-md shadow-saffron/20"
                    : "glass-1 text-warm hover:text-saffron"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Video Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="glass-2 rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="aspect-video bg-warm/10" />
                  <div className="p-4">
                    <div className="h-4 bg-warm/10 rounded w-20 mb-3" />
                    <div className="h-5 bg-warm/10 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-warm/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    variants={staggerItem}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setActiveVideo(video)}
                    className={`rounded-2xl overflow-hidden cursor-pointer group ${
                      video.id === activeVideo?.id
                        ? "ring-2 ring-saffron/50"
                        : ""
                    } ${
                      index % 3 === 0
                        ? "glass-1"
                        : index % 3 === 1
                        ? "glass-2"
                        : "glass-3"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <PlayCircle className="w-12 h-12 text-white/80 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                      </div>
                    </div>

                    <div className="p-4">
                      <Badge
                        variant="secondary"
                        className={`text-xs font-ibm-mono mb-2 ${
                          categoryColors[video.category] ||
                          "bg-saffron/15 text-saffron-dark"
                        }`}
                      >
                        {video.category}
                      </Badge>
                      <h3 className="font-fraunces text-base font-semibold text-warm-dark group-hover:text-saffron transition-colors line-clamp-2">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="font-manrope text-warm text-sm mt-2 line-clamp-2">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && error && (
            <div className="text-center py-20">
              <PlayCircle className="w-12 h-12 text-warm-light mx-auto mb-4" />
              <p className="font-manrope text-warm mb-4">{error}</p>
              <button
                onClick={fetchVideos}
                className="font-manrope text-sm px-6 py-2 bg-saffron text-white rounded-full hover:bg-saffron-dark transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && filteredVideos.length === 0 && (
            <div className="text-center py-20">
              <PlayCircle className="w-12 h-12 text-warm-light mx-auto mb-4" />
              <p className="font-manrope text-warm">
                No videos found in this category.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
