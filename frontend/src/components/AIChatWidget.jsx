import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, X, Minus, Send, Leaf, ExternalLink, ChevronDown } from 'lucide-react';
import { API_BASE } from '../utils/api';
import './AIChatWidget.css';

// ── Suggested prompts ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: '💻', text: 'Show me laptops' },
  { icon: '📱', text: 'Find budget phones' },
  { icon: '🏷️', text: 'Help me sell an item' },
  { icon: '🌱', text: 'Explain sustainable shopping' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatText = (text) =>
  text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/→ (.+)/g, '<span class="ai-reply-chip">→ $1</span>')
    .replace(/\n/g, '<br/>');

// ── Sub-components ────────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="ai-msg-row assistant">
    <div className="ai-msg-avatar">🤖</div>
    <div className="ai-typing-dots"><span /><span /><span /></div>
  </div>
);

const ProductCard = ({ item }) => {
  const navigate = useNavigate();
  return (
    <div
      className="ai-product-card"
      onClick={() => navigate(`/items/${item._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/items/${item._id}`)}
    >
      <div className="ai-product-img">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.name} />
          : <span>📦</span>}
      </div>
      <div className="ai-product-info">
        <div className="ai-product-name">{item.name}</div>
        <div className="ai-product-price">₹{item.price?.toLocaleString('en-IN')}</div>
        <span className="ai-product-cat">{item.category}</span>
      </div>
      <div className="ai-product-arrow"><ExternalLink size={13} /></div>
    </div>
  );
};

const Message = ({ msg }) => (
  <div className={`ai-msg-row ${msg.role}`}>
    {msg.role === 'assistant' && <div className="ai-msg-avatar">🤖</div>}
    <div className="ai-msg-bubble">
      <div
        className="ai-msg-text"
        dangerouslySetInnerHTML={{ __html: formatText(msg.content) }}
      />
      {msg.listings?.length > 0 && (
        <div className="ai-products-list">
          {msg.listings.map((item) => (
            <ProductCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  </div>
);

// ── Main Widget ───────────────────────────────────────────────────────────────
export default function AIChatWidget() {
  const location = useLocation();
  const [isOpen,      setIsOpen]      = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [isTyping,    setIsTyping]    = useState(false);
  const [unread,      setUnread]      = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // Send greeting on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content:
          "Hi! I'm **Loopify AI** 🌿\n\n" +
          "I can help you discover products, draft seller messages, suggest replies, and answer questions about the marketplace. What can I help you with?",
        listings: [],
      }]);
    }
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Build page context from URL
  const getContext = useCallback(() => {
    const match = location.pathname.match(/\/items\/([a-f0-9]{24})/i);
    if (match) return { itemId: match[1], page: 'itemDetails' };
    return { page: location.pathname };
  }, [location.pathname]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (override) => {
    const text = (override ?? input).trim();
    if (!text || isTyping) return;

    const userMsg  = { role: 'user', content: text };
    const history  = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await axios.post(`${API_BASE}/ai/chat`, {
        messages: history.map(({ role, content }) => ({ role, content })),
        context:  getContext(),
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, listings: data.listings || [] },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I hit a snag! Please try again in a moment. 🙏',
          listings: [],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [input, messages, isTyping, getContext]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const toggleOpen = () => { setIsOpen((o) => !o); setIsMinimized(false); };

  const showSuggestions = messages.length <= 1 && !isTyping;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="ai-widget-root">

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div className={`ai-panel${isMinimized ? ' minimized' : ''}`}>

          {/* Header */}
          <div className="ai-panel-header">
            <div className="ai-header-brand">
              <div className="ai-header-icon"><Sparkles size={15} /></div>
              <div>
                <div className="ai-header-title">Loopify AI</div>
                {!isMinimized && (
                  <div className="ai-header-sub">AI-Powered Marketplace Assistant</div>
                )}
              </div>
              {!isMinimized && <div className="ai-header-online" title="Online" />}
            </div>
            <div className="ai-header-actions">
              <button
                className="ai-header-btn"
                onClick={() => setIsMinimized((m) => !m)}
                aria-label={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <ChevronDown size={14} /> : <Minus size={14} />}
              </button>
              <button
                className="ai-header-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="ai-messages">
                {messages.map((msg, i) => <Message key={i} msg={msg} />)}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested prompts */}
              {showSuggestions && (
                <div className="ai-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.text}
                      className="ai-suggestion-chip"
                      onClick={() => sendMessage(s.text)}
                    >
                      {s.icon} {s.text}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="ai-input-row">
                <textarea
                  ref={inputRef}
                  className="ai-input"
                  placeholder="Ask me anything about products, listings, sellers, or sustainability..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button
                  className="ai-send-btn"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </div>

              {/* Footer */}
              <div className="ai-footer">
                <Leaf size={11} />
                Powered by Gemini AI · Supporting sustainable commerce
              </div>
            </>
          )}
        </div>
      )}

      {/* ── FAB ── */}
      <button className="ai-fab" onClick={toggleOpen} aria-label="Open Loopify AI assistant">
        {isOpen ? <X size={21} /> : <Sparkles size={21} />}
        {!isOpen && <span className="ai-fab-pulse" />}
        {!isOpen && unread > 0 && <span className="ai-fab-badge">{unread}</span>}
      </button>

    </div>
  );
}
