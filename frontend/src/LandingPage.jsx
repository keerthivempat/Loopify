import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Tag, Heart, MessageCircle,
  ArrowRight, ChevronDown, Package, Users, Repeat2,
  Star, TrendingUp, Recycle,
} from 'lucide-react';
import logo from './assets/logo.png';
import './LandingPage.css';

/* ── animated counter hook ── */
const useCounter = (target, duration = 1800, started = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, started]);
  return count;
};

/* ── feature cards data ── */
const features = [
  {
    icon: Search,
    title: 'Browse Listings',
    desc: 'Explore thousands of quality pre-owned items across every category — electronics, books, fashion, and more.',
    color: '#FEF3EE',
    accent: '#C2410C',
  },
  {
    icon: Tag,
    title: 'Create Listings',
    desc: 'List your unused items in minutes. Add photos, set a price, and reach buyers in your community instantly.',
    color: '#FFF7ED',
    accent: '#D97706',
  },
  {
    icon: Heart,
    title: 'Wishlist Favorites',
    desc: 'Save items you love to your wishlist and come back to them anytime — never miss a great deal.',
    color: '#FEF2F2',
    accent: '#DC2626',
  },
  {
    icon: MessageCircle,
    title: 'Contact Sellers',
    desc: 'Send inquiries directly to sellers, negotiate prices, and arrange handovers — all within the platform.',
    color: '#EFF6FF',
    accent: '#1D4ED8',
  },
];

/* ── how it works steps ── */
const steps = [
  { n: '01', title: 'Create an Account', desc: 'Sign up for free in under a minute.' },
  { n: '02', title: 'Browse or List',     desc: 'Find what you need or sell what you don\'t.' },
  { n: '03', title: 'Connect & Deal',     desc: 'Message the seller and agree on terms.' },
  { n: '04', title: 'Trusted Handover',    desc: 'Seller accepts your inquiry, shares contact details, and you complete the exchange.' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const statsRef  = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [liveStats, setLiveStats] = useState({ listings: 0, users: 0, wishlistSavers: 0 });

  /* redirect already-authenticated users */
  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/browse-listings', { replace: true });
  }, [navigate]);

  /* fetch live stats from public endpoint */
  useEffect(() => {
    fetch('http://localhost:5000/api/stats')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setLiveStats({
        listings:       data.listings      ?? 0,
        users:          data.users         ?? 0,
        wishlistSavers: data.wishlistSavers ?? 0,
      }))
      .catch(() => {/* keep zeros on failure — page still renders fine */});
  }, []);

  /* trigger stat counters when section scrolls into view */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 },
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const listings  = useCounter(liveStats.listings,       1600, statsVisible);
  const users     = useCounter(liveStats.users,          1600, statsVisible);
  const exchanges = useCounter(liveStats.wishlistSavers, 1800, statsVisible);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="lp-landing">

      {/* ══════════════════ NAVBAR ══════════════════ */}
      <header className="lp-land-nav">
        <div className="lp-land-nav-inner">
          <img src={logo} alt="Loopify" className="lp-land-nav-logo" />
          <nav className="lp-land-nav-links">
            <a href="#features" className="lp-land-nav-link">Features</a>
            <a href="#how"      className="lp-land-nav-link">How it works</a>
            <a href="#stats"    className="lp-land-nav-link">Stats</a>
          </nav>
          <div className="lp-land-nav-cta">
            <button className="lp-land-btn-ghost" onClick={() => navigate('/login')}>Log in</button>
            <button className="lp-land-btn-primary" onClick={() => navigate('/register')}>Sign up free</button>
          </div>
          {/* mobile — just show the two CTAs */}
          <div className="lp-land-nav-mobile">
            <button className="lp-land-btn-ghost sm" onClick={() => navigate('/login')}>Log in</button>
            <button className="lp-land-btn-primary sm" onClick={() => navigate('/register')}>Sign up</button>
          </div>
        </div>
      </header>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="lp-hero">
        <div className="lp-hero-inner">

          {/* left copy */}
          <div className="lp-hero-copy">

            {/* ── Brand identity block ── */}
            <div className="lp-hero-brand">
              <img src={logo} alt="Loopify" className="lp-hero-brand-logo" />
              <span className="lp-hero-brand-name">LOOPIFY</span>
            </div>

            {/* ── Trust badge ── */}
            <div className="lp-hero-eyebrow">
              <Recycle size={14} />
              <span>India's Sustainable Second-Hand Marketplace</span>
            </div>

            <h1 className="lp-hero-heading">
              Buy.<br />
              Sell.<br />
              <span className="lp-hero-accent">Reuse. Sustain.</span>
            </h1>
            <p className="lp-hero-sub">
              Discover quality pre-owned items or give your unused products a second life.
              Join a community that cares about both value and the environment.
            </p>
            <div className="lp-hero-actions">
              <button className="lp-land-btn-primary lg" onClick={() => navigate('/register')}>
                Get Started <ArrowRight size={17} />
              </button>
              <button className="lp-land-btn-ghost lg" onClick={() => navigate('/login')}>
                Log In
              </button>
            </div>
            <div className="lp-hero-trust">
              {['Free to join', 'No listing fees', 'Safe exchanges'].map(t => (
                <span key={t} className="lp-hero-trust-item">
                  <Star size={12} fill="currentColor" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* right illustration */}
          <div className="lp-hero-visual">
            {/* faded watermark behind everything */}
            <img src={logo} alt="" aria-hidden="true" className="lp-hero-watermark" />

            <div className="lp-hero-blob" />

            {/* centre card */}
            <div className="lp-hero-card main-card">
              <div className="lp-hero-card-icon">
                <Package size={36} strokeWidth={1.5} />
              </div>
              <div className="lp-hero-card-text">
                <span className="lp-hc-label">Featured Listing</span>
                <span className="lp-hc-title">Pre-owned Electronics</span>
                <span className="lp-hc-price">Starting ₹499</span>
              </div>
              <div className="lp-hc-badge">Browse Now</div>
            </div>

            {/* floating chips */}
            <div className="lp-float-chip chip-tl">
              <Repeat2 size={15} /> {liveStats.listings > 0 ? `${liveStats.listings}+ listings` : 'Live listings'}
            </div>
            <div className="lp-float-chip chip-br">
              <TrendingUp size={15} /> {liveStats.users > 0 ? `${liveStats.users}+ members` : 'Growing community'}
            </div>

            {/* orbit ring */}
            <div className="lp-orbit">
              <div className="lp-orbit-dot" style={{ '--deg': '0deg' }} />
              <div className="lp-orbit-dot" style={{ '--deg': '120deg' }} />
              <div className="lp-orbit-dot" style={{ '--deg': '240deg' }} />
            </div>
          </div>
        </div>

        {/* scroll cue */}
        <button className="lp-scroll-cue" onClick={scrollToFeatures} aria-label="Scroll down">
          <ChevronDown size={22} />
        </button>
      </section>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section id="features" className="lp-section lp-features-section">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <span className="lp-pill">Everything you need</span>
            <h2 className="lp-section-title">A complete marketplace experience</h2>
            <p className="lp-section-sub">
              From discovering deals to safely completing exchanges — Loopify has you covered.
            </p>
          </div>

          <div className="lp-features-grid">
            {features.map(({ icon: Icon, title, desc, color, accent }) => (
              <div
                key={title}
                className="lp-feature-card"
                style={{ '--fc-bg': color, '--fc-accent': accent }}
              >
                <div className="lp-fc-icon-wrap">
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <h3 className="lp-fc-title">{title}</h3>
                <p className="lp-fc-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section id="how" className="lp-section lp-how-section">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <span className="lp-pill">Simple process</span>
            <h2 className="lp-section-title">How Loopify works</h2>
            <p className="lp-section-sub">Four easy steps from sign-up to successful exchange.</p>
          </div>

          <div className="lp-steps-grid">
            {steps.map(({ n, title, desc }, idx) => (
              <div key={n} className="lp-step">
                <div className="lp-step-num">{n}</div>
                {idx < steps.length - 1 && <div className="lp-step-connector" />}
                <h3 className="lp-step-title">{title}</h3>
                <p className="lp-step-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ STATS ══════════════════ */}
      <section id="stats" className="lp-section lp-stats-section" ref={statsRef}>
        <div className="lp-section-inner">
          <div className="lp-stats-grid">
            <div className="lp-stat-block">
              <span className="lp-stat-num">{listings.toLocaleString()}+</span>
              <span className="lp-stat-label">Active Listings</span>
              <span className="lp-stat-sub">Across all categories</span>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat-block">
              <span className="lp-stat-num">{users.toLocaleString()}+</span>
              <span className="lp-stat-label">Registered Users</span>
              <span className="lp-stat-sub">And growing daily</span>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat-block">
              <span className="lp-stat-num">{exchanges.toLocaleString()}+</span>
              <span className="lp-stat-label">Wishlist Savers</span>
              <span className="lp-stat-sub">Items people love</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section className="lp-section lp-cta-section">
        <div className="lp-cta-card">
          <div className="lp-cta-glow" />
          <div className="lp-cta-content">
            <span className="lp-pill light">Join the community</span>
            <h2 className="lp-cta-heading">Ready to join the Loop?</h2>
            <p className="lp-cta-sub">
              List your first item for free, or start discovering great deals today.
              No fees, no fuss — just a smarter way to buy and sell.
            </p>
            <div className="lp-cta-actions">
              <button className="lp-cta-btn-primary" onClick={() => navigate('/register')}>
                Start Selling Today <ArrowRight size={17} />
              </button>
              <button className="lp-cta-btn-ghost" onClick={() => navigate('/login')}>
                I already have an account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <img src={logo} alt="Loopify" className="lp-footer-logo" />
            <p className="lp-footer-tagline">Buy. Sell. Reuse. Sustain.</p>
          </div>

          <div className="lp-footer-links">
            <div className="lp-footer-col">
              <h4>Marketplace</h4>
              <button onClick={() => navigate('/register')}>Browse Listings</button>
              <button onClick={() => navigate('/register')}>Sell an Item</button>
              <button onClick={() => navigate('/register')}>Wishlist</button>
            </div>
            <div className="lp-footer-col">
              <h4>Account</h4>
              <button onClick={() => navigate('/login')}>Log In</button>
              <button onClick={() => navigate('/register')}>Sign Up</button>
            </div>
            <div className="lp-footer-col">
              <h4>Company</h4>
              <span>About</span>
              <span>Contact</span>
              <span>Privacy</span>
            </div>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <p>© {new Date().getFullYear()} Loopify. All rights reserved.</p>
          <p>Made with ♥ for sustainable communities.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
