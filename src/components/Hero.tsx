import { ArrowRight, Sparkles } from 'lucide-react';

import { Link } from 'react-router-dom';

import GlassCard from './GlassCard';

export default function Hero() {

  const scrollToDemo = () => {

    const section =
      document.getElementById('demo');

    section?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-20">

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20" />

      {/* TOP RIGHT ADMIN BUTTON */}
      <div className="absolute top-6 right-6 z-20">

        <Link
          to="/admin"
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl transition font-semibold shadow-lg"
        >
          Admin Login
        </Link>

      </div>

      {/* CONTENT */}
      <div className="relative z-10 text-center max-w-5xl mx-auto w-full">

        {/* TAG */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 mb-6 sm:mb-8 bg-blue-500/20 border border-blue-400/30 rounded-full backdrop-blur-sm">

          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 shrink-0" />

          <span className="text-xs sm:text-sm text-blue-300 font-medium">
            Powered by AI & Computer Vision
          </span>

        </div>

        {/* TITLE */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white leading-tight">

          AI-Powered Pothole Detection System

        </h1>

        {/* DESCRIPTION */}
        <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-12 px-2">

          Detect road damage using computer vision

        </p>

        {/* START BUTTON */}
        <button
          onClick={scrollToDemo}
          className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition text-sm sm:text-base"
        >

          <span>Start</span>

          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />

        </button>

        {/* STATS CARD */}
        <div className="absolute -bottom-16 sm:-bottom-24 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">

          <GlassCard className="p-4 sm:p-6">

            <div className="flex flex-col sm:flex-row justify-between gap-4 text-xs sm:text-sm text-gray-300">

              <span>System Online</span>

              <span>99.2% Accuracy</span>

              <span>Real-time</span>

            </div>

          </GlassCard>

        </div>

      </div>

    </section>
  );
}