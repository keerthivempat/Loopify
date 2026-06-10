// Purpose: AI chat controller — fetches live listings, calls LLM, falls back to
// smart rule-based responses when the LLM API is unavailable / quota-exhausted.
const Item = require('../models/Item');
const { chat } = require('../services/aiService');

// ── Keyword extractor ─────────────────────────────────────────────────────────
const extractKeywords = (text) =>
  text
    .toLowerCase()
    .replace(/[₹\d,]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 6);

const PRODUCT_INTENT_RE =
  /laptop|phone|mobile|book|cloth|furnit|electron|sport|gaming|camera|tablet|watch|headphone|earphone|cycle|bag|show me|find|search|looking for|need a|want a|buy|under ₹|budget|cheap|affordable|available|gift|gadget|accessories/i;

const HELP_INTENT_RE =
  /how (do|can|to)|what is|wishlist|creat|listing|sell|order|contact|seller|inquiry|profile|account|register|sign|log/i;

const SUSTAINABILITY_RE =
  /sustainab|eco|green|environment|waste|recycl|second.?hand|pre.?owned|circular/i;

const INQUIRY_INTENT_RE =
  /inquiry|inquir|contact|message|reach|interested in|want to buy|purchase/i;

const SELLER_REPLY_RE =
  /reply|respond|answer|seller.*response|what.*say/i;

// ── Smart DB search ───────────────────────────────────────────────────────────
const searchListings = async (text, limit = 4) => {
  const kws = extractKeywords(text);

  const orClauses = kws.flatMap((kw) => [
    { name: { $regex: kw, $options: 'i' } },
    { description: { $regex: kw, $options: 'i' } },
    { category: { $regex: kw, $options: 'i' } },
  ]);

  const baseFilter = { $or: [{ status: 'available' }, { status: { $exists: false } }] };
  const query = { ...baseFilter, ...(orClauses.length ? { $or: orClauses } : {}) };

  // Price filter: "under ₹30000"
  const priceMatch = text.match(/(?:under|below|less than)\s*[₹rs]?\s*(\d[\d,]*)/i);
  if (priceMatch) {
    query.price = { $lte: parseInt(priceMatch[1].replace(/,/g, ''), 10) };
  }

  return Item.find(query)
    .select('name price category imageUrl _id')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// ── Rule-based fallback (no LLM needed) ──────────────────────────────────────
const ruleBasedReply = async (userText, listings) => {
  if (SUSTAINABILITY_RE.test(userText)) {
    return {
      reply:
        '🌿 **Sustainable Shopping on Loopify**\n\n' +
        'Every pre-owned purchase on Loopify:\n' +
        '• Reduces electronic & consumer waste\n' +
        '• Extends product lifecycles\n' +
        '• Saves CO₂ vs. manufacturing new\n' +
        '• Supports a circular economy\n\n' +
        'You\'re making a real difference by choosing second-hand! 🌍',
      listings: [],
    };
  }

  if (INQUIRY_INTENT_RE.test(userText)) {
    return {
      reply:
        '✉️ **Contacting a Seller**\n\n' +
        'Here\'s a ready-to-use inquiry message:\n\n' +
        '*"Hello! I\'m interested in your listing. Could you please confirm if the item is still available? ' +
        'I\'d love to discuss the details. Thank you!"*\n\n' +
        'You can copy this and edit it before sending via the **Contact Seller** button on the item page.',
      listings: [],
    };
  }

  if (SELLER_REPLY_RE.test(userText)) {
    return {
      reply:
        '💬 **Suggested Seller Replies:**\n\n' +
        '→ Yes, the item is still available! Feel free to ask any questions.\n' +
        '→ Yes, it\'s available. You can contact me to arrange pickup/delivery.\n' +
        '→ Sorry, this item has just been sold. Check my other listings!',
      listings: [],
    };
  }

  if (HELP_INTENT_RE.test(userText)) {
    const topic = userText.toLowerCase();
    if (/wishlist/.test(topic)) {
      return { reply: '❤️ **Wishlist**: Click the heart icon on any listing to save it. View your saved items under **Wishlist** in the navigation.', listings: [] };
    }
    if (/creat|sell|listing/.test(topic)) {
      return { reply: '🏷️ **Creating a Listing**: Click the **Sell (+)** button in the navbar → fill in the title, description, price, category, and upload photos → Submit!', listings: [] };
    }
    if (/order/.test(topic)) {
      return { reply: '📦 **Orders**: View your purchase history under **Orders** in the navigation. Each order shows status, item details, and seller contact info.', listings: [] };
    }
    if (/contact|seller|inquiry/.test(topic)) {
      return { reply: '📨 **Contacting Sellers**: Open any item → click **Contact Seller** → fill in your message. The seller will receive your inquiry and can accept or reply.', listings: [] };
    }
    if (/profile|account/.test(topic)) {
      return { reply: '👤 **Profile**: Click your avatar (top right) → Profile. Update your name, email, and other details there.', listings: [] };
    }
    return {
      reply:
        '🛍️ **Loopify Features:**\n\n' +
        '• **Browse** — explore all available listings\n' +
        '• **Sell (+)** — create a new listing\n' +
        '• **Wishlist** — save items you like\n' +
        '• **Orders** — track your purchases\n' +
        '• **Inquiries** — contact sellers or manage buyer messages\n' +
        '• **Profile** — manage your account\n\n' +
        'What would you like help with?',
      listings: [],
    };
  }

  if (PRODUCT_INTENT_RE.test(userText) && listings.length) {
    const count = listings.length;
    return {
      reply:
        `🔍 Found **${count} matching item${count !== 1 ? 's' : ''}** for you!\n\n` +
        '🌿 *Buying pre-owned saves CO₂ and extends product lifecycles.*',
      listings,
    };
  }

  if (PRODUCT_INTENT_RE.test(userText) && !listings.length) {
    return {
      reply:
        "😕 No matching items found right now.\n\n" +
        "Try browsing all listings or check back soon — new items are added regularly! 🌿",
      listings: [],
    };
  }

  return {
    reply:
      "Hi! I'm **Loopify AI** 🌿\n\n" +
      "I can help you:\n" +
      "• 🔍 Discover products — *\"Show me laptops\"*\n" +
      "• ✉️ Draft seller inquiries — *\"I want to buy this item\"*\n" +
      "• 💬 Suggest seller replies\n" +
      "• ❓ Answer platform questions\n" +
      "• 🌱 Share sustainability tips\n\n" +
      "What can I help you with?",
    listings: [],
  };
};

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────
const aiChat = async (req, res, next) => {
  try {
    const { messages = [], context = {} } = req.body;
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ message: 'messages array is required' });
    }

    const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

    // ── Fetch live listings ───────────────────────────────────────────────────
    const allListings = await Item.find({
      $or: [{ status: 'available' }, { status: { $exists: false } }],
    })
      .select('name price category description imageUrl _id')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // ── Search matching cards ─────────────────────────────────────────────────
    let matchedCards = [];
    if (PRODUCT_INTENT_RE.test(lastUser)) {
      matchedCards = await searchListings(lastUser, 4);
    }

    // ── Try LLM first, fall back to rule-based ────────────────────────────────
    try {
      const llmReply = await chat(messages, allListings);
      return res.json({ reply: llmReply, listings: matchedCards });
    } catch (llmErr) {
      const errMsg = llmErr.message || '';
      const isQuota = /429|quota|rate.?limit/i.test(errMsg);
      const isModel = /404|not found for API/i.test(errMsg);

      const isKeyError = /api.?key|unauthorized|permission|invalid|403|400/i.test(errMsg);
      const isHistoryError = /first content|role.*user|got model/i.test(errMsg);

      if (isQuota || isModel || isKeyError || isHistoryError) {
        // Degrade gracefully to rule-based
        console.warn('[AI] LLM unavailable, using rule-based fallback:', errMsg.slice(0, 120));
        const fallback = await ruleBasedReply(lastUser, matchedCards);
        return res.json(fallback);
      }
      throw llmErr; // unexpected error — bubble up
    }
  } catch (err) {
    console.error('[AI] chat error:', err.message);
    // Last-resort graceful message
    return res.json({
      reply:
        "I'm having trouble connecting right now. 🙏\n\n" +
        'You can still browse listings, manage your wishlist, and contact sellers directly!',
      listings: [],
    });
  }
};

module.exports = { aiChat };
