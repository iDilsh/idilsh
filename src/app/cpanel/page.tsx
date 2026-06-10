"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Video,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Upload,
  ArrowLeft,
  Flower2,
  Check,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MarkdownEditor from "@/components/cpanel/MarkdownEditor";

// Types
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  youtubeId: string;
  thumbnail: string | null;
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

type PanelView = "dashboard" | "blog" | "blog-edit" | "videos" | "video-edit" | "settings";

const blogCategories = ["Dharma", "Meditation", "Philosophy", "Tradition", "Scripture", "Practice"];
const videoCategories = ["Sermon", "Beginner", "Meditation", "History", "Dharma", "Scripture"];

// ─── Main Component ────────────────────────────────────────────────────────

export default function CPanelPage() {
  const [view, setView] = useState<PanelView>("dashboard");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Editing states
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);
  const [editingVideo, setEditingVideo] = useState<Partial<VideoItem> | null>(null);
  const [isNewBlog, setIsNewBlog] = useState(false);
  const [isNewVideo, setIsNewVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "blog" | "video"; id: string; title: string } | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch data
  const fetchBlogPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/blog?all=true");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (Array.isArray(data)) {
        setBlogPosts(data);
      } else {
        setBlogPosts([]);
      }
    } catch {
      setBlogPosts([]);
      showToast("Failed to load blog posts", "error");
    }
  }, [showToast]);

  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch("/api/videos?all=true");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (Array.isArray(data)) {
        setVideos(data);
      } else {
        setVideos([]);
      }
    } catch {
      setVideos([]);
      showToast("Failed to load videos", "error");
    }
  }, [showToast]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (data && typeof data === "object" && !Array.isArray(data)) {
        setSettings(data);
      } else {
        setSettings({});
      }
    } catch {
      setSettings({});
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchBlogPosts(), fetchVideos(), fetchSettings()]).finally(() =>
      setLoading(false)
    );
  }, [fetchBlogPosts, fetchVideos, fetchSettings]);

  // ─── Blog CRUD ────────────────────────────────────────────────────────

  const saveBlogPost = async () => {
    if (!editingBlog?.title) {
      showToast("Title is required", "error");
      return;
    }
    setSaving(true);
    try {
      if (isNewBlog) {
        const res = await fetch("/api/blog-create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingBlog),
        });
        if (!res.ok) throw new Error("Failed to create");
        const newPost = await res.json();
        setBlogPosts((prev) => [newPost, ...prev]);
        showToast("Blog post created! සටහන සාදන ලදි!");
      } else {
        const res = await fetch(`/api/blog/${editingBlog.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingBlog),
        });
        if (!res.ok) throw new Error("Failed to update");
        const updated = await res.json();
        setBlogPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast("Blog post updated! සටහන යාවත්කාලීන කරන ලදි!");
      }
      setView("blog");
      setEditingBlog(null);
    } catch {
      showToast("Failed to save blog post", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteBlogPost = async (id: string) => {
    try {
      await fetch(`/api/blog/${id}`, { method: "DELETE" });
      setBlogPosts((prev) => prev.filter((p) => p.id !== id));
      showToast("Blog post deleted");
    } catch {
      showToast("Failed to delete", "error");
    }
    setDeleteTarget(null);
  };

  const toggleBlogPublish = async (post: BlogPost) => {
    try {
      const res = await fetch(`/api/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });
      const updated = await res.json();
      setBlogPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showToast(updated.published ? "Published!" : "Unpublished");
    } catch {
      showToast("Failed to toggle publish", "error");
    }
  };

  // ─── Video CRUD ───────────────────────────────────────────────────────

  const saveVideo = async () => {
    if (!editingVideo?.title || !editingVideo?.youtubeId) {
      showToast("Title and YouTube ID are required", "error");
      return;
    }
    setSaving(true);
    try {
      if (isNewVideo) {
        const res = await fetch("/api/video-create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingVideo),
        });
        if (!res.ok) throw new Error("Failed to create");
        const newVideo = await res.json();
        setVideos((prev) => [newVideo, ...prev]);
        showToast("Video added! වීඩියෝ එක එකතු කරන ලදි!");
      } else {
        const res = await fetch(`/api/videos/${editingVideo.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingVideo),
        });
        if (!res.ok) throw new Error("Failed to update");
        const updated = await res.json();
        setVideos((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
        showToast("Video updated! වීඩියෝව යාවත්කාලීන කරන ලදි!");
      }
      setView("videos");
      setEditingVideo(null);
    } catch {
      showToast("Failed to save video", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      await fetch(`/api/videos/${id}`, { method: "DELETE" });
      setVideos((prev) => prev.filter((v) => v.id !== id));
      showToast("Video deleted");
    } catch {
      showToast("Failed to delete", "error");
    }
    setDeleteTarget(null);
  };

  const toggleVideoPublish = async (video: VideoItem) => {
    try {
      const res = await fetch(`/api/videos/${video.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !video.published }),
      });
      const updated = await res.json();
      setVideos((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      showToast(updated.published ? "Published!" : "Unpublished");
    } catch {
      showToast("Failed to toggle publish", "error");
    }
  };

  // ─── Settings ─────────────────────────────────────────────────────────

  const saveSetting = async (key: string, value: string) => {
    try {
      await fetch("/api/settings-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      setSettings((prev) => ({ ...prev, [key]: value }));
      showToast("Setting saved! සැකසුම සුරැකිණි!");
    } catch {
      showToast("Failed to save setting", "error");
    }
  };

  const handleLogoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      await saveSetting("logoUrl", data.url);
    } catch {
      showToast("Failed to upload logo", "error");
    }
  };

  // ─── Format date ─────────────────────────────────────────────────────

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ─── Navigation items ────────────────────────────────────────────────

  const navItems = [
    { key: "dashboard" as PanelView, label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "blog" as PanelView, label: "Blog Posts", icon: <FileText className="w-4 h-4" /> },
    { key: "videos" as PanelView, label: "Videos", icon: <Video className="w-4 h-4" /> },
    { key: "settings" as PanelView, label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex font-sinhala">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-muted/20 p-4 flex flex-col shrink-0 hidden md:flex">
        <div className="flex items-center gap-2 mb-8 px-2">
          <Flower2 className="w-6 h-6 text-saffron" />
          <div>
            <h1 className="font-fraunces text-lg font-bold text-warm-dark">
              Pansil <span className="text-saffron italic">Maluwa</span>
            </h1>
            <p className="text-xs text-warm-light font-manrope">Control Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-manrope transition-colors ${
                view === item.key || (item.key === "blog" && view === "blog-edit") || (item.key === "videos" && view === "video-edit")
                  ? "bg-saffron/10 text-saffron font-medium"
                  : "text-warm hover:bg-muted/50 hover:text-warm-dark"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-border pt-4 mt-4">
          <a
            href="/"
            className="flex items-center gap-2 text-sm text-warm hover:text-saffron transition-colors font-manrope px-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Website
          </a>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-3 border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-saffron" />
            <span className="font-fraunces text-sm font-bold text-warm-dark">CPanel</span>
          </div>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`p-2 rounded-lg transition-colors ${
                  view === item.key ? "bg-saffron/10 text-saffron" : "text-warm"
                }`}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar md:pt-0 pt-14">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* ─── Dashboard ────────────────────────────────────── */}
              {view === "dashboard" && (
                <div>
                  <h2 className="font-fraunces text-2xl md:text-3xl font-bold text-warm-dark mb-6">
                    Dashboard
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="glass-2 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-saffron/10 flex items-center justify-center text-saffron">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-ibm-mono text-2xl font-bold text-warm-dark">
                            {blogPosts.length}
                          </p>
                          <p className="text-xs text-warm font-manrope">Blog Posts</p>
                        </div>
                      </div>
                      <p className="text-xs text-warm-light font-ibm-mono mt-2">
                        {blogPosts.filter((p) => p.published).length} published
                      </p>
                    </div>
                    <div className="glass-2 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-saffron/10 flex items-center justify-center text-saffron">
                          <Video className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-ibm-mono text-2xl font-bold text-warm-dark">
                            {videos.length}
                          </p>
                          <p className="text-xs text-warm font-manrope">Videos</p>
                        </div>
                      </div>
                      <p className="text-xs text-warm-light font-ibm-mono mt-2">
                        {videos.filter((v) => v.published).length} published
                      </p>
                    </div>
                    <div className="glass-2 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-saffron/10 flex items-center justify-center text-saffron">
                          <Eye className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-ibm-mono text-2xl font-bold text-warm-dark">
                            {blogPosts.filter((p) => p.published).length + videos.filter((v) => v.published).length}
                          </p>
                          <p className="text-xs text-warm font-manrope">Published</p>
                        </div>
                      </div>
                      <p className="text-xs text-warm-light font-ibm-mono mt-2">total content</p>
                    </div>
                  </div>

                  {/* Recent activity */}
                  <h3 className="font-fraunces text-lg font-semibold text-warm-dark mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-2">
                    {[...blogPosts.slice(0, 3).map((p) => ({ type: "blog" as const, title: p.title, date: p.updatedAt, published: p.published })),
                      ...videos.slice(0, 3).map((v) => ({ type: "video" as const, title: v.title, date: v.updatedAt, published: v.published })),
                    ]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((item, i) => (
                        <div key={i} className="flex items-center justify-between glass-1 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${item.published ? "bg-emerald-500" : "bg-warm-light"}`} />
                            <span className="font-manrope text-sm text-warm-dark truncate max-w-[200px] md:max-w-[400px]">
                              {item.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-xs font-ibm-mono">
                              {item.type}
                            </Badge>
                            <span className="text-xs text-warm-light font-ibm-mono">
                              {formatDate(item.date)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* ─── Blog List ────────────────────────────────────── */}
              {view === "blog" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-fraunces text-2xl md:text-3xl font-bold text-warm-dark">
                      Blog Posts
                    </h2>
                    <Button
                      onClick={() => {
                        setIsNewBlog(true);
                        setEditingBlog({ title: "", excerpt: "", content: "", category: "Dharma", published: false });
                        setView("blog-edit");
                      }}
                      className="bg-saffron hover:bg-saffron-dark text-white font-manrope"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New Post
                    </Button>
                  </div>

                  {blogPosts.length === 0 ? (
                    <div className="text-center py-16 glass-1 rounded-2xl">
                      <FileText className="w-12 h-12 text-warm-light mx-auto mb-4" />
                      <p className="font-manrope text-warm">No blog posts yet. Create your first one!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {blogPosts.map((post) => (
                        <div
                          key={post.id}
                          className="glass-1 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${post.published ? "bg-emerald-500" : "bg-warm-light"}`} />
                              <h3 className="font-manrope font-semibold text-warm-dark truncate">
                                {post.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-warm-light">
                              <Badge variant="secondary" className="text-xs font-ibm-mono">
                                {post.category}
                              </Badge>
                              <span className="font-ibm-mono">{formatDate(post.updatedAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleBlogPublish(post)}
                              className={post.published ? "text-emerald-600" : "text-warm-light"}
                            >
                              {post.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsNewBlog(false);
                                setEditingBlog({ ...post });
                                setView("blog-edit");
                              }}
                              className="text-saffron"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget({ type: "blog", id: post.id, title: post.title })}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── Blog Editor ──────────────────────────────────── */}
              {view === "blog-edit" && editingBlog && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setView("blog"); setEditingBlog(null); }}
                      className="text-warm"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                    <h2 className="font-fraunces text-xl md:text-2xl font-bold text-warm-dark">
                      {isNewBlog ? "New Blog Post" : "Edit Blog Post"}
                    </h2>
                  </div>

                  <div className="space-y-5">
                    {/* Title */}
                    <div>
                      <Label className="font-manrope text-warm-dark mb-1.5 block">
                        Title <span className="text-warm-light text-xs">(ශීර්ෂය)</span>
                      </Label>
                      <Input
                        value={editingBlog.title || ""}
                        onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                        placeholder="Enter title... ශීර්ෂය ඇතුළත් කරන්න..."
                        className="font-sinhala text-lg"
                        style={{ direction: "ltr", unicodeBidi: "plaintext" }}
                      />
                    </div>

                    {/* Excerpt */}
                    <div>
                      <Label className="font-manrope text-warm-dark mb-1.5 block">
                        Excerpt <span className="text-warm-light text-xs">(සාරාංශය)</span>
                      </Label>
                      <Input
                        value={editingBlog.excerpt || ""}
                        onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                        placeholder="Brief description... කෙටි විස්තරය..."
                        className="font-sinhala"
                        style={{ direction: "ltr", unicodeBidi: "plaintext" }}
                      />
                    </div>

                    {/* Category & Publish */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="font-manrope text-warm-dark mb-1.5 block">
                          Category <span className="text-warm-light text-xs">(වර්ගය)</span>
                        </Label>
                        <Select
                          value={editingBlog.category || "Dharma"}
                          onValueChange={(val) => setEditingBlog({ ...editingBlog, category: val })}
                        >
                          <SelectTrigger className="font-manrope">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {blogCategories.map((cat) => (
                              <SelectItem key={cat} value={cat} className="font-manrope">
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="font-manrope text-warm-dark mb-1.5 block">
                          Published <span className="text-warm-light text-xs">(ප්‍රකාශනය)</span>
                        </Label>
                        <div className="flex items-center gap-3 h-10">
                          <Switch
                            checked={editingBlog.published || false}
                            onCheckedChange={(checked) =>
                              setEditingBlog({ ...editingBlog, published: checked })
                            }
                          />
                          <span className="font-manrope text-sm text-warm">
                            {editingBlog.published ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Image URL */}
                    <div>
                      <Label className="font-manrope text-warm-dark mb-1.5 block">
                        Image URL <span className="text-warm-light text-xs">(රූප URL)</span>
                      </Label>
                      <Input
                        value={editingBlog.imageUrl || ""}
                        onChange={(e) => setEditingBlog({ ...editingBlog, imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="font-manrope"
                      />
                    </div>

                    {/* Markdown Editor */}
                    <div>
                      <Label className="font-manrope text-warm-dark mb-1.5 block">
                        Content — Markdown <span className="text-warm-light text-xs">(අන්තර්ගතය — මාක්ඩවුන්)</span>
                      </Label>
                      <MarkdownEditor
                        value={editingBlog.content || ""}
                        onChange={(val) => setEditingBlog({ ...editingBlog, content: val })}
                        placeholder="Write your blog post content in Markdown... ඔබේ බ්ලොග් සටහන මාක්ඩවුන් හි ලියන්න..."
                      />
                    </div>

                    {/* Save button */}
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => { setView("blog"); setEditingBlog(null); }}
                        className="font-manrope"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={saveBlogPost}
                        disabled={saving}
                        className="bg-saffron hover:bg-saffron-dark text-white font-manrope"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {isNewBlog ? "Create Post" : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Videos List ──────────────────────────────────── */}
              {view === "videos" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-fraunces text-2xl md:text-3xl font-bold text-warm-dark">
                      Videos
                    </h2>
                    <Button
                      onClick={() => {
                        setIsNewVideo(true);
                        setEditingVideo({ title: "", youtubeId: "", category: "Sermon", published: true });
                        setView("video-edit");
                      }}
                      className="bg-saffron hover:bg-saffron-dark text-white font-manrope"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Video
                    </Button>
                  </div>

                  {videos.length === 0 ? (
                    <div className="text-center py-16 glass-1 rounded-2xl">
                      <Video className="w-12 h-12 text-warm-light mx-auto mb-4" />
                      <p className="font-manrope text-warm">No videos yet. Add your first one!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {videos.map((video) => (
                        <div
                          key={video.id}
                          className="glass-1 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                        >
                          {/* Thumbnail */}
                          <div className="w-28 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                            <img
                              src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${video.published ? "bg-emerald-500" : "bg-warm-light"}`} />
                              <h3 className="font-manrope font-semibold text-warm-dark truncate">
                                {video.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-warm-light">
                              <Badge variant="secondary" className="text-xs font-ibm-mono">
                                {video.category}
                              </Badge>
                              <span className="font-ibm-mono">ID: {video.youtubeId}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleVideoPublish(video)}
                              className={video.published ? "text-emerald-600" : "text-warm-light"}
                            >
                              {video.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsNewVideo(false);
                                setEditingVideo({ ...video });
                                setView("video-edit");
                              }}
                              className="text-saffron"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget({ type: "video", id: video.id, title: video.title })}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── Video Editor ─────────────────────────────────── */}
              {view === "video-edit" && editingVideo && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setView("videos"); setEditingVideo(null); }}
                      className="text-warm"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                    <h2 className="font-fraunces text-xl md:text-2xl font-bold text-warm-dark">
                      {isNewVideo ? "Add Video" : "Edit Video"}
                    </h2>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Title */}
                      <div className="sm:col-span-2">
                        <Label className="font-manrope text-warm-dark mb-1.5 block">
                          Title <span className="text-warm-light text-xs">(ශීර්ෂය)</span>
                        </Label>
                        <Input
                          value={editingVideo.title || ""}
                          onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                          placeholder="Video title... වීඩියෝ ශීර්ෂය..."
                          className="font-sinhala"
                          style={{ direction: "ltr", unicodeBidi: "plaintext" }}
                        />
                      </div>

                      {/* YouTube ID */}
                      <div>
                        <Label className="font-manrope text-warm-dark mb-1.5 block">
                          YouTube Video ID <span className="text-warm-light text-xs">(වීඩියෝ ID)</span>
                        </Label>
                        <Input
                          value={editingVideo.youtubeId || ""}
                          onChange={(e) => setEditingVideo({ ...editingVideo, youtubeId: e.target.value })}
                          placeholder="e.g. dQw4w9WgXcQ"
                          className="font-ibm-mono text-sm"
                        />
                        <p className="text-xs text-warm-light mt-1 font-manrope">
                          The ID from youtube.com/watch?v=<strong>ID_HERE</strong>
                        </p>
                      </div>

                      {/* Category */}
                      <div>
                        <Label className="font-manrope text-warm-dark mb-1.5 block">
                          Category <span className="text-warm-light text-xs">(වර්ගය)</span>
                        </Label>
                        <Select
                          value={editingVideo.category || "Sermon"}
                          onValueChange={(val) => setEditingVideo({ ...editingVideo, category: val })}
                        >
                          <SelectTrigger className="font-manrope">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {videoCategories.map((cat) => (
                              <SelectItem key={cat} value={cat} className="font-manrope">
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Description */}
                      <div className="sm:col-span-2">
                        <Label className="font-manrope text-warm-dark mb-1.5 block">
                          Description <span className="text-warm-light text-xs">(විස්තරය)</span>
                        </Label>
                        <textarea
                          value={editingVideo.description || ""}
                          onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                          placeholder="Video description... වීඩියෝ විස්තරය..."
                          className="font-sinhala w-full min-h-[100px] p-3 border border-border rounded-lg bg-transparent text-sm resize-none focus:outline-none focus:ring-2 focus:ring-saffron/30"
                          style={{ direction: "ltr", unicodeBidi: "plaintext" }}
                        />
                      </div>

                      {/* Published */}
                      <div>
                        <Label className="font-manrope text-warm-dark mb-1.5 block">
                          Published <span className="text-warm-light text-xs">(ප්‍රකාශනය)</span>
                        </Label>
                        <div className="flex items-center gap-3 h-10">
                          <Switch
                            checked={editingVideo.published ?? true}
                            onCheckedChange={(checked) =>
                              setEditingVideo({ ...editingVideo, published: checked })
                            }
                          />
                          <span className="font-manrope text-sm text-warm">
                            {editingVideo.published ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* YouTube Preview */}
                    {editingVideo.youtubeId && (
                      <div>
                        <Label className="font-manrope text-warm-dark mb-1.5 block">
                          Preview
                        </Label>
                        <div className="aspect-video rounded-xl overflow-hidden bg-black">
                          <iframe
                            src={`https://www.youtube.com/embed/${editingVideo.youtubeId}?rel=0`}
                            title="Video preview"
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    {/* Save */}
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => { setView("videos"); setEditingVideo(null); }}
                        className="font-manrope"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={saveVideo}
                        disabled={saving}
                        className="bg-saffron hover:bg-saffron-dark text-white font-manrope"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {isNewVideo ? "Add Video" : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Settings ─────────────────────────────────────── */}
              {view === "settings" && (
                <div>
                  <h2 className="font-fraunces text-2xl md:text-3xl font-bold text-warm-dark mb-6">
                    Settings <span className="text-warm-light text-lg font-manrope">(සැකසුම්)</span>
                  </h2>

                  <div className="space-y-6">
                    {/* Logo */}
                    <div className="glass-2 rounded-2xl p-6">
                      <h3 className="font-fraunces text-lg font-semibold text-warm-dark mb-4">
                        Logo <span className="text-warm-light text-sm font-manrope">(ලෝගෝ)</span>
                      </h3>
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="w-24 h-24 rounded-xl bg-muted/50 border border-border flex items-center justify-center overflow-hidden shrink-0">
                          {settings.logoUrl ? (
                            <img
                              src={settings.logoUrl}
                              alt="Site logo"
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-warm-light" />
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <Label className="font-manrope text-warm-dark mb-1.5 block">
                              Logo URL
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                value={settings.logoUrl || ""}
                                onChange={(e) =>
                                  setSettings({ ...settings, logoUrl: e.target.value })
                                }
                                placeholder="https://..."
                                className="font-manrope"
                              />
                              <Button
                                onClick={() => saveSetting("logoUrl", settings.logoUrl || "")}
                                className="bg-saffron hover:bg-saffron-dark text-white shrink-0"
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="font-manrope text-warm-dark mb-1.5 block">
                              Upload Logo
                            </Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleLogoUpload(file);
                              }}
                              className="font-manrope"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Site Info */}
                    <div className="glass-2 rounded-2xl p-6">
                      <h3 className="font-fraunces text-lg font-semibold text-warm-dark mb-4">
                        Site Information <span className="text-warm-light text-sm font-manrope">(අඩවි තොරතුරු)</span>
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="font-manrope text-warm-dark mb-1.5 block">
                            Site Name
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              value={settings.siteName || ""}
                              onChange={(e) =>
                                setSettings({ ...settings, siteName: e.target.value })
                              }
                              placeholder="Pansil Maluwa"
                              className="font-sinhala"
                              style={{ direction: "ltr", unicodeBidi: "plaintext" }}
                            />
                            <Button
                              onClick={() => saveSetting("siteName", settings.siteName || "")}
                              className="bg-saffron hover:bg-saffron-dark text-white shrink-0"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="font-manrope text-warm-dark mb-1.5 block">
                            Site Description
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              value={settings.siteDescription || ""}
                              onChange={(e) =>
                                setSettings({ ...settings, siteDescription: e.target.value })
                              }
                              placeholder="A sacred digital space for Buddhist teachings..."
                              className="font-sinhala"
                              style={{ direction: "ltr", unicodeBidi: "plaintext" }}
                            />
                            <Button
                              onClick={() =>
                                saveSetting("siteDescription", settings.siteDescription || "")
                              }
                              className="bg-saffron hover:bg-saffron-dark text-white shrink-0"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Unicode info */}
                    <div className="glass-1 rounded-2xl p-6">
                      <h3 className="font-fraunces text-lg font-semibold text-warm-dark mb-3">
                        Unicode & Language Support
                      </h3>
                      <div className="space-y-2 font-manrope text-sm text-warm">
                        <p className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500" />
                          Full Sinhala (සිංහල) Unicode support in all text fields
                        </p>
                        <p className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500" />
                          Noto Sans Sinhala font for proper rendering
                        </p>
                        <p className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500" />
                          Markdown editor supports mixed-language content
                        </p>
                        <p className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500" />
                          RTL/LTR auto-detection with unicode-bidi
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent className="glass-3">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-fraunces text-warm-dark flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="font-manrope text-warm">
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action cannot
              be undone. මෙම ක්‍රියාව ආපසු හැරවිය නොහැක.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-manrope">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget?.type === "blog") deleteBlogPost(deleteTarget.id);
                else if (deleteTarget?.type === "video") deleteVideo(deleteTarget.id);
              }}
              className="bg-destructive text-white hover:bg-destructive/90 font-manrope"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className={`fixed bottom-6 left-1/2 z-[100] px-5 py-3 rounded-xl shadow-lg font-manrope text-sm flex items-center gap-2 ${
              toast.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-destructive text-white"
            }`}
          >
            {toast.type === "success" ? (
              <Check className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
