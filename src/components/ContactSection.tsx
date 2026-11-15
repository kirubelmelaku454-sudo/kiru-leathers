import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  CheckCircle2, 
  Sparkles,
  Calendar,
  Building2,
  Lock,
  ShieldCheck,
  User as UserIcon,
  MessageSquare
} from 'lucide-react';
import { type CustomerMessage, type User, type ContactPageContent } from '../types';
import { DEFAULT_CONTACT_CONTENT } from '../data/defaultSiteContent';

interface ContactSectionProps {
  theme: 'dark' | 'light';
  user?: User | null;
  onOpenSignIn?: () => void;
  onOpenDashboard?: () => void;
  onNavigateHome?: () => void;
  isStandalonePage?: boolean;
  onSendMessage?: (message: CustomerMessage) => Promise<boolean | void> | void;
  content?: ContactPageContent;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ 
  theme, 
  user = null,
  onOpenSignIn,
  onOpenDashboard,
  onNavigateHome, 
  isStandalonePage,
  onSendMessage,
  content
}) => {
  const merged: ContactPageContent = { ...DEFAULT_CONTACT_CONTENT, ...(content || {}) };
  const [inquiryType, setInquiryType] = useState<'bespoke' | 'order' | 'visit' | 'general'>('bespoke');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const fullName = user?.name || '';
  const email = user?.email || '';
  const phone = user?.phone || '';

  // Typewriter Animation for dynamic tagline
  const targetText = merged.typewriterText || "Client Concierge.";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!user) {
      onOpenSignIn?.();
      return;
    }
    if (!message.trim() || sending) return;

    const newMessage: CustomerMessage = {
      id: `msg-${Date.now()}`,
      userId: user.id,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      inquiryType,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    setSending(true);
    try {
      if (onSendMessage) {
        const result = await onSendMessage(newMessage);
        if (result === false) {
          setSubmitError('Please sign in again to send a message.');
          return;
        }
      } else {
        const token = localStorage.getItem('kiru_token');
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(newMessage)
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Failed to dispatch message');
        }
      }
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message || 'Unable to send message right now.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className={`py-16 sm:py-24 relative overflow-hidden transition-colors border-t ${
      theme === 'dark' 
        ? 'bg-[#0B0B0D] text-[#F5F5F7] border-white/10' 
        : 'bg-white text-gray-900 border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Standalone Page Navigation / Breadcrumb */}
        {isStandalonePage && (
          <div className="mb-10 flex items-center justify-between pb-6 border-b border-gray-200/20">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#D4AF37] hover:brightness-125 transition-all group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>Back To Main Atelier & Collection</span>
            </button>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-gray-400">
              Maison / Concierge & Appointments
            </span>
          </div>
        )}
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3D2314]/70 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-mono tracking-[0.25em] uppercase mb-4 shadow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{merged.sectionBadge}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight mt-2 mb-4 min-h-[2.2em]">
            {merged.headingPrefix}<br />
            <span className="italic text-[#D4AF37] font-light inline-block relative">
              <span>{typedText}</span>
              <span className="inline-block w-[3px] h-[0.85em] bg-[#D4AF37] ml-1.5 align-middle animate-pulse" />
            </span>
          </h2>
          <p className={`text-sm sm:text-base font-light leading-relaxed ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {merged.mainDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Direct Atelier Coordinates & Business Presence */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className={`p-8 rounded-2xl border transition-all ${
              theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <h3 className="font-serif text-2xl font-normal mb-6 flex items-center gap-2">
                <span>{merged.flagshipTitle}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#3D2314] text-[#D4AF37] flex items-center justify-center shrink-0 shadow">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-bold">{merged.showroomTitle}</h4>
                    <p className="text-sm font-medium mt-0.5">{merged.showroomAddress}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{merged.showroomCity}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#3D2314] text-[#D4AF37] flex items-center justify-center shrink-0 shadow">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-bold">{merged.phoneTitle}</h4>
                    <p className="text-sm font-medium mt-0.5">{merged.phoneNumber}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{merged.phoneHours}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#3D2314] text-[#D4AF37] flex items-center justify-center shrink-0 shadow">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-bold">{merged.emailTitle}</h4>
                    <p className="text-sm font-medium mt-0.5">{merged.emailAddress}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{merged.emailSubtext}</p>
                  </div>
                </div>
              </div>

              {/* Direct Booking Badge */}
              <div className={`mt-8 p-4 rounded-xl border flex items-center justify-between ${
                theme === 'dark' ? 'bg-[#3D2314]/40 border-amber-500/30' : 'bg-amber-50/60 border-amber-200'
              }`}>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <span className="text-xs font-semibold block">{merged.appointmentTitle}</span>
                    <span className="text-[11px] text-gray-400">{merged.appointmentSubtitle}</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#D4AF37] font-bold uppercase">{merged.appointmentBadge}</span>
              </div>
            </div>

            {/* Corporate & Export Notice */}
            <div className={`p-6 rounded-2xl border ${
              theme === 'dark' ? 'bg-white/[0.02] border-white/10' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-[#D4AF37]" />
                <h4 className="text-xs font-mono uppercase tracking-widest font-bold">{merged.corporateTitle}</h4>
              </div>
              <p className={`text-xs font-light leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {merged.corporateDescription}
              </p>
            </div>

          </div>

          {/* Right Column: Interactive Consultation & Inquiry Form */}
          <div className="lg:col-span-7">
            <div className={`p-8 sm:p-10 rounded-2xl border shadow-xl relative ${
              theme === 'dark' ? 'bg-[#121215] border-white/10' : 'bg-white border-gray-200'
            }`}>
              
              {!user ? (
                <div className="py-12 sm:py-16 text-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#3D2314]/80 border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center mx-auto shadow-lg">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div className="space-y-2 max-w-md mx-auto">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Authenticated Members Only</span>
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-medium">
                      Sign In Required to Message Concierge
                    </h3>
                    <p className={`text-xs sm:text-sm leading-relaxed ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      መልዕክት ለመላክ መጀመሪያ ወደ አካውንትዎ መግባት (Sign In) አለብዎት። አንዴ ከገቡ ስምዎ፣ ስልክዎ እና ኢሜይልዎ በራስ-ሰር ይገባሉ፤ የአቴሊየሩን ምላሽም በቀጥታ በዳሽቦርድዎ ላይ ማየትና መመለስ ይችላሉ።
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenSignIn?.()}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black font-bold text-xs font-mono uppercase tracking-[0.2em] hover:brightness-105 shadow-xl shadow-[#D4AF37]/20 transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Sign In / Create Account (ይግቡ)</span>
                  </button>
                </div>
              ) : submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-16 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium">Inquiry Received With Honor</h3>
                  <p className={`text-sm max-w-md mx-auto ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Thank you, <span className="font-semibold text-[#D4AF37]">{fullName}</span>. Our master artisan concierge has logged your message and our reply will appear directly inside your Customer Dashboard.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {onOpenDashboard && (
                      <button
                        type="button"
                        onClick={onOpenDashboard}
                        className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-black text-xs font-mono font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>View in My Dashboard (ምላሾችን ይመልከቱ)</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setMessage('');
                      }}
                      className="px-6 py-2.5 rounded-xl border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-mono uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl font-normal mb-1">Send a Private Message</h3>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Your verified account details are loaded automatically below — simply write your message.
                    </p>
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-xs font-mono text-red-400">
                      {submitError}
                    </div>
                  )}

                  {/* Inquiry Type Radio / Pill Selection */}
                  <div>
                    <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Nature of Consultation *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'bespoke', label: 'Bespoke Order' },
                        { id: 'visit', label: 'Atelier Visit' },
                        { id: 'order', label: 'Order Inquiry' },
                        { id: 'general', label: 'Corporate Gift' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setInquiryType(item.id as any)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-mono transition-all text-center border ${
                            inquiryType === item.id
                              ? 'bg-[#3D2314] text-[#D4AF37] border-[#D4AF37] font-bold shadow'
                              : theme === 'dark'
                                ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:text-black'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto-populated Signed-In Account Details (No manual typing needed) */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    theme === 'dark'
                      ? 'bg-emerald-500/[0.04] border-emerald-500/25'
                      : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>Signed-In Client Identity (በአካውንትዎ በራስ-ሰር የተሞላ)</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                        Verified Auto-Fill
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={fullName}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-mono cursor-default select-none outline-none ${
                            theme === 'dark'
                              ? 'bg-black/40 border border-white/10 text-stone-200'
                              : 'bg-white border border-gray-200 text-gray-800'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Phone / WhatsApp
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={phone || 'Not set on account'}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-mono cursor-default select-none outline-none ${
                            theme === 'dark'
                              ? 'bg-black/40 border border-white/10 text-stone-200'
                              : 'bg-white border border-gray-200 text-gray-800'
                          } ${!phone ? 'opacity-60 italic' : ''}`}
                        />
                      </div>

                      <div>
                        <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          readOnly
                          value={email}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-mono cursor-default select-none outline-none ${
                            theme === 'dark'
                              ? 'bg-black/40 border border-white/10 text-stone-200'
                              : 'bg-white border border-gray-200 text-gray-800'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Your Message or Custom Request *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Specify your leather preferences, bespoke sizing specifications, or desired appointment date..."
                      className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors ${
                        theme === 'dark'
                          ? 'bg-white/5 border border-white/15 text-white placeholder-gray-500 focus:border-[#D4AF37]'
                          : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#D4AF37]'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#D4AF37] text-black font-semibold uppercase text-xs tracking-[0.2em] hover:shadow-xl hover:shadow-[#D4AF37]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sending ? 'Sending...' : 'Send Message to Atelier Concierge'}</span>
                  </button>

                  <p className="text-[11px] text-gray-400 text-center font-mono">
                    Direct reply guaranteed within 4 hours • Replies appear in your Customer Dashboard
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

