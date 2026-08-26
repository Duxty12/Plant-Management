"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Leaf, Microscope, Thermometer, Droplets, TrendingUp, Bug, ArrowRight, Star } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "Plant Inventory",
    desc: "Track every specimen across all greenhouse sections with detailed growth and health records.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Thermometer,
    title: "Environment Monitoring",
    desc: "Real-time temperature, humidity, and light level logging across all botanical zones.",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: Droplets,
    title: "Watering & Fertilization",
    desc: "Comprehensive care schedules and historical logs for precise botanical nutrition.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: TrendingUp,
    title: "Growth Analytics",
    desc: "Height progression charts and growth stage tracking for every plant specimen.",
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  {
    icon: Bug,
    title: "Disease Management",
    desc: "Pathogen identification, treatment logging, and full recovery status monitoring.",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    icon: Microscope,
    title: "Species Database",
    desc: "Extensive cataloguing of exotic species with scientific classification and origin data.",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
];

const stats = [
  { value: "500+", label: "Exotic Species" },
  { value: "10k+", label: "Care Logs" },
  { value: "6", label: "Greenhouse Zones" },
  { value: "99.9%", label: "Uptime" },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parallax scroll effect on hero particles
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }

        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          0% { opacity: 0; transform: translateX(-30px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          0% { opacity: 0; transform: translateX(30px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 40px 0px rgba(74, 222, 128, 0.3); }
          50% { box-shadow: 0 0 80px 10px rgba(74, 222, 128, 0.5); }
        }
        @keyframes particle-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 1; }
        }
        @keyframes drift {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -15px) scale(1.05); }
          66% { transform: translate(-10px, 10px) scale(0.95); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes leaf-spin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }

        .animate-float-up { animation: floatUp 0.8s ease-out both; }
        .animate-float-up-delay-1 { animation: floatUp 0.8s ease-out 0.15s both; }
        .animate-float-up-delay-2 { animation: floatUp 0.8s ease-out 0.3s both; }
        .animate-float-up-delay-3 { animation: floatUp 0.8s ease-out 0.45s both; }
        .animate-fade-left { animation: fadeInLeft 0.8s ease-out 0.2s both; }
        .animate-fade-right { animation: fadeInRight 0.8s ease-out 0.4s both; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-drift-1 { animation: drift 8s ease-in-out infinite; }
        .animate-drift-2 { animation: drift 11s ease-in-out 2s infinite reverse; }
        .animate-drift-3 { animation: drift 14s ease-in-out 1s infinite; }
        .animate-leaf-spin { animation: leaf-spin 8s linear infinite; }

        .particle {
          animation: particle-float var(--duration, 4s) var(--delay, 0s) ease-in-out infinite;
        }

        .shimmer-text {
          background: linear-gradient(90deg, #ffffff 30%, #86efac 50%, #ffffff 70%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .feature-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(27, 59, 44, 0.12);
        }

        .cta-btn {
          position: relative;
          overflow: hidden;
        }
        .cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }
        .cta-btn:hover::before {
          transform: translateX(100%);
        }
      `}</style>

      {/* =================== HERO =================== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Deep background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#071a10] via-[#0f2d1c] to-[#081f12]" />

        {/* Animated gradient orbs */}
        <div ref={heroRef} className="absolute inset-0 pointer-events-none">
          <div className="animate-drift-1 absolute top-1/4 left-1/5 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[80px]" />
          <div className="animate-drift-2 absolute bottom-1/4 right-1/5 w-[400px] h-[400px] bg-green-500/12 rounded-full blur-[80px]" />
          <div className="animate-drift-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-teal-400/8 rounded-full blur-[100px]" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[
            { top: "15%", left: "10%", size: 6, dur: "5s", delay: "0s" },
            { top: "25%", left: "80%", size: 4, dur: "7s", delay: "1s" },
            { top: "60%", left: "5%", size: 8, dur: "6s", delay: "0.5s" },
            { top: "75%", left: "90%", size: 5, dur: "8s", delay: "2s" },
            { top: "40%", left: "92%", size: 3, dur: "4s", delay: "1.5s" },
            { top: "85%", left: "25%", size: 6, dur: "9s", delay: "0.8s" },
            { top: "10%", left: "55%", size: 4, dur: "6s", delay: "3s" },
            { top: "50%", left: "72%", size: 7, dur: "7s", delay: "1.2s" },
          ].map((p, i) => (
            <div
              key={i}
              className="particle absolute rounded-full bg-emerald-400"
              style={{
                top: p.top,
                left: p.left,
                width: p.size,
                height: p.size,
                ["--duration" as any]: p.dur,
                ["--delay" as any]: p.delay,
              }}
            />
          ))}
        </div>

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(rgba(74,222,128,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="animate-float-up inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-xs font-semibold tracking-widest uppercase">Botanical Management Platform</span>
          </div>

          {/* Main headline */}
          <h1 className="animate-float-up-delay-1 text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-6">
            <span className="shimmer-text">Exotic Plants</span>
            <br />
            <span className="text-white opacity-90">Management</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-float-up-delay-2 text-lg md:text-xl text-green-200/70 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            A comprehensive platform for tracking, monitoring, and managing rare botanical specimens across greenhouse facilities.
          </p>

          {/* CTA Buttons */}
          <div className="animate-float-up-delay-3 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/login"
              className="cta-btn animate-pulse-glow group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-base rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-900/50"
            >
              <Leaf className="w-5 h-5" />
              Enter the System
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/15 hover:bg-white/10 text-white font-semibold text-base rounded-2xl transition-all duration-300 backdrop-blur-sm"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Rotating leaf logo - decorative */}
        <div className="absolute bottom-16 right-16 opacity-10 pointer-events-none hidden lg:block">
          <Leaf className="w-48 h-48 text-emerald-400 animate-leaf-spin" />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <span className="text-white text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* =================== STATS =================== */}
      <section className="bg-[#1B3B2C] py-14">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl md:text-5xl font-black text-white mb-1">{s.value}</p>
                <p className="text-green-300/70 text-sm font-medium uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== FEATURES =================== */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 rounded-full mb-5">
              <Star className="w-3.5 h-3.5 text-green-700" />
              <span className="text-green-700 text-xs font-bold tracking-widest uppercase">Capabilities</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Everything you need to<br />
              <span className="text-[#1B3B2C]">manage rare plants</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              From seed tracking to disease management, our system covers the full lifecycle of every exotic specimen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="feature-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== CTA SECTION =================== */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d2618] via-[#1B3B2C] to-[#0d3321]" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(74,222,128,0.8) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#2d5c45] flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Leaf className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            Ready to manage your<br />botanical collection?
          </h2>
          <p className="text-green-200/60 text-lg mb-10 font-light">
            Access the full suite of botanical management tools. Sign in to continue.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/login"
              className="cta-btn group inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-[#0d2618] font-black text-base rounded-2xl transition-all duration-300 shadow-lg"
            >
              Sign In to Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-10 py-4 bg-transparent border border-white/20 hover:bg-white/5 text-white font-semibold text-base rounded-2xl transition-all duration-300"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* =================== FOOTER =================== */}
      <footer className="bg-[#071a10] py-8 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <Leaf className="w-4 h-4 text-emerald-500" />
          <span className="text-white font-bold text-sm">Exotica</span>
          <span className="text-green-400/50 text-xs">Management System</span>
        </div>
        <p className="text-gray-600 text-xs">Botanical Research Facility Management Platform</p>
      </footer>
    </div>
  );
}
