
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import logo2 from "../assets/logo2.png";
import logo3 from "../assets/logo3.png";
import "./LandingPage.css";


const COIN_META = {
  bitcoin: { symbol: "BTC", name: "Bitcoin", color: "#F7931A", icon: "currency_bitcoin" },
  ethereum: { symbol: "ETH", name: "Ethereum", color: "#627EEA", icon: "diamond" },
  solana: { symbol: "SOL", name: "Solana", color: "#14F195", icon: "bolt" },
  dogecoin: { symbol: "DOGE", name: "Dogecoin", color: "#C2A633", icon: "pets" },
};

function buildSparklinePath(prices) {
  if (!prices || prices.length < 2) return "M0,20 L100,20";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const step = 100 / (prices.length - 1);
  return prices
    .map((p, i) => {
      const x = i * step;
      const y = 38 - ((p - min) / range) * 36;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function useLiveCoins(pollMs = 30000) {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchCoins() {
      try {
        const ids = Object.keys(COIN_META).join(",");
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true&price_change_percentage=24h`
        );
        const data = await res.json();

        const mapped = data.map((c) => {
          const meta = COIN_META[c.id];
          const changePct = c.price_change_percentage_24h ?? 0;
          return {
            symbol: meta.symbol,
            name: meta.name,
            color: meta.color,
            icon: meta.icon,
            price: `$${c.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
            change: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`,
            up: changePct >= 0,
            path: buildSparklinePath(c.sparkline_in_7d?.price?.slice(-24)),
          };
        });

        if (isMounted) setCoins(mapped);
      } catch (err) {
        console.error("Failed to fetch live coin data:", err);
      }
    }

    fetchCoins();
    const interval = setInterval(fetchCoins, pollMs);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pollMs]);

  return coins;
}
export default function LandingPage() {
  const navigate = useNavigate();
  const marketsRef = useRef(null);

  const goLogin = () => navigate("/login");
  const goRegister = () => navigate("/register");
  const scrollToMarkets = () => marketsRef.current?.scrollIntoView({ behavior: "smooth" });

  const coins = useLiveCoins(30000);
  // const coins = [
  //   { symbol: "BTC", name: "Bitcoin", price: "$64,120.40", change: "+2.45%", up: true, color: "#F7931A", icon: "currency_bitcoin", path: "M0,35 Q20,30 40,32 T60,20 T80,25 T100,5" },
  //   { symbol: "ETH", name: "Ethereum", price: "$3,421.15", change: "-1.12%", up: false, color: "#627EEA", icon: "diamond", path: "M0,10 Q20,15 40,12 T60,30 T80,28 T100,35" },
  //   { symbol: "SOL", name: "Solana", price: "$145.82", change: "+8.12%", up: true, color: "#14F195", icon: "bolt", path: "M0,38 Q20,35 40,30 T60,15 T80,10 T100,2" },
  //   { symbol: "DOGE", name: "Dogecoin", price: "$0.162", change: "+0.54%", up: true, color: "#C2A633", icon: "pets", path: "M0,20 Q20,22 40,18 T60,25 T80,20 T100,22" },
  // ];

  
  
  const features = [
    { icon: "verified_user", title: "Secure Authentication", desc: "Military-grade encryption and 2FA ensures your portfolio remains your business only." },
    { icon: "query_stats", title: "Real-Time Tracking", desc: "Low-latency data synchronization across 100+ exchanges for precise valuations." },
    { icon: "insights", title: "Advanced Analytics", desc: "Heatmaps, correlation matrices, and predictive modeling for data-driven growth." },
    { icon: "account_balance_wallet", title: "Multi-Portfolio", desc: "Segment your assets into distinct tax-aware buckets for optimized management." },
  ];

  const steps = [
    { title: "Create Your Account", desc: "Register in seconds with our secure on-boarding process." },
    { title: "Connect Your Assets", desc: "Link wallets via API or manual entry with read-only permissions." },
    { title: "Analyze Performance", desc: "Get deep insights into your risk/reward ratio and asset distribution." },
    { title: "Execute & Grow", desc: "Use intelligent signals to rebalance and maximize your returns." },
  ];

  return (
    <div className="alphafox-landing font-body-md">
      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b border-white/10" style={{ boxShadow: "0 0 20px rgba(255,107,0,0.1)" }}>
        <div className="flex justify-between items-center px-margin-desktop py-4 max-w-container-max mx-auto">
          <div className="flex items-center gap-3 ">
            <img src={logo} alt="AlphaFox logo" className="h-11 w-auto scale-160 mb-2 " />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-secondary font-bold border-b-2 border-secondary pb-1 font-label-md text-label-md" href="#">Features</a>
            <a className="text-on-surface-variant font-medium hover:text-secondary transition-colors duration-300 font-label-md text-label-md" href="#" onClick={(e) => { e.preventDefault(); scrollToMarkets(); }}>Markets</a>
            <a className="text-on-surface-variant font-medium hover:text-secondary transition-colors duration-300 font-label-md text-label-md" href="#">Analytics</a>
            <a className="text-on-surface-variant font-medium hover:text-secondary transition-colors duration-300 font-label-md text-label-md" href="#">About</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={goLogin} className="hidden sm:block text-on-surface font-medium hover:text-secondary transition-colors font-label-md text-label-md">Login</button>
            <button onClick={goRegister} className="bg-primary-container text-on-primary font-bold px-6 py-2 rounded active:scale-95 duration-200 transition-transform font-label-md text-label-md" style={{ boxShadow: "0 0 15px rgba(255,107,0,0.3)" }}>Get Started</button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
       <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center pt-30 pb-20 -ml-116 overflow-hidden hero-bg-glow hero-grid-bg">
          <div className="absolute inset-y-0 left-1/2 w-[680px] -translate-x-1/2 bg-primary-container/10 blur-3xl opacity-35 pointer-events-none"></div>
          <div className="relative z-10 w-full px-margin-desktop max-w-container-max mx-auto">
            <div className=" md:px-12 md:py-12 text-center fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="pulse-dot"></div>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Live Market Intelligence</span>
              </div>
              <h1 className="font-display-lg text-display-lg text-white mb-4 leading-[0.95] mx-auto max-w-[720px] hero-title">
                Track, Analyze &amp; <span className="text-primary-container">Grow</span> Your Crypto Wealth.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-6 mx-auto max-w-[640px] hero-copy">
                Manage all your cryptocurrency investments in one secure platform with real-time market insights, intelligent portfolio analytics, and a calmer way to stay ahead.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <button onClick={goRegister} className="bg-primary-container text-on-primary px-8 py-3.5 rounded-lg font-bold text-base transition-all" style={{ transition: "box-shadow .3s" }}>Get Started</button>
                <button onClick={scrollToMarkets} className="glass-panel text-white border border-white/10 px-8 py-3.5 rounded-lg font-bold text-base hover:bg-white/5 transition-all">Explore Markets</button>
              </div>
            </div>
          </div>
        </section>

        {/* Live Market */}
        <section ref={marketsRef} className="py-stack-xl px-margin-desktop max-w-container-max mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-white mb-2">Live Market Insights</h2>
              <p className="text-on-surface-variant">Real-time data feeds across global exchanges.</p>
            </div>
            <a className="text-primary hover:underline font-label-md text-label-md" href="#">View All Markets</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {coins.map((coin) => (
              <div key={coin.symbol} className="glass-panel p-6 rounded-xl orange-glow-hover">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${coin.color}33`, color: coin.color }}>
                      <span className="material-symbols-outlined">{coin.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white leading-none">{coin.symbol}</h4>
                      <p className="text-xs text-on-surface-variant">{coin.name}</p>
                    </div>
                  </div>
                  <span className={`font-label-sm text-label-sm ${coin.up ? "text-green-400" : "text-red-400"}`}>{coin.change}</span>
                </div>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white">{coin.price}</h3>
                </div>
                <div className="h-12 w-full">
                  <svg className="w-full h-full" viewBox="0 0 100 40">
                    <path d={coin.path} fill="none" stroke={coin.up ? "#22c55e" : "#f87171"} strokeWidth="2" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-stack-xl bg-surface-container-lowest">
          <div className="px-margin-desktop max-w-container-max mx-auto">
            <div className="text-center mb-16">
              <span className="font-label-md text-label-md text-primary tracking-widest uppercase">The Alpha Advantage</span>
              <h2 className="font-display-lg text-headline-lg text-white mt-4">Engineered for Superior Performance</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {features.map((f) => (
                <div key={f.title} className="glass-panel p-8 rounded-xl border border-white/5 group hover:border-primary-container transition-all">
                  <div className="w-14 h-14 bg-primary-container/10 flex items-center justify-center rounded-lg mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary-container text-3xl">{f.icon}</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-white mb-4">{f.title}</h3>
                  <p className="text-on-surface-variant font-body-md text-body-md">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-stack-xl px-margin-desktop max-w-container-max mx-auto relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="font-display-lg text-headline-lg text-white mb-8">Four Steps to Alpha.</h2>
              <div className="space-y-12 relative">
                {steps.map((s, i) => (
                  <div key={s.title} className="flex gap-8 group">
                    <div className="relative flex flex-col items-center">
                      {i === 0 ? (
                        <div className="w-12 h-12 bg-primary-container text-on-primary flex items-center justify-center rounded-full font-bold z-10">{i + 1}</div>
                      ) : (
                        <div className="w-12 h-12 glass-panel border border-primary-container text-primary flex items-center justify-center rounded-full font-bold z-10">{i + 1}</div>
                      )}
                      {i < steps.length - 1 && <div className="w-px h-full absolute top-12 left-1/2 bg-primary-container/30"></div>}
                    </div>
                    <div className="pb-8">
                      <h3 className="font-headline-md text-headline-md text-white group-hover:text-primary transition-colors">{s.title}</h3>
                      <p className="text-on-surface-variant mt-2 max-w-sm">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
           

            <div className="lg:w-1/2 w-full">
  <div className="relative aspect-square flex items-center justify-center">
    <div className="absolute inset-0 animate-pulse"></div>
    <div className="mascot-fog mascot-fog-1" aria-hidden="true"></div>
    <div className="mascot-fog mascot-fog-2" aria-hidden="true"></div>
    <span className="mascot-eye mascot-eye-left" aria-hidden="true"></span>
    <span className="mascot-eye mascot-eye-right" aria-hidden="true"></span>

    {/* Floating currency icons behind the fox */}
    <span className="material-symbols-outlined coin-float coin-1" aria-hidden="true">currency_bitcoin</span>
    <span className="material-symbols-outlined coin-float coin-2" aria-hidden="true">diamond</span>
    <span className="material-symbols-outlined coin-float coin-3" aria-hidden="true">bolt</span>
    <span className="material-symbols-outlined coin-float coin-4" aria-hidden="true">paid</span>
    <span className="material-symbols-outlined coin-float coin-5" aria-hidden="true">attach_money</span>
    <span className="material-symbols-outlined coin-float coin-6" aria-hidden="true">toll</span>

    <div className="relative z-10 text-center mascot-reveal-content">
      <img
        className="mx-auto mascot-reveal-image"
        style={{ filter: "drop-shadow(0 0 50px rgba(255,107,0,0.3))" }}
        alt="AlphaFox mascot"
        src={logo3}
      />
    </div>
  </div>
</div>
          </div>
        </section>

        {/* Analytics Preview */}
        <section className="py-stack-xl bg-surface-container-low">
          <div className="px-margin-desktop max-w-container-max mx-auto text-center mb-16">
            <h2 className="font-display-lg text-headline-lg text-white mb-6">Advanced Portfolio Terminal</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Access professional-grade tooling previously reserved for hedge fund managers. Visualize your path to financial freedom.</p>
          </div>
          <div className="px-margin-desktop max-w-container-max mx-auto">
            <div className="glass-panel p-4 md:p-8 rounded-2xl border border-white/10 shadow-2xl">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-bold text-white uppercase text-xs tracking-widest">Asset Value Progression</h4>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-primary-container/20 text-primary-container rounded text-xs">1W</button>
                        <button className="px-3 py-1 bg-white/5 text-on-surface-variant rounded text-xs">1M</button>
                        <button className="px-3 py-1 bg-white/5 text-on-surface-variant rounded text-xs">1Y</button>
                      </div>
                    </div>
                    <div className="h-64 relative">
                      <svg className="w-full h-full" viewBox="0 0 1000 250">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#ff6b00" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#ff6b00" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,200 L100,180 L200,190 L300,150 L400,170 L500,120 L600,130 L700,80 L800,100 L900,40 L1000,60" fill="none" stroke="#ff6b00" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
                        <path d="M0,200 L100,180 L200,190 L300,150 L400,170 L500,120 L600,130 L700,80 L800,100 L900,40 L1000,60 V250 H0 Z" fill="url(#chartGradient)" />
                      </svg>
                      <div className="absolute top-10 left-3/4 bg-primary-container p-2 rounded shadow-lg text-on-primary" style={{ fontSize: "10px", fontWeight: "bold" }}>
                        $1.24M (+18.4%)
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                      <p style={{ fontSize: "10px" }} className="text-on-surface-variant uppercase mb-1">Alpha Ratio</p>
                      <p className="text-xl font-bold text-white">1.84</p>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                      <p style={{ fontSize: "10px" }} className="text-on-surface-variant uppercase mb-1">Volatility</p>
                      <p className="text-xl font-bold text-white">Med</p>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                      <p style={{ fontSize: "10px" }} className="text-on-surface-variant uppercase mb-1">Max Drawdown</p>
                      <p className="text-xl font-bold text-error">12.4%</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                    <h4 className="font-bold text-white uppercase text-xs tracking-widest mb-6">Asset Allocation</h4>
                    <div className="flex justify-center mb-6">
                      <div className="w-40 h-40 rounded-full relative flex items-center justify-center" style={{ border: "15px solid var(--color-primary-container)" }}>
                        <div className="absolute inset-0 rounded-full border-white/5 transform rotate-45" style={{ border: "15px solid rgba(255,255,255,0.05)", borderTopColor: "transparent", borderLeftColor: "transparent" }}></div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">82%</p>
                          <p style={{ fontSize: "10px" }} className="text-on-surface-variant">Top 3 Assets</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary-container"></span> Bitcoin</span>
                        <span>45%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white/40"></span> Ethereum</span>
                        <span>25%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white/10"></span> Solana</span>
                        <span>12%</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-xl font-bold text-sm transition-colors uppercase tracking-widest">
                    Download Statement
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-stack-xl relative overflow-hidden">
          <div className="absolute inset-0 cta-gradient"></div>
          <div className="px-margin-desktop max-w-container-max mx-auto relative z-10 text-center">
            <div className="glass-panel py-16 px-8 rounded-3xl border border-primary-container/20 orange-glow">
              <h2 className="font-display-lg text-headline-lg text-white mb-6">Start Tracking Your Crypto Journey Today.</h2>
              <p className="text-on-surface-variant text-lg max-w-2xl mx-auto mb-10">Join 50,000+ elite investors who trust AlphaFox for their portfolio intelligence. Secure your financial future now.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={goRegister} className="bg-primary-container text-on-primary px-12 py-5 rounded-xl font-bold text-xl hover:scale-105 transition-transform shadow-xl">Register Now</button>
                <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-12 py-5 rounded-xl font-bold text-xl transition-all">View Demo</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-stack-xl bg-surface-container-lowest border-t border-outline-variant">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-container-max mx-auto gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="font-headline-md text-headline-md font-bold text-on-surface mb-2">AlphaFox</div>
            <p className="font-body-md text-body-md text-on-surface-variant text-center md:text-left">© 2026 AlphaFox Intelligence. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="text-on-surface-variant font-label-sm text-label-sm hover:text-secondary transition-colors" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant font-label-sm text-label-sm hover:text-secondary transition-colors" href="#">Terms of Service</a>
            <a className="text-on-surface-variant font-label-sm text-label-sm hover:text-secondary transition-colors" href="#">Security</a>
            <a className="text-on-surface-variant font-label-sm text-label-sm hover:text-secondary transition-colors" href="#">API Documentation</a>
          </div>
          <div className="flex gap-4">
            <a className="w-10 h-10 rounded-full glass-panel border border-white/10 flex items-center justify-center hover:text-primary-container transition-colors" href="#">
              <span className="material-symbols-outlined text-sm">public</span>
            </a>
            <a className="w-10 h-10 rounded-full glass-panel border border-white/10 flex items-center justify-center hover:text-primary-container transition-colors" href="#">
              <span className="material-symbols-outlined text-sm">share</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}



