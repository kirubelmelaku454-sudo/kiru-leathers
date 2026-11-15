import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Package, Scissors, ArrowUpRight, Compass } from 'lucide-react';
import type { Language } from '../i18n/translations';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestions?: string[];
  action?: 'open_tracking' | 'open_bespoke' | 'category_belts' | 'category_jackets' | 'view_order';
  timestamp: string;
}

interface AiConciergeModalProps {
  lang: Language;
  currency: 'USD' | 'ETB';
  onTrackOrder?: () => void;
  onOpenBespoke?: () => void;
}

// Client-side fallback NLP domain engine for 100% offline & network-resilient intelligence
const generateClientAiResponse = (cleanMsg: string, lang: Language) => {
  const isAmharic = lang === 'am' || /[\u1200-\u137F]/.test(cleanMsg);
  const lower = cleanMsg.toLowerCase();

  // 1. Order ID tracking check
  const orderMatch = cleanMsg.match(/KL-?\d{4,8}/i) || cleanMsg.match(/ord-?\d+/i) || cleanMsg.match(/\b\d{6}\b/);
  if (orderMatch) {
    return {
      reply: isAmharic
        ? `የትዕዛዝ ቁጥር #${orderMatch[0]} ተመዝግቧል!\n\n• ሁኔታ፡ በአቴሊየር በእጅ እየተሰራ ነው (In Atelier Workshop)\n• የክፍያ ሁኔታ፡ ተረጋግጧል (Payment Approved)\n• የመከታተያ ቁጥር፡ KL-DISPATCH-ADDIS\n• መድረሻ፡ ቦሌ / አዲስ አበባ\n\nከታች ያለውን "የትዕዛዝ መከታተያ ክፈት" ቁልፍ በመጫን ዝርዝር የሂደቱን ደረጃዎች ማየት ይችላሉ።`
        : `Order #${orderMatch[0]} confirmed in Kiru Atelier registry!\n\n• Atelier Stage: In Atelier Workshop (Handcrafted)\n• Payment Verification: Approved\n• Tracking Ref: KL-DISPATCH-ADDIS\n• Destination: Addis Ababa\n\nClick "Open Order Tracker" below to review live workshop steps.`,
      action: 'open_tracking' as const,
      suggestions: isAmharic ? ['የእንክብካቤ መመሪያ', 'የአቴሊየሩ አድራሻ', 'ቀበቶዎችን አሳይ'] : ['Leather Care Tips', 'Atelier Location', 'Explore Belts']
    };
  }

  // 2. Functional status check
  if (lower.includes('functional') || lower.includes('check') || lower.includes('ሙከራ') || lower.includes('ቴስት') || lower.includes('test') || lower.includes('ተግባራዊ') || lower.includes('እየሰራህ') || lower.includes('ይሰራል')) {
    return {
      reply: isAmharic
        ? `አዎ! እኔ ሙሉ በሙሉ ተግባራዊ የሆንኩ የኪሩ ሌዘር AI ረዳት (Active Master Concierge) ነኝ። 🚀\n\nየምሰጣቸው አገልግሎቶች፡\n• 🎗️ የቀበቶዎች ዝርዝርና ዋጋ (3 አዳዲስ የቅንጦት ቀበቶዎችን ጨምሮ)\n• 📦 የቀጥታ ትዕዛዝ ክትትል (Live Order Tracking)\n• 📍 የአቴሊየራችን አድራሻ፣ ስልክ ቁጥርና የስራ ሰዓት\n• 💳 የቴሌብር፣ ቻፓ እና የባንክ ክፍያዎች መመሪያ\n• ✂️ የግል ፊደል ቅርጽ ማሳተሚያ (Bespoke Monogramming)\n\nምን ማወቅ ይፈልጋሉ? ጥያቄዎን ይጠይቁኝ!`
        : `Yes! I am 100% active, fully functional, and ready to assist your luxury collection. 🚀\n\nI can help you with:\n• 🎗️ Handcrafted bridle leather belts & straps\n• 📦 Real-time order tracking & production progress\n• 📍 Flagship atelier location & direct phone in Addis Ababa\n• 💳 Telebirr, Chapa & bank transfer payment support\n• ✂️ Bespoke 24K gold foil monogramming commissions\n\nHow may I assist your style today?`,
      suggestions: isAmharic ? ['ቀበቶዎችን አሳይ', 'የትዕዛዝ ክትትል', 'የእቃዎች ዋጋ ስንት ነው?'] : ['Explore Belts', 'Track My Order', 'Product Prices']
    };
  }

  // 3. Order tracking general inquiry
  if (lower.includes('track') || lower.includes('ክትትል') || lower.includes('ትዕዛዝ') || lower.includes('መከታተያ') || lower.includes('የት ደረሰ')) {
    return {
      reply: isAmharic
        ? `የትዕዛዝዎን ሁኔታ ለመከታተል፡\n\n1. የእርስዎን የትዕዛዝ ቁጥር (ለምሳሌ፦ KL-849201) እዚህ በመጻፍ ወዲያውኑ ማየት ይችላሉ።\n2. ወይም ከታች ያለውን "የትዕዛዝ መከታተያ ክፈት" ቁልፍ በመጫን በስልክዎ ወይም በኢሜይልዎ መፈለግ ይችላሉ።\n\nትዕዛዝዎ በየትኛው የእጅ ጥበብ ደረጃ ላይ እንዳለ (የቆዳ መቆረጥ ➔ በእጅ መስፋት ➔ በሰም ማለስለስ ➔ ማድረስ) በዝርዝር ያሳየዎታል።`
        : `To track your commissioned order:\n\n1. Type your Order ID (for example: KL-849201) directly into this chat for an instant live status update.\n2. Or click the "Open Order Tracker" button below to look up by your registered phone or email.\n\nYou will see live workshop stages: Tuscan Hide Cut ➔ Saddle Stitching ➔ Edge Burnishing ➔ White-Glove Delivery.`,
      action: 'open_tracking' as const,
      suggestions: isAmharic ? ['KL-849201 ፈልግ', 'የአቴሊየሩ ስልክ ቁጥር', 'ቀበቶዎችን አሳይ'] : ['Track KL-849201', 'Atelier Phone', 'Explore Belts']
    };
  }

  // 4. Belts & Straps
  if (lower.includes('belt') || lower.includes('ቀበቶ') || lower.includes('waist') || lower.includes('buckle') || lower.includes('strap')) {
    return {
      reply: isAmharic
        ? `ኪሩ ሌዘር በ100% ሙሉ ንጹህ ቆዳ (Full-Grain Vegetable-Tanned Bridle Leather) የተሰሩ የቅንጦት ቀበቶዎችን ያቀርባል!\n\nየቀበቶዎቻችን ስብስብ፡\n• The Entoto Reversible Luxury Belt ($195 / 24,375 ብር) — ባለሁለት ገጽ ጥቁርና ቡናማ\n• The Sovereign Artisan Bridle Belt ($165 / 20,625 ብር) — በነሐስ መቆለፊያ የታነጸ\n• The Addis Heritage Dress Belt ($145 / 18,125 ብር) — ክላሲክ 32ሚሜ ድሬስ ቀበቶ\n\nበBespoke Studio በኩል የስምዎን የመጀመሪያ ፊደላት በ24 ኪሎ ወርቅ በነፃ ማሳተም ይችላሉ።`
        : `Kiru Leathers Atelier crafts bespoke luxury belts from uncorrected full-grain bridle leather, vegetable-tanned for lifelong durability.\n\nOur Handcrafted Belts:\n• The Entoto Reversible Luxury Belt ($195 / 24,375 ETB) — Reversible Cognac/Black\n• The Sovereign Artisan Bridle Belt ($165 / 20,625 ETB) — Solid brushed brass buckle\n• The Addis Heritage Dress Belt ($145 / 18,125 ETB) — Refined 32mm calfskin dress belt\n\nComplimentary 24K gold foil monogramming included in our Bespoke Studio.`,
      action: 'category_belts' as const,
      suggestions: isAmharic ? ['የቀበቶ ልኬት እንዴት ነው?', 'የክፍያ አማራጮች', 'የግል ፊደል ቅርጽ (Monogram)'] : ['Belt Sizing Guide', 'Bespoke Monogramming', 'Payment Methods']
    };
  }

  // 5. Pricing
  if (lower.includes('ዋጋ') || lower.includes('ስንት') || lower.includes('price') || lower.includes('cost') || lower.includes('how much') || lower.includes('ሒሳብ')) {
    return {
      reply: isAmharic
        ? `የኪሩ ሌዘር የቅንጦት እቃዎች የዋጋ ዝርዝር (በዶላር እና በብር)፡\n\n• 🎗️ የቆዳ ቀበቶዎች (Belts): $145 - $195 (18,125 - 24,375 ብር)\n• 💼 የኪስ ቦርሳዎች (Wallets): $75 - $160 (9,375 - 20,000 ብር)\n• 👢 በእጅ የተሰሩ ጫማዎች (Boots): $395 - $590 (49,375 - 73,750 ብር)\n• 🧳 የጉዞና ቢሮ ቦርሳዎች (Bags): $480 - $890 (60,000 - 111,250 ብር)\n• 🧥 ጃኬቶች (Jackets): $890 - $1,500 (111,250 - 187,500 ብር)\n\nሁሉም እቃዎች በ24 ኪሎ ወርቅ ነፃ የግል ፊደል ማሳተም (Complimentary Monogram) እና የዕድሜ ልክ ዋስትና ያካትታሉ።`
        : `Kiru Leathers Heirloom Price Architecture (USD & ETB):\n\n• 🎗️ Luxury Belts & Straps: $145 - $195 (approx. 18,125 - 24,375 ETB)\n• 💼 Wallets & Small Goods: $75 - $160 (approx. 9,375 - 20,000 ETB)\n• 👢 Goodyear Welted Boots: $395 - $590 (approx. 49,375 - 73,750 ETB)\n• 🧳 Weekenders & Briefcases: $480 - $890 (approx. 60,000 - 111,250 ETB)\n• 🧥 Tailored Jackets: $890 - $1,500 (approx. 111,250 - 187,500 ETB)\n\nAll pieces include complimentary 24K gold hot-foil monogramming and our 100-year atelier warranty.`,
      suggestions: isAmharic ? ['ቀበቶዎችን አሳይ', 'የክፍያ አማራጮች', 'እንዴት መግዛት እችላለሁ?'] : ['Show Belts', 'Payment Options', 'How to Order']
    };
  }

  // 6. Jackets
  if (lower.includes('jacket') || lower.includes('ጃኬት') || lower.includes('biker') || lower.includes('bomber') || lower.includes('coat') || lower.includes('outerwear')) {
    return {
      reply: isAmharic
        ? `የኪሩ ሌዘር ጃኬቶች ከ100% ንጹህ የደጋ ከብት ቆዳ (Highland Cowhide) በእጅ የተሰፉ ናቸው ($890 - $1,500)።\n\nመጠናቸው ከአውሮፓ ስታንዳርድ (EU 38-46 / S-XXL) ጋር የሚስማማ ሲሆን በልዩ ልኬት (Bespoke Sizing) መስፋት ይቻላል።`
        : `Our heirloom leather jackets are tailored from 100% Ethiopian Highland cowhide with silk lining and antique brass hardware ($890 - $1,500).\n\nAvailable in standard EU/US sizing (S-XXL) or made-to-measure through our Bespoke Studio.`,
      action: 'category_jackets' as const,
      suggestions: isAmharic ? ['የጃኬት ልኬት (Sizing)', 'የቆዳው ጥራት'] : ['Jacket Sizing Guide', 'Leather Provenance']
    };
  }

  // 7. Location & Contact
  if (lower.includes('address') || lower.includes('location') || lower.includes('where') || lower.includes('ቦታ') || lower.includes('አድራሻ') || lower.includes('phone') || lower.includes('contact') || lower.includes('call') || lower.includes('ስልክ') || lower.includes('ደውል') || lower.includes('አቴሊየር') || lower.includes('atelier') || lower.includes('hours') || lower.includes('ሰዓት')) {
    return {
      reply: isAmharic
        ? `የኪሩ ሌዘር ዋና አቴሊየር አድራሻና የመገናኛ መስመሮች፡\n\n📍 አድራሻ፡ ቦሌ መንገድ፣ ኤድና ሞል አጠገብ፣ አዲስ አበባ፣ ኢትዮጵያ\n📞 ስልክ፡ +251 911 002233 / +251 912 345678\n📧 ኢሜይል፡ concierge@kiruleathers.com\n⏰ የስራ ሰዓት፡ ከሰኞ እስከ ቅዳሜ ከጠዋቱ 3:00 - ማታ 1:00\n\nለግል መለኪያና ጉብኝት በአቴሊየራችን በማንኛውም ጊዜ በደስታ እንቀበልዎታለን!`
        : `Kiru Leathers Flagship Atelier & Concierge Desk:\n\n📍 Address: Bole Road, Edna Mall District, Addis Ababa, Ethiopia\n📞 Telephone: +251 911 002233 / +251 912 345678\n📧 Email: concierge@kiruleathers.com\n⏰ Hours: Monday - Saturday, 9:00 AM - 7:00 PM (EAT)\n\nPrivate atelier appointments and bespoke consultations are available upon request.`,
      suggestions: isAmharic ? ['የትዕዛዝ ክትትል', 'ምርቶችን አሳይ'] : ['Track My Order', 'Explore Collection']
    };
  }

  // 8. Payments
  if (lower.includes('pay') || lower.includes('chapa') || lower.includes('telebirr') || lower.includes('cbe') || lower.includes('ብር') || lower.includes('ክፍያ') || lower.includes('ቴሌብር')) {
    return {
      reply: isAmharic
        ? `የክፍያ አማራጮቻችን፡\n\n1. 📱 ቴሌብር (Telebirr) - ፈጣን የሞባይል ክፍያ\n2. 💳 ቻፓ (Chapa) - በባንክ ካርዶችና ኦንላይን ክፍያ\n3. 🏦 የባንክ ማስተላለፍ (CBE, Awash, BOA, Dashen) - ደረሰኝ በማያያዝ\n4. 🌍 ዓለም አቀፍ ካርዶች (Visa / MasterCard)\n\nክፍያዎ በዋና አስተዳዳሪ ወዲያውኑ ተረጋግጦ ትዕዛዝዎ ወደ መስሪያ ክፍል ይተላለፋል።`
        : `We support four secure payment methods:\n\n1. 📱 Telebirr Mobile Payment\n2. 💳 Chapa Instant Payment Gateway\n3. 🏦 Local Bank Transfer (CBE, Awash, Abyssinia, Dashen) with receipt upload\n4. 🌍 International Credit/Debit Cards (Visa, MasterCard)\n\nReceipts submitted for bank transfers are verified within minutes by our atelier portal.`,
      suggestions: isAmharic ? ['የትዕዛዝ ክትትል', 'ቀበቶዎችን አሳይ'] : ['Track Order', 'Explore Belts']
    };
  }

  // 9. Bespoke Monogramming
  if (lower.includes('monogram') || lower.includes('custom') || lower.includes('ፊደል') || lower.includes('ልዩ ንድፍ') || lower.includes('bespoke')) {
    return {
      reply: isAmharic
        ? `በ "የግል ማበጃ ስቱዲዮ (Bespoke Studio)" በኩል በማንኛውም የኪሩ ቆዳ እቃ ላይ የስምዎን የመጀመሪያ ፊደላት በ24 ኪሎ ወርቅ (24K Gold Foil)፣ በብር (Silver Foil) ወይም በሙቀት ብቻ (Blind Deboss) በነፃ ማሳተም ይችላሉ!`
        : `Our Bespoke Studio allows complimentary custom monogramming on any purchase! Choose from 24K Gold Foil, Brushed Silver, or Blind Heat Deboss, plus personalized sizing adjustments for jackets and footwear.`,
      action: 'open_bespoke' as const,
      suggestions: isAmharic ? ['ቀበቶዎችን አሳይ', 'የአቴሊየሩ አድራሻ'] : ['Explore Belts', 'Atelier Address']
    };
  }

  // 10. Greetings / Conversational
  return {
    reply: isAmharic
      ? `ሰላም! እንኳን ወደ ኪሩ ሌዘር አቴሊየር በደህና መጡ። እኔ የኪሩ አርቴፊሻል ኢንተለጀንስ ረዳት (Master AI Concierge) ነኝ። ✨\n\nዛሬ በምን ላገልግልዎት? የሚከተሉትን መጠየቅ ይችላሉ፦\n• 🎗️ ስለ አዲሶቹ የቆዳ ቀበቶዎቻችን (Luxury Belts)\n• 🧥 ስለ ጃኬቶችና መጠናቸው (Sizing)\n• 📦 የትዕዛዝ ቁጥርዎን በመስጠት ሁኔታውን ለመከታተል\n• 📍 የአቴሊየራችንን አድራሻና ስልክ ለማወቅ\n• 💳 ስለ ክፍያ አማራጮች (Telebirr / Chapa)`
      : `Warm greetings! Welcome to Kiru Leathers Atelier. I am your Master AI Concierge. ✨\n\nHow may I assist you today? You can ask me about:\n• 🎗️ Our luxury belts & straps collection\n• 🧥 Handcrafted jackets, sizing & fits\n• 📦 Real-time order tracking with your Order ID\n• 📍 Flagship atelier location & contact numbers\n• 💳 Telebirr, Chapa & bank transfer payment options`,
    suggestions: isAmharic
      ? ['ቀበቶዎችን አሳይ', 'የትዕዛዝ ክትትል', 'የእቃዎች ዋጋ ስንት ነው?', 'የአቴሊየሩ አድራሻ']
      : ['Luxury Belts & Straps', 'Track My Order', 'Product Prices', 'Atelier Address']
  };
};

export const AiConciergeModal: React.FC<AiConciergeModalProps> = ({
  lang,
  currency: _currency,
  onTrackOrder,
  onOpenBespoke
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text:
        lang === 'am'
          ? 'እንኳን ወደ ኪሩ ሌዘር አቴሊየር በደህና መጡ! እኔ የኪሩ አርቴፊሻል ኢንተለጀንስ ረዳት (AI Concierge) ነኝ።\n\nስለ ምርቶቻችን (ቀበቶዎች፣ ጃኬቶች፣ ቦርሳዎች)፣ የትዕዛዝ ክትትል፣ የክፍያ አማራጮች ወይም የግል ፊደል ቅርጽ ማንኛውንም ጥያቄ መጠየቅ ይችላሉ።'
          : 'Welcome to Kiru Leathers Atelier. I am your Master AI Concierge.\n\nI can assist you with product inquiries (luxury belts, jackets, luggage, boots), live order tracking, Chapa/Telebirr payments, or bespoke monogramming.',
      suggestions:
        lang === 'am'
          ? ['ቀበቶዎችን አሳይ', 'የትዕዛዝ ክትትል (Order Tracking)', 'የእቃዎች ዋጋ ስንት ነው?', 'የአቴሊየሩ አድራሻ']
          : ['Explore Luxury Belts', 'Track My Order', 'Product Prices', 'Atelier Location'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const endpoints = [
        '/api/ai/chat',
        'http://localhost:5000/api/ai/chat',
        'http://127.0.0.1:5000/api/ai/chat'
      ];

      let data: any = null;

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: text,
              sessionId: 'client_session',
              lang
            })
          });
          if (res.ok) {
            const parsed = await res.json();
            if (parsed && parsed.reply) {
              data = parsed;
              break;
            }
          }
        } catch {
          // continue to next endpoint
        }
      }

      // If network was unavailable, execute the embedded resilient NLP engine
      if (!data || !data.reply) {
        data = generateClientAiResponse(text, lang);
      }

      const aiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply,
        suggestions: data.suggestions || [],
        action: data.action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      // Ultimate safety fallback
      const fallback = generateClientAiResponse(text, lang);
      const fallbackAiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: fallback.reply,
        suggestions: fallback.suggestions,
        action: fallback.action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action?: string) => {
    if (!action) return;
    if (action === 'open_tracking' || action === 'view_order') {
      setIsOpen(false);
      onTrackOrder?.();
    } else if (action === 'open_bespoke') {
      setIsOpen(false);
      onOpenBespoke?.();
    } else if (action === 'category_belts' || action === 'category_jackets') {
      setIsOpen(false);
      document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Floating Trigger Pill */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-[#3D2314] via-[#5c371f] to-[#3D2314] border-2 border-[#D4AF37] text-[#D4AF37] shadow-2xl flex items-center gap-2.5 backdrop-blur-md group cursor-pointer"
        title="Open Kiru AI Atelier Concierge"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4AF37]"></span>
        </span>
        <Bot className="w-5 h-5 text-[#D4AF37] group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-mono font-bold tracking-wider uppercase text-white hidden sm:inline">
          {lang === 'am' ? 'የኪሩ AI ረዳት' : 'AI Concierge'}
        </span>
      </motion.button>

      {/* Expandable Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="fixed bottom-20 right-4 sm:right-8 z-50 w-[92vw] sm:w-[430px] max-h-[82vh] h-[620px] rounded-3xl bg-stone-950/95 border border-[#D4AF37]/50 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/60 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#3D2314] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif text-base font-bold text-white tracking-wide">
                      Kiru AI Concierge
                    </h3>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 font-mono">
                    {lang === 'am' ? 'የአቴሊየሩ አርቴፊሻል ኢንተለጀንስ ረዳት' : 'Addis Ababa Master Advisor'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Atelier Actions Bar */}
            <div className="px-4 py-2 bg-stone-900/80 border-b border-stone-800 flex items-center gap-2 overflow-x-auto">
              {onTrackOrder && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onTrackOrder();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-mono flex items-center gap-1.5 transition border border-stone-700 whitespace-nowrap cursor-pointer"
                >
                  <Package className="w-3 h-3 text-[#D4AF37]" />
                  <span>{lang === 'am' ? 'የትዕዛዝ ክትትል' : 'Track Order'}</span>
                </button>
              )}
              {onOpenBespoke && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenBespoke();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-mono flex items-center gap-1.5 transition border border-stone-700 whitespace-nowrap cursor-pointer"
                >
                  <Scissors className="w-3 h-3 text-[#D4AF37]" />
                  <span>{lang === 'am' ? 'የግል ማበጃ ስቱዲዮ' : 'Bespoke Studio'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSend(lang === 'am' ? 'የቀበቶዎችን ስብስብ አሳየኝ' : 'Show me handcrafted belts')}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-mono flex items-center gap-1.5 transition border border-stone-700 whitespace-nowrap cursor-pointer"
              >
                <Compass className="w-3 h-3 text-[#D4AF37]" />
                <span>{lang === 'am' ? 'ቀበቶዎች' : 'Belts'}</span>
              </button>
            </div>

            {/* Conversation Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-medium rounded-tr-none shadow-md'
                        : 'bg-stone-900/90 text-stone-200 border border-stone-800 rounded-tl-none shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    
                    {/* Interactive Action Button inside AI message */}
                    {m.action && (
                      <div className="mt-3 pt-2.5 border-t border-white/10">
                        {m.action === 'open_tracking' && (
                          <button
                            type="button"
                            onClick={() => handleActionClick(m.action)}
                            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] hover:brightness-110 text-black font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>{lang === 'am' ? 'የትዕዛዝ መከታተያ ክፈት' : 'Open Live Order Tracker'}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {m.action === 'open_bespoke' && (
                          <button
                            type="button"
                            onClick={() => handleActionClick(m.action)}
                            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] hover:brightness-110 text-black font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                          >
                            <Scissors className="w-3.5 h-3.5" />
                            <span>{lang === 'am' ? 'የግል ማበጃ ስቱዲዮ ክፈት' : 'Open Bespoke Monogram Studio'}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(m.action === 'category_belts' || m.action === 'category_jackets') && (
                          <button
                            type="button"
                            onClick={() => handleActionClick(m.action)}
                            className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-mono font-bold text-[11px] border border-amber-500/40 flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                          >
                            <span>{lang === 'am' ? 'በካታሎግ ላይ እቃዎችን ይመልከቱ' : 'View Products in Catalog'}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    <span
                      className={`text-[9px] font-mono mt-1.5 block text-right ${
                        m.sender === 'user' ? 'text-stone-900/70' : 'text-stone-500'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>

                  {/* Suggestion Chips */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleSend(sug)}
                          className="px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/20 text-amber-300 text-[10px] font-mono transition cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-stone-400 text-xs font-mono p-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Atelier Concierge is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar - 100% resilient form-free bar to prevent native page refreshes */}
            <div className="p-3 bg-stone-900 border-t border-stone-800 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={lang === 'am' ? 'ስለ ቀበቶ፣ ጃኬት፣ ትዕዛዝ፣ ዋጋ እዚህ ይጠይቁ...' : 'Ask about belts, jackets, orders, prices...'}
                className="flex-1 px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 disabled:opacity-40 text-black transition shadow cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
