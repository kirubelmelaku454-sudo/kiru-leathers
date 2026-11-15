// AI Atelier Concierge Service - Multi-lingual & Intelligent Domain Engine
const db = require('../db');

class AiConciergeService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  // Answer user query
  async chat({ message, sessionId = 'default', lang = 'en', user = null }) {
    const cleanMsg = (message || '').trim();
    if (!cleanMsg) {
      return {
        reply: lang === 'am' ? 'እባክዎ ጥያቄዎን ያስገቡ።' : 'Please ask a question about our leather collection.',
        suggestions: []
      };
    }

    const isAmharic = lang === 'am' || /[\u1200-\u137F]/.test(cleanMsg);
    const lower = cleanMsg.toLowerCase();

    // 1. Order Status Detection: If user includes an Order ID (KL-XXXXXX or digits or ord-)
    const orderMatch = cleanMsg.match(/KL-?\d{4,8}/i) || cleanMsg.match(/ord-?\d+/i) || cleanMsg.match(/\b\d{6}\b/);
    if (orderMatch) {
      const rawMatch = orderMatch[0].toUpperCase();
      const queryId = rawMatch.replace('-', '');
      const orders = await db.getOrders();
      const matched = orders.find((o) => {
        const oId = (o.id || '').toUpperCase().replace('-', '');
        return oId === queryId || oId.includes(queryId);
      });

      if (matched) {
        let statusAmharic = 'በአቴሊየር እየተሰራ ነው';
        if (matched.status === 'Payment Verification') statusAmharic = 'ክፍያ ማረጋገጫ ላይ ነው';
        if (matched.status === 'Shipped') statusAmharic = 'ለንኪ እና ማጓጓዝ ወጥቷል';
        if (matched.status === 'Delivered') statusAmharic = 'ለደንበኛው ደርሷል';
        if (matched.status === 'Payment Rejected') statusAmharic = 'ክፍያው ውድቅ ተደርጓል';

        const reply = isAmharic
          ? `ትዕዛዝ #${matched.id} ተገኝቷል!\n\n• የትዕዛዝ ሁኔታ፡ ${statusAmharic} (${matched.status})\n• የክፍያ ሁኔታ፡ ${matched.paymentStatus || 'በማረጋገጥ ላይ'}\n• የመከታተያ ቁጥር፡ ${matched.trackingNumber || 'KL-DISPATCH-ADDIS'}\n• ጠቅላላ ዋጋ፡ ${matched.currency || 'USD'} ${(matched.totalAmount || 0).toLocaleString()}\n• የመድረሻ አድራሻ፡ ${matched.customer?.address || 'Bole, Addis Ababa'}\n\nዕቃዎ በኪሩ ሌዘር ዋና የእጅ ጥበብ ባለሙያዎች በከፍተኛ ጥንቃቄ እየተዘጋጀ ይገኛል።`
          : `Order #${matched.id} verified in Kiru Atelier registry!\n\n• Atelier Stage: ${matched.status}\n• Payment Verification: ${matched.paymentStatus || 'Verified'}\n• Tracking Number: ${matched.trackingNumber || 'KL-DISPATCH-ADDIS'}\n• Total Amount: ${matched.currency || 'USD'} ${(matched.totalAmount || 0).toLocaleString()}\n• Destination: ${matched.customer?.address || 'Addis Ababa'}\n\nOur master artisans are actively treating your commissioned piece with Tuscan beeswax finish.`;

        await db.saveAiConversation(sessionId, cleanMsg, reply, isAmharic ? 'am' : 'en');
        return {
          reply,
          action: 'view_order',
          orderId: matched.id,
          suggestions: isAmharic
            ? ['የእንክብካቤ መመሪያ', 'የአቴሊየሩ አድራሻ', 'ቀበቶዎችን አሳይ']
            : ['Leather Care Tips', 'Atelier Location', 'Explore Luxury Belts']
        };
      } else {
        const reply = isAmharic
          ? `የተሰጠው የትዕዛዝ ቁጥር (${orderMatch[0]}) በዳታቤዝ ውስጥ አልተገኘም።\n\nእባክዎን ትክክለኛውን የትዕዛዝ ቁጥር (ለምሳሌ፦ KL-849201 ወይም በኢሜይልዎ የተላከውን) ያረጋግጡ ወይም ከላይ ያለውን "የትዕዛዝ ክትትል" ቁልፍ በመጫን በስልክዎ መፈለግ ይችላሉ።`
          : `Order reference ${orderMatch[0]} was not found in our live registry.\n\nPlease verify your order code (e.g. KL-849201) or click "Track Order" above to look up by customer email or phone.`;
        return {
          reply,
          action: 'open_tracking',
          suggestions: isAmharic ? ['KL-849201 ሞክር', 'የአቴሊየሩ ስልክ'] : ['Try KL-849201', 'Contact Concierge']
        };
      }
    }

    // 2. Fetch live product catalog for contextual accuracy
    let allProducts = [];
    try {
      allProducts = await db.getProducts();
    } catch (e) {
      allProducts = [];
    }

    // 3. Functional Status / Test check
    if (lower.includes('functional') || lower.includes('check') || lower.includes('ሙከራ') || lower.includes('ቴስት') || lower.includes('test') || lower.includes('ተግባራዊ') || lower.includes('እየሰራህ') || lower.includes('ይሰራል')) {
      const beltCount = allProducts.filter(p => p.category === 'belts').length;
      const totalCount = allProducts.length;
      const reply = isAmharic
        ? `አዎ! እኔ ሙሉ በሙሉ ተግባራዊ የሆንኩ የኪሩ ሌዘር AI ረዳት (Active Master Concierge) ነኝ። 🚀\n\nየምሰጣቸው አገልግሎቶች፡\n• 🎗️ የቀበቶዎች ዝርዝርና ዋጋ (${beltCount} አዳዲስ የቆዳ ቀበቶዎችን ጨምሮ በአጠቃላይ ${totalCount} እቃዎች አሉን)\n• 📦 የቀጥታ ትዕዛዝ ክትትል (Live Order Tracking)\n• 📍 የአቴሊየራችን አድራሻ፣ ስልክ ቁጥርና የስራ ሰዓት\n• 💳 የቴሌብር፣ ቻፓ እና የባንክ ክፍያዎች መመሪያ\n• ✂️ የግል ፊደል ቅርጽ ማሳተሚያ (Bespoke Monogramming)\n\nምን ማወቅ ይፈልጋሉ? ጥያቄዎን ይጠይቁኝ!`
        : `Yes! I am 100% active, fully functional, and connected live to Kiru Leathers database. 🚀\n\nI can assist you with:\n• 🎗️ Handcrafted belts & straps (${beltCount} luxury belts, ${totalCount} total pieces in catalog)\n• 📦 Live order tracking & production stages\n• 📍 Atelier flagship address, telephone & hours in Addis Ababa\n• 💳 Payment options (Telebirr, Chapa, CBE, Cards)\n• ✂️ Personalized monogramming in 24K gold foil\n\nHow may I assist your collection today?`;

      await db.saveAiConversation(sessionId, cleanMsg, reply, isAmharic ? 'am' : 'en');
      return {
        reply,
        suggestions: isAmharic
          ? ['ቀበቶዎችን አሳይ', 'የትዕዛዝ ክትትል', 'የእቃዎች ዋጋ ስንት ነው?']
          : ['Explore Luxury Belts', 'Track My Order', 'Product Prices']
      };
    }

    // 4. Order Tracking inquiry WITHOUT specific Order ID
    if (lower.includes('track') || lower.includes('ክትትል') || lower.includes('ትዕዛዝ') || lower.includes('መከታተያ') || lower.includes('የት ደረሰ')) {
      const reply = isAmharic
        ? `የትዕዛዝዎን ሁኔታ ለመከታተል፡\n\n1. የእርስዎን የትዕዛዝ ቁጥር (ለምሳሌ፦ KL-849201) እዚህ በመጻፍ ወዲያውኑ ማየት ይችላሉ።\n2. ወይም ከላይ ያለውን "የትዕዛዝ ክትትል (Track Order)" ቁልፍ በመጫን በስልክዎ ወይም በኢሜይልዎ መፈለግ ይችላሉ።\n\nትዕዛዝዎ በየትኛው የእጅ ጥበብ ደረጃ ላይ እንዳለ (የቆዳ መቆረጥ ➔ በእጅ መስፋት ➔ በሰም ማለስለስ ➔ ማድረስ) በዝርዝር ያሳየዎታል።`
        : `To track your commissioned order:\n\n1. Type your Order ID (for example: KL-849201) directly into this chat for an instant live status update.\n2. Or click the "Track Order" button at the top to track via your registered email or phone.\n\nYou will see live workshop stages: Tuscan Hide Cut ➔ Saddle Stitching ➔ Edge Burnishing ➔ White-Glove Dispatch.`;

      await db.saveAiConversation(sessionId, cleanMsg, reply, isAmharic ? 'am' : 'en');
      return {
        reply,
        action: 'open_tracking',
        suggestions: isAmharic
          ? ['KL-849201 ፈልግ', 'የአቴሊየሩ ስልክ ቁጥር', 'ቀበቶዎችን አሳይ']
          : ['Track KL-849201', 'Atelier Phone', 'Explore Belts']
      };
    }

    // 5. Pricing / Cost inquiries
    if (lower.includes('ዋጋ') || lower.includes('ስንት') || lower.includes('price') || lower.includes('cost') || lower.includes('how much') || lower.includes('ሒሳብ')) {
      const reply = isAmharic
        ? `የኪሩ ሌዘር የቅንጦት እቃዎች የዋጋ ዝርዝር (በዶላር እና በብር)፡\n\n• 🎗️ የቆዳ ቀበቶዎች (Belts): $145 - $195 (18,125 - 24,375 ብር)\n• 💼 የኪስ ቦርሳዎች (Wallets): $75 - $160 (9,375 - 20,000 ብር)\n• 👢 በእጅ የተሰሩ ጫማዎች (Boots): $395 - $590 (49,375 - 73,750 ብር)\n• 🧳 የጉዞና ቢሮ ቦርሳዎች (Bags): $480 - $890 (60,000 - 111,250 ብር)\n• 🧥 ጃኬቶች (Jackets): $890 - $1,500 (111,250 - 187,500 ብር)\n\nሁሉም እቃዎች በ24 ኪሎ ወርቅ ነፃ የግል ፊደል ማሳተም (Complimentary Monogram) እና የዕድሜ ልክ ዋስትና ያካትታሉ።`
        : `Kiru Leathers Heirloom Price Architecture (USD & ETB):\n\n• 🎗️ Luxury Belts & Straps: $145 - $195 (approx. 18,125 - 24,375 ETB)\n• 💼 Wallets & Small Goods: $75 - $160 (approx. 9,375 - 20,000 ETB)\n• 👢 Goodyear Welted Boots: $395 - $590 (approx. 49,375 - 73,750 ETB)\n• 🧳 Weekenders & Briefcases: $480 - $890 (approx. 60,000 - 111,250 ETB)\n• 🧥 Tailored Jackets: $890 - $1,500 (approx. 111,250 - 187,500 ETB)\n\nAll pieces include complimentary 24K gold hot-foil monogramming and our 100-year atelier warranty.`;

      await db.saveAiConversation(sessionId, cleanMsg, reply, isAmharic ? 'am' : 'en');
      return {
        reply,
        suggestions: isAmharic
          ? ['ቀበቶዎችን አሳይ', 'የክፍያ አማራጮች', 'እንዴት መግዛት እችላለሁ?']
          : ['Show Belts', 'Payment Options', 'How to Order']
      };
    }

    // 6. How to Buy / Order
    if (lower.includes('መግዛት') || lower.includes('ማዘዝ') || lower.includes('ግዢ') || lower.includes('buy') || lower.includes('order') || lower.includes('purchase') || lower.includes('checkout') || lower.includes('ጋሪ')) {
      const reply = isAmharic
        ? `በኪሩ ሌዘር እቃዎችን በቀላሉ ለማዘዝ፦\n\n1. የሚፈልጉትን እቃ ከመረጡ በኋላ ቀለምና መጠን (Size) ይምረጡ\n2. 'Add to Bag' በማለት ወደ ጋሪዎ ያስገቡ\n3. 'Bespoke Studio' በመግባት የስምዎን የመጀመሪያ ፊደል (Monogram) በወርቅ ወይም በብር በነፃ ያሳትሙ\n4. በቴሌብር (Telebirr)፣ በቻፓ (Chapa) ወይም በባንክ ማስተላለፊያ ደረሰኝ በማያያዝ ክፍያዎን ያጠናቁ!\n\nትዕዛዝዎ ወዲያውኑ በአቴሊየሩ ተረጋግጦ ይላክልዎታል።`
        : `How to commission a Kiru Leathers piece:\n\n1. Browse our collection and select your preferred heirloom piece, leather shade, and size.\n2. Click "Add to Bag" to place it in your artisan queue.\n3. Open "Bespoke Studio" if you desire complimentary custom initials monogrammed in 24K gold foil.\n4. Complete checkout seamlessly via Telebirr, Chapa, local bank transfer with receipt upload, or international cards.\n\nOur concierge will confirm your dispatch within minutes.`;

      await db.saveAiConversation(sessionId, cleanMsg, reply, isAmharic ? 'am' : 'en');
      return {
        reply,
        suggestions: isAmharic
          ? ['ቀበቶዎችን አሳይ', 'የክፍያ አማራጮች', 'የአቴሊየሩ አድራሻ']
          : ['Explore Belts', 'Payment Options', 'Atelier Address']
      };
    }

    // 7. Category: BELTS & STRAPS
    if (lower.includes('belt') || lower.includes('ቀበቶ') || lower.includes('waist') || lower.includes('buckle') || lower.includes('strap')) {
      const beltProducts = allProducts.filter((p) => p.category === 'belts' || p.name.toLowerCase().includes('belt'));
      let productDetails = '';
      if (beltProducts.length > 0) {
        productDetails = beltProducts
          .map((b) => `• ${b.name}: $${b.price} (ወደ ${(b.price * 125).toLocaleString()} ብር) — ${b.description?.slice(0, 90)}...`)
          .join('\n');
      } else {
        productDetails = '• The Entoto Reversible Luxury Belt ($195)\n• The Sovereign Artisan Bridle Belt ($165)\n• The Addis Heritage Dress Belt ($145)';
      }

      const reply = isAmharic
        ? `ኪሩ ሌዘር በ100% ሙሉ ንጹህ ቆዳ (Full-Grain Vegetable-Tanned Bridle Leather) የተሰሩ የቅንጦት ቀበቶዎችን ያቀርባል!\n\nየቀበቶዎቻችን ስብስብ፡\n${productDetails}\n\nእያንዳንዱ ቀበቶ በ24 ኪሎ የነሐስ መቆለፊያ (Solid Brass Buckle) እና በተፈጥሮ ንብ ሰም የታሸገ ጠርዝ አለው። በBespoke Studio በኩል የስምዎን ፊደላት በነፃ ማሳተም ይችላሉ።`
        : `Kiru Leathers Atelier crafts bespoke luxury belts from uncorrected full-grain bridle leather, vegetable-tanned for lifelong durability.\n\nOur Handcrafted Belts:\n${productDetails}\n\nEach belt features solid brushed brass hardware, hand-beveled edges sealed with organic beeswax, and customizable hot-foil monogramming in our Bespoke Studio.`;

      await db.saveAiConversation(sessionId, cleanMsg, reply, isAmharic ? 'am' : 'en');
      return {
        reply,
        action: 'category_belts',
        suggestions: isAmharic
          ? ['የቀበቶ ልኬት እንዴት ነው?', 'የክፍያ አማራጮች', 'የግል ፊደል ቅርጽ (Monogram)']
          : ['Belt Sizing Guide', 'Bespoke Monogramming', 'Payment Methods']
      };
    }

    // 8. Category: JACKETS
    if (lower.includes('jacket') || lower.includes('ጃኬት') || lower.includes('biker') || lower.includes('bomber') || lower.includes('coat') || lower.includes('outerwear')) {
      const jackets = allProducts.filter((p) => p.category === 'jackets');
      const list = jackets.slice(0, 3).map((j) => `• ${j.name} ($${j.price} / ${(j.price * 125).toLocaleString()} ብር)`).join('\n') || '• The Sovereign Biker Jacket ($890)\n• The Addis Aviator Bomber ($940)';
      const reply = isAmharic
        ? `የኪሩ ሌዘር ጃኬቶች ከ100% ንጹህ የደጋ ከብት ቆዳ (Highland Cowhide) በእጅ የተሰፉ ናቸው።\n\nታዋቂ ጃኬቶቻችን፡\n${list}\n\nመጠናቸው ከአውሮፓ ስታንዳርድ (EU 38-46 / S-XXL) ጋር የሚስማማ ሲሆን በልዩ ልኬት (Bespoke Sizing) መስፋት ይቻላል።`
        : `Our heirloom leather jackets are tailored from 100% Ethiopian Highland cowhide with silk lining and antique brass hardware.\n\nFeatured Outerwear:\n${list}\n\nAvailable in standard EU/US sizing (S-XXL) or made-to-measure through our Bespoke Studio.`;

      await db.saveAiConversation(sessionId, cleanMsg, reply, isAmharic ? 'am' : 'en');
      return {
        reply,
        action: 'category_jackets',
        suggestions: isAmharic ? ['የጃኬት ልኬት (Sizing)', 'የቆዳው ጥራት'] : ['Jacket Sizing Guide', 'Leather Provenance']
      };
    }

    // 9. Category: BAGS & DUFFELS
    if (lower.includes('bag') || lower.includes('ቦርሳ') || lower.includes('duffel') || lower.includes('weekender') || lower.includes('backpack') || lower.includes('briefcase')) {
      const bags = allProducts.filter((p) => p.category === 'bags');
      const list = bags.slice(0, 3).map((b) => `• ${b.name} ($${b.price} / ${(b.price * 125).toLocaleString()} ብር)`).join('\n') || '• The Entoto Weekender Duffel ($680)\n• The Executive Briefcase ($590)';
      const reply = isAmharic
        ? `የኪሩ ሌዘር ቦርሳዎች ለጉዞ፣ ለቢሮ እና ለዕለታዊ አገልግሎት የሚሆኑ የቅንጦት እቃዎች ናቸው።\n\nታዋቂ ቦርሳዎቻችን፡\n${list}\n\nበእጅ በሰም ክር (Hand Saddle-Stitched) የተሰፉና ለዕድሜ ልክ ዋስትና ያላቸው ናቸው።`
        : `Our leather luggage and bags are designed for international travel and executive lifestyles.\n\nFeatured Bags:\n${list}\n\nHand-stitched using French waxed linen thread and sealed with Ethiopian mountain beeswax.`;

      await db.saveAiConversation(sessionId, cleanMsg, reply, isAmharic ? 'am' : 'en');
      return {
        reply,
        suggestions: isAmharic ? ['ቀበቶዎችን አሳይ', 'የትዕዛዝ ክትትል'] : ['Explore Belts', 'Track My Order']
      };
    }

    // 10. Category: BOOTS & FOOTWEAR
    if (lower.includes('boot') || lower.includes('shoe') || lower.includes('ጫማ') || lower.includes('footwear') || lower.includes('loafer')) {
      const boots = allProducts.filter((p) => p.category === 'footwear');
      const list = boots.slice(0, 3).map((b) => `• ${b.name} ($${b.price} / ${(b.price * 125).toLocaleString()} ብር)`).join('\n') || '• The Ras Dashen Goodyear Welt Boot ($450)\n• The Abyssinian Chelsea Boot ($395)';
      const reply = isAmharic
        ? `የኪሩ ሌዘር ጫማዎች በታዋቂው የጉድይር ዌልት (Goodyear Welted) የጥበብ ዘዴ የተሰሩ ናቸው።\n\nምርጥ ጫማዎቻችን፡\n${list}\n\nመጠናቸው ከአውሮፓ ልኬት (EU 39-46) ጋር የተጣጣመ ነው።`
        : `Our handmade footwear incorporates Goodyear welt construction for resolable longevity.\n\nFeatured Footwear:\n${list}\n\nCrafted on tailored lasts fitting European sizes EU 39 to 46.`;

      await db.saveAiConversation(sessionId, cleanMsg, reply, isAmharic ? 'am' : 'en');
      return {
        reply,
        suggestions: isAmharic ? ['የጫማ ልኬት', 'የክፍያ አማራጮች'] : ['Shoe Sizing Guide', 'Payment Methods']
      };
    }

    // 11. Category: WALLETS
    if (lower.includes('wallet') || lower.includes('ኪስ ቦርሳ') || lower.includes('cardholder') || lower.includes('bifold')) {
      const reply = isAmharic
        ? `የኪሩ ሌዘር የኪስ ቦርሳዎች (Wallets & Cardholders) ከ100% ሙሉ ቆዳ የተሰሩ፣ RFID ጥበቃ ያላቸው እና በወርቅ ፊደል የሚታተሙ ናቸው ($75 - $160 / 9,375 - 20,000 ETB)።`
        : `Our handcrafted wallets and cardholders feature ultra-slim profiles, RFID protection, and hand-burnished edges ($75 - $160). Complimentary monogramming included.`;

      await db.saveAiConversation(sessionId, cleanMsg, reply, isAmharic ? 'am' : 'en');
      return {
        reply,
        suggestions: isAmharic ? ['ቀበቶዎችን አሳይ', 'የግል ፊደል ቅርጽ'] : ['Explore Belts', 'Bespoke Monogramming']
      };
    }

    // 12. Overview of All Products
    if (lower.includes('product') || lower.includes('collection') || lower.includes('ምርት') || lower.includes('እቃ') || lower.includes('ምን አላችሁ') || lower.includes('what do you have') || lower.includes('catalog')) {
      const reply = isAmharic
        ? `በኪሩ ሌዘር አቴሊየር የሚከተሉትን 5 የቅንጦት የቆዳ ስብስቦች እናቀርባለን፡\n\n1. 🎗️ የቆዳ ቀበቶዎች (Luxury Belts & Straps) — $145 - $195\n2. 🧥 ጃኬቶች (Bespoke Jackets & Outerwear) — $890 - $1,500\n3. 🧳 ቦርሳዎች (Weekenders, Briefcases & Backpacks) — $480 - $890\n4. 👢 ጫማዎች (Goodyear Welted Boots & Loafers) — $395 - $590\n5. 💼 የኪስ ቦርሳዎች (Minimalist Wallets & Cardholders) — $75 - $160\n\nሁሉም ምርቶቻችን በ100% ንጹህ የኢትዮጵያ ደጋ ቆዳ በእጅ የተሰሩ ናቸው።`
        : `Kiru Leathers Atelier offers five master-crafted luxury leather collections:\n\n1. 🎗️ Belts & Straps: Italian bridle leather belts with solid brass buckles ($145 - $195)\n2. 🧥 Jackets & Outerwear: Tailored full-grain leather jackets ($890 - $1,500)\n3. 🧳 Bags & Duffels: Weekender luggage and briefcases ($480 - $890)\n4. 👢 Boots & Footwear: Goodyear welted leather boots ($395 - $590)\n5. 💼 Wallets & Small Goods: Slim bi-folds and cardholders ($75 - $160)\n\nAll items are crafted in Addis Ababa with lifetime warranties.`;

      await db.saveAiConversation(sessionId, cleanMsg, reply, isAmharic ? 'am' : 'en');
      return {
        reply,
        suggestions: isAmharic ? ['ቀበቶዎችን አሳይ', 'የአቴሊየሩ አድራሻ', 'የክፍያ አማራጮች'] : ['Show Belts', 'Atelier Address', 'Payment Options']
      };
    }

    // 13. Location, Atelier, Hours & Contact Inquiries
    if (lower.includes('address') || lower.includes('location') || lower.includes('where') || lower.includes('ቦታ') || lower.includes('አድራሻ') || lower.includes('phone') || lower.includes('contact') || lower.includes('call') || lower.includes('ስልክ') || lower.includes('ደውል') || lower.includes('owner') || lower.includes('ባለቤት') || lower.includes('አቴሊየር') || lower.includes('atelier') || lower.includes('ሱቅ') || lower.includes('ሰዓት') || lower.includes('hours')) {
      const reply = isAmharic
        ? `የኪሩ ሌዘር ዋና አቴሊየር አድራሻና የመገናኛ መስመሮች፡\n\n📍 አድራሻ፡ ቦሌ መንገድ፣ ኤድና ሞል አጠገብ፣ አዲስ አበባ፣ ኢትዮጵያ\n📞 ስልክ፡ +251 911 002233 / +251 912 345678\n📧 ኢሜይል፡ concierge@kiruleathers.com\n⏰ የስራ ሰዓት፡ ከሰኞ እስከ ቅዳሜ ከጠዋቱ 3:00 - ማታ 1:00\n\nለግል መለኪያና ጉብኝት በአቴሊየራችን በማንኛውም ጊዜ በደስታ እንቀበልዎታለን!`
        : `Kiru Leathers Flagship Atelier & Concierge Desk:\n\n📍 Address: Bole Road, Edna Mall District, Addis Ababa, Ethiopia\n📞 Telephone: +251 911 002233 / +251 912 345678\n📧 Email: concierge@kiruleathers.com\n⏰ Hours: Monday - Saturday, 9:00 AM - 7:00 PM (EAT)\n\nPrivate atelier appointments and bespoke consultations are available upon request.`;

      await db.saveAiConversation(sessionId, cleanMsg, reply, isAmharic ? 'am' : 'en');
      return {
        reply,
        suggestions: isAmharic ? ['የትዕዛዝ ክትትል', 'ምርቶችን አሳይ'] : ['Track My Order', 'Explore Collection']
      };
    }

    // 14. Payment Inquiries
    if (lower.includes('pay') || lower.includes('chapa') || lower.includes('telebirr') || lower.includes('cbe') || lower.includes('ብር') || lower.includes('ክፍያ') || lower.includes('ቴሌብር')) {
      const reply = isAmharic
        ? `የክፍያ አማራጮቻችን፡\n\n1. 📱 ቴሌብር (Telebirr) - ፈጣን የሞባይል ክፍያ\n2. 💳 ቻፓ (Chapa) - በባንክ ካርዶችና ኦንላይን ክፍያ\n3. 🏦 የባንክ ማስተላለፍ (CBE, Awash, BOA, Dashen) - ደረሰኝ በማያያዝ\n4. 🌍 ዓለም አቀፍ ካርዶች (Visa / MasterCard)\n\nክፍያዎ በዋና አስተዳዳሪ ወዲያውኑ ተረጋግጦ ትዕዛዝዎ ወደ መስሪያ ክፍል ይተላለፋል።`
        : `We support four secure payment methods:\n\n1. 📱 Telebirr Mobile Payment\n2. 💳 Chapa Instant Payment Gateway\n3. 🏦 Local Bank Transfer (CBE, Awash, Abyssinia, Dashen) with receipt upload\n4. 🌍 International Credit/Debit Cards (Visa, MasterCard)\n\nReceipts submitted for bank transfers are verified within minutes by our atelier portal.`;

      await db.saveAiConversation(sessionId, cleanMsg, reply, isAmharic ? 'am' : 'en');
      return {
        reply,
        suggestions: isAmharic ? ['የትዕዛዝ ክትትል', 'ቀበቶዎችን አሳይ'] : ['Track Order', 'Explore Belts']
      };
    }

    // 15. Leather Provenance & Beeswax Care
    if (lower.includes('leather') || lower.includes('hide') || lower.includes('ጥራት') || lower.includes('ቆዳ') || lower.includes('care') || lower.includes('clean') || lower.includes('ሰም') || lower.includes('ንብ ሰም') || lower.includes('beeswax')) {
      const reply = isAmharic
        ? `የኪሩ ሌዘር የቆዳ ጥራትና እንክብካቤ መመሪያ፡\n\n• የምንጠቀመው 100% ንጹህ የደጋ ከብት ሙሉ ቆዳ (Full-Grain Ethiopian Highland Cowhide) ሲሆን ጥንካሬው ወደር የለውም።\n• ጠርዞቹ በኢትዮጵያ የተፈጥሮ የንብ ሰም (Natural Beeswax) በእጅ የተለሰለሱ ናቸው።\n• እንክብካቤ፡ በየ 6 ወሩ በቆዳ ቅባት ወይም በንብ ሰም ይቅቡት፤ ከቀጥታ የፀሐይ ብርሃንና እርጥበት ይጠብቁት።\n• ቆዳው ዕድሜው እየጨመረ ሲሄድ ውበቱና ጥራቱ (Patina) ይጨምራል።`
        : `Leather Provenance & Care Guide:\n\n• Sourced exclusively from uncorrected full-grain Ethiopian Highland cattle hides, celebrated globally for fiber tensile strength.\n• Edges are beveled and sealed with organic Ethiopian mountain beeswax.\n• Care: Condition every 6 months with natural beeswax or lanolin leather balm. Wipe gently with dry microfiber.\n• Full-grain leather naturally develops a lustrous, rich patina over decades of use.`;

      await db.saveAiConversation(sessionId, cleanMsg, reply, isAmharic ? 'am' : 'en');
      return {
        reply,
        suggestions: isAmharic ? ['ቀበቶዎችን አሳይ', 'የግል ፊደል ቅርጽ'] : ['Explore Belts', 'Bespoke Monogramming']
      };
    }

    // 16. Bespoke Monogramming
    if (lower.includes('monogram') || lower.includes('custom') || lower.includes('ፊደል') || lower.includes('ልዩ ንድፍ') || lower.includes('bespoke')) {
      const reply = isAmharic
        ? `በ "የግል ማበጃ ስቱዲዮ (Bespoke Studio)" በኩል በማንኛውም የኪሩ ቆዳ እቃ ላይ የስምዎን የመጀመሪያ ፊደላት በ24 ኪሎ ወርቅ (24K Gold Foil)፣ በብር (Silver Foil) ወይም በሙቀት ብቻ (Blind Deboss) በነፃ ማሳተም ይችላሉ!`
        : `Our Bespoke Studio allows complimentary custom monogramming on any purchase! Choose from 24K Gold Foil, Brushed Silver, or Blind Heat Deboss, plus personalized sizing adjustments for jackets and footwear.`;

      await db.saveAiConversation(sessionId, cleanMsg, reply, isAmharic ? 'am' : 'en');
      return {
        reply,
        action: 'open_bespoke',
        suggestions: isAmharic ? ['ቀበቶዎችን አሳይ', 'የአቴሊየሩ አድራሻ'] : ['Explore Belts', 'Atelier Address']
      };
    }

    // 17. Greetings / Conversational / Who are you
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey') || lower.includes('selam') || lower.includes('ሰላም') || lower.includes('ጤና') || lower.includes('እንደምን') || lower.includes('እንዴት') || lower.includes('ማን ነህ') || lower.includes('who are you') || lower.includes('help') || lower.includes('እርዳኝ') || lower.includes('አግዘኝ')) {
      const reply = isAmharic
        ? `ሰላም! እንኳን ወደ ኪሩ ሌዘር አቴሊየር በደህና መጡ። እኔ የኪሩ አርቴፊሻል ኢንተለጀንስ ረዳት (Master AI Concierge) ነኝ። ✨\n\nዛሬ በምን ላገልግልዎት? የሚከተሉትን መጠየቅ ይችላሉ፦\n• 🎗️ ስለ አዲሶቹ የቆዳ ቀበቶዎቻችን (Luxury Belts)\n• 🧥 ስለ ጃኬቶችና መጠናቸው (Sizing)\n• 📦 የትዕዛዝ ቁጥርዎን በመስጠት ሁኔታውን ለመከታተል\n• 📍 የአቴሊየራችንን አድራሻና ስልክ ለማወቅ\n• 💳 ስለ ክፍያ አማራጮች (Telebirr / Chapa)`
        : `Warm greetings! Welcome to Kiru Leathers Atelier. I am your Master AI Concierge. ✨\n\nHow may I assist you today? You can ask me about:\n• 🎗️ Our luxury belts & straps collection\n• 🧥 Handcrafted jackets, sizing & fits\n• 📦 Real-time order tracking with your Order ID\n• 📍 Flagship atelier location & contact numbers\n• 💳 Telebirr, Chapa & bank transfer payment options`;

      await db.saveAiConversation(sessionId, cleanMsg, reply, isAmharic ? 'am' : 'en');
      return {
        reply,
        suggestions: isAmharic
          ? ['ቀበቶዎችን አሳይ', 'የትዕዛዝ ክትትል', 'የእቃዎች ዋጋ ስንት ነው?', 'የአቴሊየሩ አድራሻ']
          : ['Luxury Belts & Straps', 'Track My Order', 'Product Prices', 'Atelier Address']
      };
    }

    // Default friendly response
    const reply = isAmharic
      ? `እንኳን ወደ ኪሩ ሌዘር አቴሊየር በደህና መጡ! እኔ የኪሩ አርቴፊሻል ኢንተለጀንስ ረዳት (AI Concierge) ነኝ።\n\nስለ ምርቶቻችን (ቀበቶዎች፣ ጃኬቶች፣ ቦርሳዎች፣ ጫማዎች)፣ የትዕዛዝ ክትትል፣ የክፍያ አማራጮች ወይም የግል ፊደል ማሳተም ማንኛውንም ጥያቄ መጠየቅ ይችላሉ።`
      : `Welcome to Kiru Leathers Atelier. I am your Master AI Concierge.\n\nI can assist you with product inquiries (luxury belts, jackets, luggage, boots), order status tracking, Chapa/Telebirr payments, or bespoke monogramming. How may I serve you today?`;

    const suggestions = isAmharic
      ? ['የቀበቶዎች ስብስብ (Belts)', 'የትዕዛዝ ክትትል', 'የአቴሊየሩ አድራሻ', 'የክፍያ አማራጮች']
      : ['Luxury Belts & Straps', 'Track My Order', 'Atelier Address', 'Payment Options'];

    await db.saveAiConversation(sessionId, cleanMsg, reply, isAmharic ? 'am' : 'en');
    return { reply, suggestions };
  }
}

module.exports = new AiConciergeService();
