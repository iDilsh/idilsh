"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Calendar,
  ArrowRight,
  Tag,
  ArrowLeft,
  Flower2,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
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
  Dharma: "bg-saffron/15 text-saffron-dark",
  Meditation: "bg-emerald-500/15 text-emerald-700",
  Philosophy: "bg-violet-500/15 text-violet-700",
  Tradition: "bg-amber-500/15 text-amber-700",
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blog");
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error("Error fetching blog posts:", err);
      setError("Failed to load blog posts. Please try again.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(posts.map((p) => p.category))),
  ];
  const filteredPosts =
    activeFilter === "All"
      ? posts
      : posts.filter((p) => p.category === activeFilter);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const readingTime = (text: string) => {
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  // Blog Post Detail Page
  if (selectedPost) {
    return (
      <div className="min-h-screen">
        {/* Detail page hero */}
        <section className="relative py-12 md:py-20 overflow-hidden">
          <div className="absolute inset-0 warm-gradient opacity-40" />
          <div className="relative max-w-3xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Back button */}
              <button
                onClick={() => setSelectedPost(null)}
                className="inline-flex items-center gap-2 font-sinhala text-sm text-warm hover:text-saffron transition-colors mb-8 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to all articles
              </button>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge
                  variant="secondary"
                  className={`text-xs font-ibm-mono ${
                    categoryColors[selectedPost.category] ||
                    "bg-saffron/15 text-saffron-dark"
                  }`}
                >
                  {selectedPost.category}
                </Badge>
                <span className="font-ibm-mono text-xs text-warm-light flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(selectedPost.createdAt)}
                </span>
                <span className="font-ibm-mono text-xs text-warm-light">
                  {readingTime(selectedPost.content)} min read
                </span>
              </div>

              {/* Title */}
              <h1 className="font-fraunces text-3xl md:text-5xl font-bold text-warm-dark leading-tight mb-6">
                {selectedPost.title}
              </h1>

              {/* Excerpt */}
              <p className="font-sinhala text-warm text-lg leading-relaxed mb-8">
                {selectedPost.excerpt}
              </p>

              {/* Decorative divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-saffron/40 to-transparent" />
                <Flower2 className="w-5 h-5 text-saffron/40" />
                <div className="flex-1 h-px bg-gradient-to-l from-saffron/40 to-transparent" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Article content */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="px-6 pb-20"
        >
          <div className="max-w-3xl mx-auto">
            <article className="glass-2 rounded-3xl p-8 md:p-12">
              <div className="md-preview-content font-sinhala text-[16px] leading-[1.85]">
                <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
              </div>
            </article>

            {/* Bottom actions */}
            <div className="flex items-center justify-between mt-10">
              <button
                onClick={() => setSelectedPost(null)}
                className="inline-flex items-center gap-2 font-sinhala text-sm text-warm hover:text-saffron transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                All articles
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: selectedPost.title,
                      text: selectedPost.excerpt,
                    });
                  }
                }}
                className="inline-flex items-center gap-2 font-sinhala text-sm text-warm hover:text-saffron transition-colors glass-1 px-4 py-2 rounded-full"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
            </div>

            {/* Related posts */}
            {posts.filter((p) => p.id !== selectedPost.id).length > 0 && (
              <div className="mt-16">
                <h3 className="font-fraunces text-2xl font-bold text-warm-dark mb-8">
                  More Articles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {posts
                    .filter((p) => p.id !== selectedPost.id)
                    .slice(0, 2)
                    .map((post, index) => (
                      <motion.div
                        key={post.id}
                        whileHover={{ y: -4, scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => {
                          setSelectedPost(post);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`rounded-2xl overflow-hidden cursor-pointer group ${
                          index === 0 ? "glass-1" : "glass-2"
                        }`}
                      >
                        <div
                          className={`h-1 ${
                            categoryColors[post.category]?.split(" ")[0] ||
                            "bg-saffron/15"
                          }`}
                        />
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge
                              variant="secondary"
                              className={`text-xs font-ibm-mono ${
                                categoryColors[post.category] ||
                                "bg-saffron/15 text-saffron-dark"
                              }`}
                            >
                              {post.category}
                            </Badge>
                            <span className="font-ibm-mono text-xs text-warm-light">
                              {formatShortDate(post.createdAt)}
                            </span>
                          </div>
                          <h4 className="font-sinhala text-base font-semibold text-warm-dark group-hover:text-saffron transition-colors line-clamp-2 mb-2">
                            {post.title}
                          </h4>
                          <p className="font-sinhala text-warm text-sm line-clamp-2">
                            {post.excerpt}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    );
  }

  // Blog Listing Page
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
              Our Blog
            </span>
            <h1 className="font-fraunces text-4xl md:text-6xl font-bold text-warm-dark mb-6">
              Words of <span className="text-saffron italic">Wisdom</span>
            </h1>
            <p className="font-sinhala text-warm text-lg max-w-2xl mx-auto">
              Explore our collection of articles on Buddhist philosophy,
              meditation practice, and the art of mindful living.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter */}
      <section className="px-6 mb-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Tag className="w-4 h-4 text-warm-light" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`font-sinhala text-sm px-4 py-1.5 rounded-full transition-all duration-300 ${
                  activeFilter === cat
                    ? "bg-saffron text-white shadow-md shadow-saffron/20"
                    : "glass-1 text-warm hover:text-saffron"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="glass-2 rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-4 bg-warm/10 rounded w-20 mb-4" />
                  <div className="h-6 bg-warm/10 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-warm/10 rounded w-full mb-2" />
                  <div className="h-4 bg-warm/10 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  variants={staggerItem}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelectedPost(post)}
                  className={`rounded-2xl overflow-hidden cursor-pointer group ${
                    index % 3 === 0
                      ? "glass-1"
                      : index % 3 === 1
                      ? "glass-2"
                      : "glass-3"
                  }`}
                >
                  {/* Category color bar */}
                  <div
                    className={`h-1 ${
                      categoryColors[post.category]?.split(" ")[0] ||
                      "bg-saffron/15"
                    }`}
                  />

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge
                        variant="secondary"
                        className={`text-xs font-ibm-mono ${
                          categoryColors[post.category] ||
                          "bg-saffron/15 text-saffron-dark"
                        }`}
                      >
                        {post.category}
                      </Badge>
                      <span className="font-ibm-mono text-xs text-warm-light flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatShortDate(post.createdAt)}
                      </span>
                    </div>

                    <h3 className="font-sinhala text-lg font-semibold text-warm-dark mb-3 group-hover:text-saffron transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="font-sinhala text-warm text-sm leading-relaxed line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-saffron text-sm font-sinhala group-hover:gap-2 transition-all">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read more</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-ibm-mono text-xs text-warm-light">
                        {readingTime(post.content)} min
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && error && (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-warm-light mx-auto mb-4" />
              <p className="font-sinhala text-warm mb-4">{error}</p>
              <button
                onClick={fetchPosts}
                className="font-sinhala text-sm px-6 py-2 bg-saffron text-white rounded-full hover:bg-saffron-dark transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-warm-light mx-auto mb-4" />
              <p className="font-sinhala text-warm">
                No articles found in this category.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
