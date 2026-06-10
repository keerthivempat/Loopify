// Purpose: Provider-agnostic LLM service layer
// Switch AI_PROVIDER in .env to: gemini | openai | claude
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

const PROVIDER = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

const buildSystemPrompt = (listings = []) => {
  const inv = listings.length
    ? listings.map(l => `- [ID:${l._id}] ${l.name} | ₹${l.price} | ${l.category} | ${l.description?.slice(0, 80) || ''}`).join('\n')
    : 'No items currently listed.';

  return `You are Loopify AI 🌿, an intelligent assistant for Loopify — an AI-Powered Sustainable Marketplace for buying and selling pre-owned products.

## Capabilities
1. Natural-language product discovery from the live inventory below
2. Platform navigation help
3. Draft buyer inquiry messages (polite, professional)
4. Suggest 2-3 short seller reply options prefixed with "→"
5. Promote sustainable / eco-friendly shopping

## Platform Features
- Browse Listings: view available items
- My Listings: manage your own listings
- Wishlist: save items for later
- Orders: purchase history
- Seller Inquiries: contact sellers or manage buyer inquiries
- Profile: account settings
- Sell (+): create a new listing

## Item Categories
Electronics, Books, Clothing, Furniture, Stationery, Sports, Miscellaneous

## Live Marketplace Inventory
${inv}

## Sustainability Snippets (weave in naturally, don't force)
- "Buying pre-owned reduces waste and extends product lifecycles."
- "Each second-hand purchase saves CO₂ vs. manufacturing new."
- "Loopify supports a circular economy."

## Response Rules
- Reference ONLY items from the inventory above; include exact names & prices in ₹
- Keep answers concise and friendly (under 120 words unless drafting a message)
- For inquiry drafts: one polished paragraph
- For seller replies: list options with →
- Never invent products not in the inventory`;
};

// ── Gemini — try multiple models, cheapest/fastest first ─────────────────────
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-flash',
];

const chatWithGemini = async (messages, listings) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const systemInstruction = buildSystemPrompt(listings);

  // Build history — exclude the last message (sent separately) and any
  // leading assistant turns (Gemini requires history to start with 'user')
  const historyRaw = messages.slice(0, -1)
    .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));

  // Drop messages before the first user turn
  const firstUserIdx = historyRaw.findIndex(m => m.role === 'user');
  const history = firstUserIdx >= 0 ? historyRaw.slice(firstUserIdx) : [];

  const lastContent = messages[messages.length - 1].content;

  let lastErr;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
      const chatSession = model.startChat({ history });
      const result = await chatSession.sendMessage(lastContent);
      return result.response.text();
    } catch (err) {
      lastErr = err;
      if (/429|quota|rate.?limit|503|overload|unavailable|high demand/i.test(err.message)) {
        console.warn(`[AI] ${modelName} unavailable, trying next…`);
        continue; // try next model
      }
      // History format error — re-throw with clear message so controller can catch it
      if (/first content|role.*user|got model/i.test(err.message)) {
        throw err;
      }
      throw err; // non-quota error — fail fast
    }
  }
  throw lastErr; // all models exhausted
};

// ── OpenAI ────────────────────────────────────────────────────────────────────
const chatWithOpenAI = async (messages, listings) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: buildSystemPrompt(listings) },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.7,
    max_tokens: 500,
  });
  return res.choices[0].message.content;
};

// ── Claude stub ───────────────────────────────────────────────────────────────
const chatWithClaude = async () => {
  throw new Error('Claude provider: install @anthropic-ai/sdk and set ANTHROPIC_API_KEY');
};

// ── Public entry point ────────────────────────────────────────────────────────
const chat = async (messages, listings = []) => {
  if (PROVIDER === 'openai') return chatWithOpenAI(messages, listings);
  if (PROVIDER === 'claude') return chatWithClaude(messages, listings);
  return chatWithGemini(messages, listings); // default
};

module.exports = { chat };
