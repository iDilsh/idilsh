/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Palette, 
  Video, 
  Sparkles, 
  Globe, 
  Share2, 
  CheckCircle2, 
  ArrowRight, 
  Menu, 
  X, 
  Mail, 
  Facebook, 
  Instagram, 
  Clock, 
  Zap, 
  ShieldCheck,
  Star,
  Quote,
  ExternalLink,
  Plus,
  Play,
  TrendingUp,
  ChevronDown,
  Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Service {
  id: number;
  title: string;
  description: string;
  color: string;
  tilt: number;
}

interface Project {
  id: number;
  title: string;
  category: string;
  image: string;
  size: 'large' | 'small' | 'tall';
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  avatar: string;
}

// --- Data ---
interface PricingPlan {
  id: number;
  name: string;
  price: {
    monthly: number;
    annual: number;
  };
  description: string;
  features: string[];
  isPopular?: boolean;
  isCustom?: boolean;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 1,
    name: "Basic",
    price: { monthly: 5000, annual: 4000 },
    description: "Perfect for startups and small businesses.",
    features: [
      "5 Creative Tasks",
      "Standard Turnaround",
      "SEO Optimized Captions",
      "Basic Brand Setup",
      "24/7 Chat Support"
    ]
  },
  {
    id: 2,
    name: "Business",
    price: { monthly: 12000, annual: 9600 },
    description: "The ultimate creative partner for growing brands.",
    features: [
      "15 Creative Tasks",
      "Priority Turnaround",
      "Advanced Brand Setup",
      "Ads Management",
      "Deep Analytics & Reports"
    ],
    isPopular: true
  },
  {
    id: 3,
    name: "Pro",
    price: { monthly: 25000, annual: 20000 },
    description: "For high-volume teams and agencies.",
    features: [
      "30 Creative Tasks",
      "Dedicated Art Director",
      "Full Creative Suite",
      "Custom Web Development",
      "Priority Queue Access"
    ]
  },
  {
    id: 4,
    name: "Enterprise",
    price: { monthly: 0, annual: 0 },
    description: "Full-scale creative solutions for large organizations.",
    features: [
      "Unlimited Creative Tasks",
      "Dedicated Account Manager",
      "Full Strategy & Consulting",
      "On-site Consultation",
      "Custom Legal & Billing"
    ],
    isCustom: true
  }
];

const SERVICES = [
  {
    id: 1,
    title: "Graphic Design",
    description: "High-end visual identities, brand guidelines, and digital assets crafted for global impact.",
    color: "bg-indigo-50",
    tilt: -2
  },
  {
    id: 2,
    title: "Video & Animation",
    description: "Cinematic video editing and motion graphics that tell powerful brand stories.",
    color: "bg-blue-50",
    tilt: 1
  },
  {
    id: 3,
    title: "AI-Powered Magic",
    description: "Cutting-edge AI generation for graphics and video with full commercial licensing.",
    color: "bg-purple-50",
    tilt: -1
  },
  {
    id: 4,
    title: "Web Development",
    description: "Performance-driven landing pages and e-commerce solutions built with modern tech stacks.",
    color: "bg-rose-50",
    tilt: 2
  },
  {
    id: 5,
    title: "Social Strategy",
    description: "Data-backed social media growth and content management for international brands.",
    color: "bg-amber-50",
    tilt: -1
  },
  {
    id: 6,
    title: "Branding & Identity",
    description: "Strategic brand positioning and cohesive visual systems that resonate with your audience.",
    color: "bg-emerald-50",
    tilt: 1
  }
];

const PROJECTS: Project[] = [
  { id: 1, title: "Modern Brand Identity", category: "Branding", image: "https://picsum.photos/seed/idilsh1/1200/800", size: 'large' },
  { id: 2, title: "AI Promo Video", category: "Motion", image: "https://picsum.photos/seed/idilsh2/800/800", size: 'small' },
  { id: 3, title: "E-commerce Platform", category: "Web", image: "https://picsum.photos/seed/idilsh3/800/1200", size: 'tall' },
  { id: 4, title: "Social Media Kit", category: "Design", image: "https://picsum.photos/seed/idilsh4/800/800", size: 'small' },
  { id: 5, title: "3D Logo Animation", category: "Motion", image: "https://picsum.photos/seed/idilsh5/1200/800", size: 'large' },
];

const TESTIMONIALS: Testimonial[] = [
  { id: 1, name: "Kasun Perera", role: "Founder, LankaTech", text: "iDilsh Network is a game-changer. Their AI-powered videos helped us scale our reach globally in just 48 hours.", avatar: "" },
  { id: 2, name: "Sarah Jenkins", role: "Marketing Director, Global Brands", text: "The level of creativity and speed is unmatched. They truly understand what an international brand needs.", avatar: "" },
  { id: 3, name: "Dilshan Fernando", role: "CEO, Creative Hub", text: "Lowest cost in Sri Lanka but highest quality. Their web development team is top-notch and very responsive.", avatar: "" },
  { id: 4, name: "Amara Silva", role: "E-commerce Owner", text: "Transformed our online store into a high-converting machine. Highly recommend their UI/UX expertise.", avatar: "" },
  { id: 5, name: "James Wilson", role: "Tech Lead, DevFlow", text: "The motion graphics they produced for our product launch were stunning. Captured our vision perfectly.", avatar: "" },
  { id: 6, name: "Nimali Rathnayake", role: "Startup Founder", text: "Fast, reliable, and incredibly creative. They are our go-to partner for all things branding.", avatar: "" },
  { id: 7, name: "Robert Chen", role: "Director, Asia Pacific", text: "Professional execution and great communication. They delivered exactly what we needed on time.", avatar: "" },
  { id: 8, name: "Priya Sharma", role: "Social Media Manager", text: "Their social strategy increased our engagement by 300%. Truly experts in their field.", avatar: "" },
  { id: 9, name: "David Miller", role: "Product Manager", text: "Innovative solutions and a great eye for detail. The final product exceeded our expectations.", avatar: "" },
  { id: 10, name: "Elena Petrova", role: "Creative Director", text: "A pleasure to work with. Their team is talented, efficient, and very professional.", avatar: "" },
];

const WHATSAPP_LINK = "https://wa.me/94773226376";

// --- Components ---

const Navbar = ({ setView }: { setView: (v: 'home' | 'privacy' | 'about') => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Creative', href: '#services' },
    { name: 'Branding', href: '#projects' },
    { name: 'Marketing', href: '#pricing' },
    { 
      name: 'About Us', 
      href: '#about',
      dropdown: [
        { name: 'Our Story', action: () => setView('about') },
        { name: 'Privacy Policy', action: () => setView('privacy') },
      ]
    },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-100 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between">
        <a href="#" onClick={() => { setView('home'); window.scrollTo(0, 0); }} className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xl font-display font-black tracking-tighter uppercase">
            iDilsh<span className="text-indigo-600">Network</span>
          </span>
        </a>

        <div className="hidden lg:flex items-center gap-1">
          <div className="bg-slate-50 rounded-full px-2 py-1 flex items-center gap-1">
            {navLinks.map((link) => (
              <div 
                key={link.name} 
                className="relative group"
                onMouseEnter={() => setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a 
                  href={link.href} 
                  onClick={() => setView('home')}
                  className="px-4 py-2 text-[13px] font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
                >
                  {link.name}
                  {link.dropdown && <ChevronDown className="w-3 h-3" />}
                </a>

                {link.dropdown && activeDropdown === link.name && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 overflow-hidden"
                  >
                    {link.dropdown.map((sub: any) => (
                      <a
                        key={sub.name}
                        href={sub.href || '#'}
                        onClick={(e) => {
                          if (sub.action) {
                            e.preventDefault();
                            sub.action();
                          } else {
                            setView('home');
                          }
                        }}
                        className="block px-4 py-3 text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all"
                      >
                        {sub.name}
                      </a>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <button className="text-[13px] font-bold text-slate-600 hover:text-indigo-600 transition-colors">Log in</button>
          <a 
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-[13px] font-bold hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200"
          >
            Start Project
          </a>
        </div>

        <button className="lg:hidden text-slate-900" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white z-50 flex flex-col p-8 lg:hidden"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="text-2xl font-display font-black uppercase">iDilsh</span>
              <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-8 h-8" /></button>
            </div>
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <div key={link.name} className="flex flex-col gap-4">
                  <a 
                    href={link.href} 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setView('home');
                    }} 
                    className="text-2xl font-display font-black uppercase hover:text-indigo-600"
                  >
                    {link.name}
                  </a>
                  {link.dropdown && (
                    <div className="flex flex-col gap-3 pl-4 border-l-2 border-slate-100">
                      {link.dropdown.map((sub: any) => (
                        <a
                          key={sub.name}
                          href={sub.href || '#'}
                          onClick={(e) => {
                            setIsMobileMenuOpen(false);
                            if (sub.action) {
                              e.preventDefault();
                              sub.action();
                            } else {
                              setView('home');
                            }
                          }}
                          className="text-lg font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-wider"
                        >
                          {sub.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-4">
              <button className="py-4 text-center font-bold text-slate-600 border border-slate-100 rounded-xl">Log in</button>
              <a href={WHATSAPP_LINK} className="bg-indigo-600 text-white py-4 rounded-xl text-center font-bold uppercase tracking-widest">
                Start Project
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const features = [
    { name: 'Brand Identity', icon: <Palette className="w-4 h-4" /> },
    { name: 'Motion Graphics', icon: <Play className="w-4 h-4" /> },
    { name: 'Web Development', icon: <Globe className="w-4 h-4" /> },
    { name: 'Social Strategy', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden bg-white">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 right-0 h-screen hero-glow-top pointer-events-none" />
      
      {/* Big Middle Arc Design */}
      <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[800px] md:w-[1200px] aspect-square pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="w-full h-full relative"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <linearGradient id="hero-grad-center" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#6366F1" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle 
              cx="100" 
              cy="100" 
              r="85" 
              fill="none" 
              stroke="url(#hero-grad-center)" 
              strokeWidth="25" 
              strokeDasharray="260 600"
              strokeLinecap="round"
              className="opacity-20"
              filter="url(#glow)"
            />
          </svg>
          
          {/* Extra soft glow behind the arc */}
          <div className="absolute inset-0 bg-brand-violet/5 rounded-full blur-[120px]" />
        </motion.div>
      </div>

      {/* The Arcs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="hero-arc-main" />
        <div className="hero-arc-line" />
        
        {/* Decorative Dots on the line */}
        <div className="absolute top-[5%] left-[20%] w-1.5 h-1.5 bg-indigo-400/40 rounded-full blur-[1px]" />
        <div className="absolute top-[2%] left-[50%] -translate-x-1/2 w-1.5 h-1.5 bg-indigo-400/40 rounded-full blur-[1px]" />
        <div className="absolute top-[5%] right-[20%] w-1.5 h-1.5 bg-indigo-400/40 rounded-full blur-[1px]" />
      </div>

      {/* Floating Glows */}
      <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-indigo-100/30 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-[10%] right-[15%] w-80 h-80 bg-indigo-50/40 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto px-8 w-full text-center relative z-10 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <div className="bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full flex items-center gap-2 mb-8 shadow-sm">
            <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-indigo-600" />
            </div>
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Creative Boost</span>
          </div>

          <h1 className="text-5xl md:text-[84px] font-display font-black leading-[1.05] text-slate-900 mb-8 tracking-tight max-w-5xl">
            Empower Brands <br />
            with <span className="text-indigo-600">Expert Insights</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Unlock your brand's potential with our comprehensive creative resources, tailored to guide you every step of the way.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
            <a 
              href={WHATSAPP_LINK}
              className="bg-indigo-600 text-white px-10 py-4 rounded-xl text-base font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:scale-105"
            >
              Start Project
            </a>

            <a 
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-slate-900 border border-slate-200 px-10 py-4 rounded-xl text-base font-bold hover:bg-slate-50 transition-all shadow-sm hover:scale-105 flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5 text-emerald-500" />
              Start on WhatsApp
            </a>
            
            <div className="flex items-center gap-3 text-slate-400 ml-0 sm:ml-4">
              <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-black text-slate-900">10+ years</span>
                <span className="text-[11px] font-bold uppercase tracking-widest">of reliability</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature Bar */}
      <div className="w-full border-t border-slate-100 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="flex items-center justify-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                  {feature.icon}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{feature.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Professional execution</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ProjectsArcSlider = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const sliderProjects = [
    { 
      id: 1, 
      title: "Illustrations", 
      desc: "Custom hand crafted illustrations to engage your audience and bring your brand to life.", 
      image: "https://picsum.photos/seed/illu/600/450",
      category: "Creative"
    },
    { 
      id: 2, 
      title: "Brand & Logo Design", 
      desc: "We create impactful, scalable brand identities that make your business unforgettable.", 
      image: "https://picsum.photos/seed/brand/600/450",
      category: "Branding"
    },
    { 
      id: 3, 
      title: "Social Media Ads", 
      desc: "Attention-grabbing ads that elevate your campaigns and drive ROI.", 
      image: "https://picsum.photos/seed/ads/600/450",
      category: "Marketing"
    },
    { 
      id: 4, 
      title: "Web & Landing Pages", 
      desc: "High-converting pages optimized for seamless user experiences.", 
      image: "https://picsum.photos/seed/web/600/450",
      category: "Digital"
    },
    { 
      id: 5, 
      title: "Content Funnels", 
      desc: "Strategic content tailored to effectively communicate your brand message.", 
      image: "https://picsum.photos/seed/funnel/600/450",
      category: "Strategy"
    },
  ];

  // Helper to calculate arc transformation based on index in the repeated array
  // This creates a "wave" or "arc" look in the sliding track
  const getArcStyle = (index: number) => {
    const phase = index % sliderProjects.length;
    const mid = Math.floor(sliderProjects.length / 2);
    const offset = phase - mid;
    
    return {
      rotate: `${offset * 5}deg`,
      y: Math.abs(offset) * 15,
    };
  };

  return (
    <section id="projects" className="py-40 bg-white overflow-hidden relative">
      {/* Custom Explore Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-24 h-24 bg-brand-violet rounded-full pointer-events-none z-[100] flex items-center justify-center mix-blend-difference"
        animate={{
          x: mousePos.x - 48,
          y: mousePos.y - 48,
          scale: isHovering ? 1 : 0,
          opacity: isHovering ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 150, damping: 20, mass: 0.5 }}
      >
        <span className="text-white text-[10px] font-black uppercase tracking-widest">Explore</span>
      </motion.div>

      <div className="max-w-[1400px] mx-auto px-8 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-8xl font-display font-black uppercase leading-[0.9] mb-10 text-slate-900">
            We deliver what counts <br />
            - top <span className="inline-flex items-center mx-2 translate-y-[-4px] md:translate-y-[-8px]">
              <Sparkles className="w-12 h-12 md:w-24 md:h-24 text-brand-violet fill-brand-violet/20" />
            </span> class results
          </h2>
        </motion.div>
      </div>

      {/* Auto Sliding Track with Arc Effect */}
      <div 
        className="relative cursor-none py-20"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="marquee-track gap-12 px-12">
          {[...sliderProjects, ...sliderProjects, ...sliderProjects, ...sliderProjects].map((project, i) => {
            const arc = getArcStyle(i);
            return (
              <motion.div
                key={`${project.id}-${i}`}
                style={{ rotate: arc.rotate, y: arc.y }}
                whileHover={{ y: arc.y - 20, scale: 1.02, transition: { duration: 0.3 } }}
                className="relative w-[280px] md:w-[380px] bg-white rounded-[3rem] p-6 shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-slate-50 group flex-shrink-0"
              >
                <div className="rounded-[2rem] overflow-hidden mb-8 aspect-[4/3] bg-slate-100">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="px-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-violet mb-3 block">{project.category}</span>
                  <h3 className="text-xl md:text-2xl font-display font-black uppercase mb-4 text-slate-900 leading-tight">{project.title}</h3>
                  <p className="text-slate-400 text-[11px] font-medium leading-relaxed uppercase tracking-wider line-clamp-2">
                    {project.desc}
                  </p>
                </div>
                
                {/* Hover Overlay for 'Explore' feel */}
                <div className="absolute inset-0 bg-brand-violet/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[3rem]" />
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 mt-24 text-center">
        <p className="text-slate-500 text-lg md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
          Whether you're a startup founder or a marketing lead, we've seen your design challenges – and we're here to help you solve them.
        </p>
      </div>
    </section>
  );
};

const ServiceMockup = ({ id }: { id: number }) => {
  if (id === 1) {
    return (
      <div className="w-full h-full p-4 flex flex-col gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-violet" />
              <span className="text-[10px] font-bold text-slate-900">Brand Identity</span>
            </div>
            <div className="w-4 h-4 rounded bg-slate-50 border border-slate-100" />
          </div>
          <div className="grid grid-cols-4 gap-1 mb-3">
            {['#8B5CF6', '#EC4899', '#F59E0B', '#10B981'].map(c => (
              <div key={c} className="aspect-square rounded-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="space-y-1">
            <div className="h-1.5 bg-slate-100 rounded-full w-full" />
            <div className="h-1.5 bg-slate-100 rounded-full w-2/3" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-2 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-indigo-50 rounded flex items-center justify-center">
              <Palette className="w-3 h-3 text-brand-violet" />
            </div>
            <span className="text-[8px] font-bold">Export Assets</span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-300" />
        </div>
      </div>
    );
  }
  if (id === 2) {
    return (
      <div className="w-full h-full p-4 flex flex-col gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center mb-2">
            <Play className="w-6 h-6 text-white fill-current" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 bg-brand-violet rounded-full w-1/2" />
            <div className="h-1 bg-slate-100 rounded-full w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-square bg-white rounded-lg border border-slate-100 shadow-sm flex items-center justify-center">
              <Video className="w-3 h-3 text-slate-400" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (id === 3) {
    return (
      <div className="w-full h-full p-4 flex flex-col gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-3 h-3 text-brand-violet" />
            <span className="text-[10px] font-bold">AI Prompt</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 mb-3">
            <div className="text-[8px] text-slate-400 italic">"Cinematic landscape with neon lights..."</div>
          </div>
          <button className="w-full py-2 bg-brand-violet text-white text-[10px] font-bold rounded-lg shadow-lg shadow-brand-violet/20">Generate Magic</button>
        </div>
        <div className="flex gap-2">
          <div className="w-1/2 h-8 bg-white rounded-lg border border-slate-100 shadow-sm" />
          <div className="w-1/2 h-8 bg-white rounded-lg border border-slate-100 shadow-sm" />
        </div>
      </div>
    );
  }
  if (id === 4) {
    return (
      <div className="w-full h-full p-4 flex flex-col gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
          <div className="flex items-center gap-1 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-100 rounded" />
              <div className="h-2 bg-slate-100 rounded-full w-1/2" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-12 bg-slate-50 rounded-lg" />
              <div className="h-12 bg-slate-50 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-2 shadow-sm border border-slate-100 flex items-center gap-2">
          <Globe className="w-3 h-3 text-brand-violet" />
          <span className="text-[8px] font-bold">Deploy to production</span>
        </div>
      </div>
    );
  }
  if (id === 5) {
    return (
      <div className="w-full h-full p-4 flex flex-col gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold">Growth Analytics</span>
            <TrendingUp className="w-3 h-3 text-emerald-500" />
          </div>
          <div className="flex items-end gap-1 h-16">
            {[40, 70, 50, 90, 60, 80].map((h, i) => (
              <div key={i} className="flex-1 bg-brand-violet/10 rounded-t-sm relative group">
                <div className="absolute bottom-0 left-0 w-full bg-brand-violet rounded-t-sm transition-all" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {['📱', '📸', '🐦'].map((emoji, i) => (
            <div key={i} className="w-8 h-8 bg-white rounded-lg border border-slate-100 shadow-sm flex items-center justify-center text-xs">
              {emoji}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (id === 6) {
    return (
      <div className="w-full h-full p-4 flex flex-col justify-center items-center gap-4">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl border border-slate-50 flex items-center justify-center relative">
          <div className="w-8 h-8 bg-brand-violet rounded-lg rotate-45" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
            <CheckCircle2 className="w-2 h-2 text-white" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-[10px] font-black uppercase tracking-widest">Logo System</div>
          <div className="text-[8px] text-slate-400">Strategic Positioning</div>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-4 h-1 bg-slate-100 rounded-full" />
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-40 bg-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-violet/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-xl font-display font-black uppercase tracking-widest text-slate-400 mb-4">
            Pricing Plans
          </h2>
          <div className="inline-block bg-brand-violet/5 border border-brand-violet/10 rounded-full px-12 py-6 mb-12 shadow-[0_0_50px_rgba(139,92,246,0.1)]">
            <h3 className="text-4xl md:text-6xl font-display font-black text-brand-violet">
              Plans for Every Sizes
            </h3>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-6">
            <span className={`text-sm font-black uppercase tracking-widest ${!isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-16 h-8 bg-brand-violet rounded-full relative p-1 transition-colors shadow-lg shadow-brand-violet/20"
            >
              <motion.div
                animate={{ x: isAnnual ? 32 : 0 }}
                className="w-6 h-6 bg-white rounded-full shadow-sm"
              />
            </button>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-black uppercase tracking-widest ${isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>Annual pricing</span>
              <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">save 20%</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: plan.id * 0.1 }}
              className={`relative rounded-[3rem] p-10 flex flex-col transition-all duration-500 hover:scale-[1.02] ${
                plan.isPopular 
                ? 'bg-gradient-to-br from-brand-violet via-brand-violet to-indigo-800 text-white shadow-[0_40px_100px_rgba(139,92,246,0.4)]' 
                : 'bg-white border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.04)] text-slate-900'
              }`}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-10 ${
                plan.isPopular ? 'bg-white/20' : 'bg-slate-50'
              }`}>
                {plan.id === 1 && <Zap className={`w-7 h-7 ${plan.isPopular ? 'text-white' : 'text-brand-violet'}`} />}
                {plan.id === 2 && <Sparkles className={`w-7 h-7 ${plan.isPopular ? 'text-white' : 'text-brand-violet'}`} />}
                {plan.id === 3 && <Globe className={`w-7 h-7 ${plan.isPopular ? 'text-white' : 'text-brand-violet'}`} />}
                {plan.id === 4 && <ShieldCheck className={`w-7 h-7 ${plan.isPopular ? 'text-white' : 'text-brand-violet'}`} />}
              </div>

              <h4 className={`text-sm font-black uppercase tracking-[0.2em] mb-4 ${plan.isPopular ? 'text-white/80' : 'text-slate-400'}`}>
                {plan.name} plan
              </h4>
              
              <div className="mb-10">
                {plan.isCustom ? (
                  <span className="text-5xl font-display font-black uppercase">Custom</span>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-display font-black">
                      LKR {isAnnual ? plan.price.annual.toLocaleString() : plan.price.monthly.toLocaleString()}
                    </span>
                    <span className={`text-sm font-black uppercase tracking-widest ${plan.isPopular ? 'text-white/60' : 'text-slate-400'}`}>/mth</span>
                  </div>
                )}
                <p className={`text-xs font-bold mt-2 uppercase tracking-widest ${plan.isPopular ? 'text-white/60' : 'text-slate-400'}`}>
                  Billed {isAnnual ? 'annually' : 'monthly'}.
                </p>
              </div>

              {/* Features */}
              <div className={`flex-grow space-y-5 mb-12 p-8 rounded-[2rem] ${
                plan.isPopular ? 'bg-white/10' : 'bg-slate-50/80'
              }`}>
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${
                      plan.isPopular ? 'text-white' : 'text-brand-violet'
                    }`} />
                    <span className="text-xs font-black uppercase tracking-widest leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Button */}
              <a 
                href={WHATSAPP_LINK}
                className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
                plan.isPopular
                ? 'bg-white text-brand-violet hover:bg-slate-50 shadow-xl'
                : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}>
                Get started
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  plan.isPopular ? 'bg-brand-violet text-white' : 'bg-brand-violet text-white'
                }`}>
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  return (
    <section id="services" className="py-40 bg-white relative overflow-hidden">
      {/* Circular Designs - Left Arc */}
      <div className="absolute left-[-15%] top-1/2 -translate-y-1/2 w-[400px] md:w-[700px] aspect-square pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full rotate-[-45deg]">
          <defs>
            <linearGradient id="serv-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle 
            cx="100" 
            cy="100" 
            r="80" 
            fill="none" 
            stroke="url(#serv-grad-left)" 
            strokeWidth="35" 
            strokeDasharray="250 500"
            strokeLinecap="round"
            className="opacity-30"
          />
        </svg>
      </div>

      {/* Circular Designs - Right Arc */}
      <div className="absolute right-[-15%] top-1/2 -translate-y-1/2 w-[400px] md:w-[700px] aspect-square pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full rotate-[135deg]">
          <defs>
            <linearGradient id="serv-grad-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle 
            cx="100" 
            cy="100" 
            r="80" 
            fill="none" 
            stroke="url(#serv-grad-right)" 
            strokeWidth="35" 
            strokeDasharray="250 500"
            strokeLinecap="round"
            className="opacity-30"
          />
        </svg>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-brand-violet/5 border border-brand-violet/10 px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-brand-violet" />
            <span className="text-[11px] font-bold text-brand-violet uppercase tracking-wider">Our Expertise</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-display font-black text-slate-900 uppercase leading-none">
            What We <br /> <span className="text-brand-violet">Excel At</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30, rotate: service.tilt }}
              whileInView={{ opacity: 1, y: 0, rotate: service.tilt }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              whileHover={{ rotate: 0, scale: 1.02, y: -10 }}
              className="bg-white rounded-[3rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col group"
            >
              {/* Visual Mockup Area */}
              <div className={`h-[280px] ${service.color} relative overflow-hidden flex items-center justify-center`}>
                <div className="w-[85%] h-[85%] bg-white/40 backdrop-blur-sm rounded-3xl border border-white/50 shadow-inner overflow-hidden">
                  <ServiceMockup id={service.id} />
                </div>
              </div>

              {/* Text Content */}
              <div className="p-10 text-center flex-grow flex flex-col justify-center">
                <h3 className="text-2xl font-display font-black uppercase mb-4 text-slate-900 leading-tight">
                  {service.title}
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed text-sm">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  return (
    <section className="py-32 bg-slate-50 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-8 mb-20">
        <div className="text-center">
          <h2 className="text-5xl md:text-7xl font-display font-black uppercase leading-none mb-6">What <br /> They Say</h2>
          <p className="text-slate-500 text-xl font-medium">Trusted by 50+ happy clients worldwide.</p>
        </div>
      </div>

      <div className="relative flex overflow-hidden py-10">
        <motion.div 
          animate={{ x: [0, "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-6 shrink-0"
        >
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <motion.div
              key={`${t.id}-${i}`}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              className="w-[280px] p-6 rounded-3xl bg-white border border-slate-100 flex flex-col relative shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(139,92,246,0.2)] transition-all duration-500 group"
            >
              <Quote className="w-6 h-6 text-brand-violet/10 absolute top-6 right-6" />
              <div className="flex text-amber-400 mb-4">
                {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-3 h-3 fill-current" />)}
              </div>
              <p className="text-sm text-slate-700 font-medium leading-relaxed mb-6 flex-grow italic">
                "{t.text}"
              </p>
              <div>
                <h4 className="font-black uppercase tracking-widest text-[10px] text-slate-900">{t.name}</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.role}</p>
              </div>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[0_0_40px_rgba(139,92,246,0.3)]" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-40 px-8 bg-white relative overflow-hidden">
      {/* Circular Designs - Left Arc */}
      <div className="absolute left-[-15%] top-1/2 -translate-y-1/2 w-[400px] md:w-[700px] aspect-square pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full rotate-[-45deg]">
          <defs>
            <linearGradient id="cta-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle 
            cx="100" 
            cy="100" 
            r="80" 
            fill="none" 
            stroke="url(#cta-grad-left)" 
            strokeWidth="35" 
            strokeDasharray="250 500"
            strokeLinecap="round"
            className="opacity-60"
          />
        </svg>
      </div>

      {/* Circular Designs - Right Arc */}
      <div className="absolute right-[-15%] top-1/2 -translate-y-1/2 w-[400px] md:w-[700px] aspect-square pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full rotate-[135deg]">
          <defs>
            <linearGradient id="cta-grad-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle 
            cx="100" 
            cy="100" 
            r="80" 
            fill="none" 
            stroke="url(#cta-grad-right)" 
            strokeWidth="35" 
            strokeDasharray="250 500"
            strokeLinecap="round"
            className="opacity-60"
          />
        </svg>
      </div>
      
      <div className="max-w-[1400px] mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-brand-violet/5 border border-brand-violet/10 px-4 py-1.5 rounded-full mb-8">
          <div className="w-5 h-5 bg-brand-violet rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="text-[11px] font-bold text-brand-violet uppercase tracking-wider">iDilsh best Creative solutions</span>
        </div>
        
        <h2 className="text-5xl md:text-[84px] font-display font-black text-slate-900 mb-8 leading-[1.05] tracking-tight">
          Start your free <br /> trial today
        </h2>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
          Unlock the full potential of your brand with our comprehensive creative and marketing platform.
        </p>
        
        <motion.a 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href={WHATSAPP_LINK}
          className="inline-block bg-gradient-to-r from-brand-violet to-indigo-600 text-white px-12 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-violet/20"
        >
          Schedule a demo
        </motion.a>
      </div>
    </section>
  );
};

const Footer = ({ setView }: { setView: (v: 'home' | 'privacy' | 'about') => void }) => {
  return (
    <footer className="bg-[#f8f9fb] pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setView('home'); window.scrollTo(0, 0); }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-10 h-10 bg-brand-violet rounded-full flex items-center justify-center text-white">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-2xl font-display font-black tracking-tighter uppercase">
                iDilsh<span className="text-brand-violet">Network</span>
              </span>
            </a>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              Streamline your brand's creative management with our intuitive, scalable creative platform. Designed for global enterprises, our solutions simplify complex processes.
            </p>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h4 className="text-slate-900 font-bold mb-6">Company</h4>
            <ul className="space-y-4">
              {[
                { name: 'About Us', action: () => setView('about') },
                { name: 'Creative', href: '#services' },
                { name: 'Branding', href: '#projects' },
                { name: 'Marketing', href: '#pricing' }
              ].map(link => (
                <li key={link.name}>
                  <a 
                    href={link.href || '#'} 
                    onClick={(e) => { 
                      if (link.action) {
                        e.preventDefault();
                        link.action();
                      } else {
                        setView('home');
                      }
                      window.scrollTo(0, 0); 
                    }} 
                    className="text-slate-500 hover:text-brand-violet transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-slate-900 font-bold mb-6">Follow Us</h4>
            <ul className="space-y-4">
              {['Facebook', 'Instagram', 'X'].map(link => (
                <li key={link}>
                  <a href="#" className="text-slate-500 hover:text-brand-violet transition-colors text-sm font-medium">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-4">
            <h4 className="text-slate-900 font-bold mb-6">Subscribe our newsletter</h4>
            <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow bg-transparent px-4 py-3 text-sm outline-none text-slate-900 placeholder:text-slate-400"
              />
              <button className="bg-gradient-to-r from-brand-violet to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-brand-violet/20">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-400 text-sm font-medium">Powered by iDilsh Network</p>
          <div className="flex gap-8 text-slate-400 text-sm font-medium">
            <a href="#" onClick={(e) => { e.preventDefault(); setView('privacy'); window.scrollTo(0, 0); }} className="hover:text-slate-900">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900">Licenses</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const PrivacyPolicy = () => {
  return (
    <div className="pt-48 pb-32 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-slate max-w-none"
        >
          <h1 className="text-5xl md:text-7xl font-display font-black text-slate-900 mb-12 uppercase tracking-tight leading-none">
            Privacy <span className="text-brand-violet">Policy</span>
          </h1>
          
          <div className="space-y-12 text-slate-600 leading-relaxed text-lg">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 uppercase tracking-wider">1. Introduction</h2>
              <p>
                Welcome to iDilsh Network. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 uppercase tracking-wider">2. Information We Collect</h2>
              <p>
                We collect personal information that you voluntarily provide to us when expressing an interest in obtaining information about us or our products and services, when participating in activities on the Services or otherwise contacting us.
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Name and Contact Data (Email, Phone, etc.)</li>
                <li>Credentials (Passwords, security hints, etc.)</li>
                <li>Payment Data (Credit card numbers, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 uppercase tracking-wider">3. How We Use Your Information</h2>
              <p>
                We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 uppercase tracking-wider">4. Sharing Your Information</h2>
              <p>
                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 uppercase tracking-wider">5. Contact Us</h2>
              <p>
                If you have questions or comments about this policy, you may email us at privacy@idilsh.network or contact us via WhatsApp.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const AboutUs = () => {
  const values = [
    {
      title: 'Create "WOW"',
      description: 'We strive to create design that is memorable, innovative, and impactful. We want our clients to be wowed by the work we produce but also the interaction with us. If there is a chance to create a "WoW" moment, we take it.',
      icon: <Wand2 className="w-6 h-6 text-brand-violet" />,
      rotate: -2
    },
    {
      title: 'Pixel Perfect',
      description: 'We are dedicated to delivering design that is of the highest quality and precision. We pay attention to even the smallest details and will always check twice.',
      icon: <Palette className="w-6 h-6 text-brand-violet" />,
      rotate: 3
    },
    {
      title: 'Own It',
      description: "We take responsibility for our work and are accountable for our actions. We don't shy away from challenges or difficult conversations. Instead, we own up to our mistakes and actively seek solutions to problems.",
      icon: <CheckCircle2 className="w-6 h-6 text-brand-violet" />,
      rotate: -1
    },
    {
      title: 'Trust & Reliability',
      description: 'We believe that trust is the foundation of any successful relationship. We strive to earn and maintain the trust of our clients and our team members by being transparent, reliable, and accountable. We communicate openly and honestly, and we always follow through on our commitments.',
      icon: <ShieldCheck className="w-6 h-6 text-brand-violet" />,
      rotate: 1
    },
    {
      title: 'Always communicate',
      description: "We are in the business of serving people, and our job is to ensure their happiness. That's why we prefer to over-communicate rather than say nothing. This approach helps us avoid misunderstandings and build trustworthy long-term relationships.",
      icon: <MessageCircle className="w-6 h-6 text-brand-violet" />,
      rotate: -2
    },
    {
      title: 'Figure it out',
      description: "We are doers and don't shy away from challenges. We don't make excuses. We get the job done no matter what.",
      icon: <Zap className="w-6 h-6 text-brand-violet" />,
      rotate: 2
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-32 pb-20">
      {/* Why we exist Section */}
      <section className="max-w-[1400px] mx-auto px-8 mb-40">
        <div className="bg-slate-50 rounded-[40px] p-12 md:p-24 relative overflow-hidden flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 relative z-10">
            <h2 className="text-6xl md:text-8xl font-display font-black text-slate-900 mb-12 tracking-tighter">
              Why we <br /> exist
            </h2>
            
            {/* Abstract Shape Recreated with SVG */}
            <div className="relative w-full max-w-md aspect-square">
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                <path 
                  d="M40,150 C40,100 100,20 150,60 C180,90 150,140 100,130 C50,120 40,180 40,150" 
                  fill="#6366F1" 
                  className="animate-pulse"
                />
                <path 
                  d="M45,155 C45,105 105,25 155,65 C185,95 155,145 105,135 C55,125 45,185 45,155" 
                  fill="none" 
                  stroke="#F43F5E" 
                  strokeWidth="2" 
                  strokeDasharray="5 5"
                />
                
                {/* Cursor Indicators */}
                <motion.div 
                  initial={{ x: 100, y: 80 }}
                  animate={{ x: [100, 120, 100], y: [80, 70, 80] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute"
                >
                  <div className="bg-white px-3 py-1 rounded-full shadow-lg border border-slate-100 flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                    <span className="text-[10px] font-bold uppercase">Sina</span>
                  </div>
                </motion.div>
              </svg>
            </div>
          </div>

          <div className="flex-1 space-y-16 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Plus className="w-5 h-5 text-brand-violet rotate-45" />
                <h3 className="text-2xl font-display font-black text-slate-900 uppercase tracking-tight">Our purpose</h3>
              </div>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">
                We want to empower every business out there to leverage the opportunities of great design.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <Plus className="w-5 h-5 text-brand-violet rotate-45" />
                <h3 className="text-2xl font-display font-black text-slate-900 uppercase tracking-tight">Our vision</h3>
              </div>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">
                iDilsh Network will become the de-facto standard for businesses seeking exceptional creative solutions, enabling them to support their journey towards their goals through visually appealing and functional design.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <Plus className="w-5 h-5 text-brand-violet rotate-45" />
                <h3 className="text-2xl font-display font-black text-slate-900 uppercase tracking-tight">Our mission</h3>
              </div>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">
                iDilsh Network is the one-stop-shop for businesses of all sizes to get all of their design and creative work done by a team of experts without any hassle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="max-w-[1400px] mx-auto px-8">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-display font-black text-slate-900 uppercase tracking-tighter">
            Our core <span className="text-brand-violet italic">values</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02, rotate: 0 }}
              style={{ rotate: value.rotate }}
              className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(139,92,246,0.1)] transition-all duration-500 group"
            >
              <div className="w-14 h-14 bg-brand-violet/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-violet group-hover:text-white transition-colors">
                {value.icon}
              </div>
              <h4 className="text-xl font-display font-black text-slate-900 mb-4 uppercase tracking-tight">
                {value.title}
              </h4>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveTags = ['a', 'button', 'input', 'select', 'textarea', 'label'];
      const isInteractive = 
        interactiveTags.includes(target.tagName.toLowerCase()) ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.classList.contains('cursor-pointer');
      
      setIsHovering(!!isInteractive);
    };

    const handleMouseOut = () => setIsHovering(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none flex items-start"
      animate={{
        x: mousePosition.x,
        y: mousePosition.y,
        scale: isHovering ? 1.1 : 1,
      }}
      transition={{ type: 'spring', damping: 30, stiffness: 400, mass: 0.5 }}
    >
      {/* Cursor Arrow */}
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="white" 
        stroke="black" 
        strokeWidth="1.5"
        className="drop-shadow-sm"
      >
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      </svg>
      
      {/* Pill Label */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="ml-1 px-3 py-1 bg-white border border-black rounded-full shadow-sm"
      >
        <span className="text-[12px] font-bold text-black whitespace-nowrap">iDilsh</span>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [view, setView] = useState<'home' | 'privacy' | 'about'>('home');

  return (
    <div className="min-h-screen selection:bg-brand-violet selection:text-white relative">
      <CustomCursor />
      <div className="noise fixed inset-0 z-50" />
      <Navbar setView={setView} />
      
      <main>
        {view === 'home' ? (
          <>
            <Hero />
            <Services />
            <ProjectsArcSlider />
            <Testimonials />
            <Pricing />
            <CTASection />
          </>
        ) : view === 'privacy' ? (
          <PrivacyPolicy />
        ) : (
          <AboutUs />
        )}
      </main>
      
      <Footer setView={setView} />
      
      {/* Fixed WhatsApp Action */}
      <motion.a 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        href={WHATSAPP_LINK}
        target="_blank"
        className="fixed bottom-12 right-12 z-50 w-20 h-20 bg-brand-emerald text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
      >
        <MessageCircle className="w-10 h-10" />
      </motion.a>
    </div>
  );
}
