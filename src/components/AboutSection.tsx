import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Award, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  HeartHandshake, 
  Sparkles,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Film,
  Eye
} from 'lucide-react';
import type { AboutPageContent } from '../types';
import { DEFAULT_ABOUT_CONTENT } from '../data/defaultSiteContent';

interface AboutSectionProps {
  theme: 'dark' | 'light';
  onNavigateHome?: () => void;
  isStandalonePage?: boolean;
  content?: AboutPageContent;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ 
  theme, 
  onNavigateHome, 
  isStandalonePage,
  content
}) => {
  const merged: AboutPageContent = { ...DEFAULT_ABOUT_CONTENT, ...(content || {}) };
  const [activeTab, setActiveTab] = useState<'story' | 'philosophy' | 'atelier'>('story');

  // Video Background Control States
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [transparencyMode, setTransparencyMode] = useState<'ultra-clear' | 'balanced' | 'cinema'>('ultra-clear');

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Typewriter Animation for dynamic tagline
  const targetText = merged.typewriterText || "Refined by Master Craftsmen.";
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const typingSpeed = isDeleting ? 40 : 85;

    if (!isDeleting && typedText === targetText) {
      timer = setTimeout(() => setIsDeleting(true), 3000);
    } else if (isDeleting && typedText === "") {
      timer = setTimeout(() => setIsDeleting(false), 700);
    } else {
      timer = setTimeout(() => {
        setTypedText(prev => 
          isDeleting 
            ? targetText.substring(0, prev.length - 1)
            : targetText.substring(0, prev.length + 1)
        );
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, targetText]);

  // Compute dynamic overlay transparency based on mode
  const getOverlayClasses = () => {
    if (transparencyMode === 'ultra-clear') {
      // 100% Crisp, vivid, and unblurred video visibility ("ጥርት ብሎ የሚታይ")
      return theme === 'dark'
        ? 'bg-gradient-to-b from-black/40 via-transparent to-black/55'
        : 'bg-gradient-to-b from-white/45 via-transparent to-white/60';
    } else if (transparencyMode === 'balanced') {
      return theme === 'dark'
        ? 'bg-gradient-to-b from-[#0E0E11]/65 via-[#0E0E11]/35 to-[#0E0E11]/75'
        : 'bg-gradient-to-b from-[#FAF8F5]/65 via-[#FAF8F5]/35 to-[#FAF8F5]/75';
    } else {
      // Cinema mode (softer)
      return theme === 'dark'
        ? 'bg-gradient-to-b from-[#0E0E11]/85 via-[#0E0E11]/60 to-[#0E0E11]/90'
        : 'bg-gradient-to-b from-[#FAF8F5]/85 via-[#FAF8F5]/60 to-[#FAF8F5]/90';
    }
  };

  return (
    <section id="about" className={`py-16 sm:py-24 relative overflow-hidden transition-colors ${
      theme === 'dark' ? 'bg-[#0E0E11] text-[#F5F5F7]' : 'bg-[#FAF8F5] text-gray-900'
    }`}>
      {/* Background Video with Crystal-Clear High Fidelity ("ጥርት ያለ ግልጸኝነት") */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center brightness-100 contrast-[1.04]"
        >
          <source src="/kiru-leathers.mp4" type="video/mp4" />
          <source src="/kiru%20leathers.mp4" type="video/mp4" />
        </video>

        {/* Dynamic Transparency Overlay - Crisp & Clear with Zero Blur on the video */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${getOverlayClasses()}`}
        />
      </div>

      {/* Decorative Atelier Ambient Light Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none z-[1]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3D2314]/20 rounded-full blur-3xl pointer-events-none z-[1]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Bar: Breadcrumb & Ambient Atelier Craft Film Controller */}
        <div className="mb-10 flex items-center justify-between pb-6 border-b border-gray-200/20 flex-wrap gap-4">
          {isStandalonePage ? (
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#D4AF37] hover:brightness-125 transition-all group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>Back To Main Atelier & Collection</span>
            </button>
          ) : (
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#D4AF37]">
              Maison / Heritage & Story
            </span>
          )}

          {/* Discreet Atelier Craft Film Control Pill with Live Transparency Switcher */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 border border-[#D4AF37]/50 backdrop-blur-md text-[#D4AF37] text-[11px] font-mono shadow-2xl pointer-events-auto">
            <Film className="w-3.5 h-3.5 animate-pulse text-[#D4AF37]" />
            <span className="hidden sm:inline text-stone-200 uppercase tracking-wider text-[10px]">
              Kiru Craft Film
            </span>
            <div className="h-3 w-px bg-white/20" />
            <button
              type="button"
              onClick={togglePlay}
              className="hover:text-white transition-colors p-1 rounded-md"
              title={isPlaying ? "Pause craft film" : "Play craft film"}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="hover:text-white transition-colors p-1 rounded-md"
              title={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-[#D4AF37]" />}
            </button>

            <div className="h-3 w-px bg-white/20" />

            {/* Quick Transparency Switcher: Ultra-Clear / Balanced / Cinema */}
            <button
              type="button"
              onClick={() => {
                setTransparencyMode(prev => 
                  prev === 'ultra-clear' ? 'balanced' : prev === 'balanced' ? 'cinema' : 'ultra-clear'
                );
              }}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-[10px] font-mono text-stone-200"
              title="Click to change video transparency level"
            >
              <Eye className="w-3 h-3 text-[#D4AF37]" />
              <span className="hidden md:inline">ጥራት፦</span>
              <span className="text-[#D4AF37] font-bold">
                {transparencyMode === 'ultra-clear' ? 'ጥርት ያለ (Vivid)' : transparencyMode === 'balanced' ? 'መካከለኛ (Balanced)' : 'ሲኒማ (Soft)'}
              </span>
            </button>
          </div>
        </div>
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3D2314]/85 border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-mono tracking-[0.25em] uppercase mb-4 shadow-xl backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{merged.sectionBadge}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight mt-2 mb-5 min-h-[2.2em] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            {merged.headingPrefix}<br />
            <span className="italic text-[#D4AF37] font-light inline-block relative drop-shadow-[0_2px_10px_rgba(212,175,55,0.5)]">
              <span>{typedText}</span>
              <span className="inline-block w-[3px] h-[0.85em] bg-[#D4AF37] ml-1.5 align-middle animate-pulse" />
            </span>
          </h2>
          <div className="max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl border border-white/10 backdrop-blur-md bg-black/40 shadow-xl">
            <p className={`text-sm sm:text-base font-light leading-relaxed ${
              theme === 'dark' ? 'text-stone-200' : 'text-stone-100'
            }`}>
              {merged.mainDescription}
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center mb-12 sm:mb-16">
          <div className={`p-1.5 rounded-2xl border flex gap-1 backdrop-blur-md shadow-lg ${
            theme === 'dark' ? 'bg-black/60 border-white/10' : 'bg-white/80 border-stone-200'
          }`}>
            <button
              onClick={() => setActiveTab('story')}
              className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-mono transition-all ${
                activeTab === 'story'
                  ? 'bg-[#3D2314] text-[#D4AF37] font-bold shadow-md'
                  : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
              }`}
            >
              The Story
            </button>
            <button
              onClick={() => setActiveTab('philosophy')}
              className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-mono transition-all ${
                activeTab === 'philosophy'
                  ? 'bg-[#3D2314] text-[#D4AF37] font-bold shadow-md'
                  : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
              }`}
            >
              Our Philosophy
            </button>
            <button
              onClick={() => setActiveTab('atelier')}
              className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-mono transition-all ${
                activeTab === 'atelier'
                  ? 'bg-[#3D2314] text-[#D4AF37] font-bold shadow-md'
                  : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
              }`}
            >
              The Dual Atelier
            </button>
          </div>
        </div>

        {/* Tab 1: The Story */}
        {activeTab === 'story' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
          >
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3]">
                <img
                  src={merged.storyImage}
                  alt={merged.storyImageTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6 sm:p-8">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37]">{merged.storyImageProvenance}</span>
                    <h4 className="font-serif text-xl sm:text-2xl text-white font-medium mt-1">{merged.storyImageTitle}</h4>
                  </div>
                </div>
              </div>

              {/* Floating Stat Badge */}
              <div className="absolute -bottom-6 -right-6 hidden sm:flex items-center gap-3 p-4 rounded-xl bg-[#3D2314] text-white border border-[#D4AF37]/50 shadow-2xl">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-black font-serif font-bold text-lg flex items-center justify-center">
                  {merged.guaranteeBadgeYears}
                </div>
                <div>
                  <span className="text-xs font-mono font-bold block text-amber-300">{merged.guaranteeBadgeTitle}</span>
                  <span className="text-[10px] text-gray-300 font-sans">{merged.guaranteeBadgeSubtitle}</span>
                </div>
              </div>
            </div>

            <div className={`lg:col-span-6 space-y-6 p-6 sm:p-8 rounded-2xl border backdrop-blur-md ${
              theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/75 border-stone-200 shadow-md'
            }`}>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-snug">
                {merged.storyHeadline}
              </h3>
              <p className={`text-sm sm:text-base font-light leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {merged.storyParagraph1}
              </p>
              <p className={`text-sm sm:text-base font-light leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {merged.storyParagraph2}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/20">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-mono uppercase tracking-wider font-bold">{merged.storyFeature1Title}</h5>
                    <p className="text-[11px] text-gray-400">{merged.storyFeature1Subtitle}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-mono uppercase tracking-wider font-bold">{merged.storyFeature2Title}</h5>
                    <p className="text-[11px] text-gray-400">{merged.storyFeature2Subtitle}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Philosophy */}
        {activeTab === 'philosophy' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
          >
            <div className={`p-8 rounded-2xl border transition-all backdrop-blur-md ${
              theme === 'dark' ? 'bg-black/40 border-white/10 hover:border-[#D4AF37]/50 shadow-lg' : 'bg-white/75 border-stone-200 hover:border-[#D4AF37]/50 shadow-md'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-[#3D2314] text-[#D4AF37] flex items-center justify-center mb-6 shadow">
                <Compass className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-xl font-medium mb-3">{merged.philosophyPillar1Title}</h4>
              <p className={`text-xs sm:text-sm font-light leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {merged.philosophyPillar1Description}
              </p>
            </div>

            <div className={`p-8 rounded-2xl border transition-all backdrop-blur-md ${
              theme === 'dark' ? 'bg-black/40 border-white/10 hover:border-[#D4AF37]/50 shadow-lg' : 'bg-white/75 border-stone-200 hover:border-[#D4AF37]/50 shadow-md'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-[#3D2314] text-[#D4AF37] flex items-center justify-center mb-6 shadow">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-xl font-medium mb-3">{merged.philosophyPillar2Title}</h4>
              <p className={`text-xs sm:text-sm font-light leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {merged.philosophyPillar2Description}
              </p>
            </div>

            <div className={`p-8 rounded-2xl border transition-all backdrop-blur-md ${
              theme === 'dark' ? 'bg-black/40 border-white/10 hover:border-[#D4AF37]/50 shadow-lg' : 'bg-white/75 border-stone-200 hover:border-[#D4AF37]/50 shadow-md'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-[#3D2314] text-[#D4AF37] flex items-center justify-center mb-6 shadow">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-xl font-medium mb-3">{merged.philosophyPillar3Title}</h4>
              <p className={`text-xs sm:text-sm font-light leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {merged.philosophyPillar3Description}
              </p>
            </div>
          </motion.div>
        )}

        {/* Tab 3: The Dual Atelier */}
        {activeTab === 'atelier' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className={`p-8 rounded-2xl border relative overflow-hidden backdrop-blur-md ${
              theme === 'dark' ? 'bg-[#151518]/85 border-white/10 shadow-lg' : 'bg-white/80 border-stone-200 shadow-md'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37]">{merged.atelier1Subtitle}</span>
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <h4 className="font-serif text-2xl font-medium mb-2">{merged.atelier1Title}</h4>
              <p className={`text-xs sm:text-sm font-light leading-relaxed mb-6 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {merged.atelier1Description}
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-gray-400 border-t border-gray-200/10 pt-4">
                <span>{merged.atelier1Badge1}</span>
                <span>•</span>
                <span>{merged.atelier1Badge2}</span>
              </div>
            </div>

            <div className={`p-8 rounded-2xl border relative overflow-hidden backdrop-blur-md ${
              theme === 'dark' ? 'bg-[#151518]/85 border-white/10 shadow-lg' : 'bg-white/80 border-stone-200 shadow-md'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37]">{merged.atelier2Subtitle}</span>
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <h4 className="font-serif text-2xl font-medium mb-2">{merged.atelier2Title}</h4>
              <p className={`text-xs sm:text-sm font-light leading-relaxed mb-6 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {merged.atelier2Description}
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-gray-400 border-t border-gray-200/10 pt-4">
                <span>{merged.atelier2Badge1}</span>
                <span>•</span>
                <span>{merged.atelier2Badge2}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Global Assurance Grid - Essential for Real-World Commercial Acceptance */}
        <div className={`mt-20 sm:mt-24 pt-12 border-t grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 ${
          theme === 'dark' ? 'border-white/10' : 'border-stone-200'
        }`}>
          <div className={`text-center p-5 rounded-2xl border backdrop-blur-md transition-all ${
            theme === 'dark' ? 'bg-black/40 border-white/10 hover:border-[#D4AF37]/40' : 'bg-white/80 border-stone-200 shadow-sm hover:border-[#D4AF37]/40'
          }`}>
            <Award className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
            <h5 className="font-serif text-base font-medium">{merged.assurance1Title}</h5>
            <p className="text-xs text-gray-400 mt-1">{merged.assurance1Description}</p>
          </div>
          <div className={`text-center p-5 rounded-2xl border backdrop-blur-md transition-all ${
            theme === 'dark' ? 'bg-black/40 border-white/10 hover:border-[#D4AF37]/40' : 'bg-white/80 border-stone-200 shadow-sm hover:border-[#D4AF37]/40'
          }`}>
            <Clock className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
            <h5 className="font-serif text-base font-medium">{merged.assurance2Title}</h5>
            <p className="text-xs text-gray-400 mt-1">{merged.assurance2Description}</p>
          </div>
          <div className={`text-center p-5 rounded-2xl border backdrop-blur-md transition-all ${
            theme === 'dark' ? 'bg-black/40 border-white/10 hover:border-[#D4AF37]/40' : 'bg-white/80 border-stone-200 shadow-sm hover:border-[#D4AF37]/40'
          }`}>
            <ShieldCheck className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
            <h5 className="font-serif text-base font-medium">{merged.assurance3Title}</h5>
            <p className="text-xs text-gray-400 mt-1">{merged.assurance3Description}</p>
          </div>
          <div className={`text-center p-5 rounded-2xl border backdrop-blur-md transition-all ${
            theme === 'dark' ? 'bg-black/40 border-white/10 hover:border-[#D4AF37]/40' : 'bg-white/80 border-stone-200 shadow-sm hover:border-[#D4AF37]/40'
          }`}>
            <MapPin className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
            <h5 className="font-serif text-base font-medium">{merged.assurance4Title}</h5>
            <p className="text-xs text-gray-400 mt-1">{merged.assurance4Description}</p>
          </div>
        </div>

      </div>
    </section>
  );
};
