const coinMap = require('../utils/coinMap');

const CACHE_TTL_MS = 60 * 1000; // 60s cache to respect CoinGecko free-tier rate limits
const ID_CACHE_TTL_MS = 10 * 60 * 1000; // symbol -> id resolution changes rarely, cache longer

const cache = new Map(); // key -> { value, ts }

const getCached = (key, ttl) => {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < ttl) return hit.value;
  return null;
};

const setCached = (key, value) => cache.set(key, { value, ts: Date.now() });

// Resolve a symbol like "BTC" to a CoinGecko coin id like "bitcoin"
const resolveId = async (symbol) => {
  const upper = symbol.toUpperCase();
  if (coinMap[upper]) return coinMap[upper];

  const cacheKey = `id:${upper}`;
  const cached = getCached(cacheKey, ID_CACHE_TTL_MS);
  if (cached !== null) return cached;

  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(symbol)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const match = data.coins?.find((c) => c.symbol.toUpperCase() === upper);
    const id = match ? match.id : null;
    setCached(cacheKey, id);
    return id;
  } catch (err) {
    return null;
  }
};

const remapToSymbols = (data, pairs) => {
  const result = {};
  pairs.forEach(({ symbol, id }) => {
    if (data[id]) result[symbol] = data[id];
  });
  return result;
};

// Returns { BTC: { inr: 10000000 }, ETH: { inr: 180000 } }
const getLivePrices = async (symbols, vsCurrency = 'inr') => {
  const uniqueSymbols = [...new Set(symbols.map((s) => s.toUpperCase()))];
  const idPairs = await Promise.all(
    uniqueSymbols.map(async (symbol) => ({ symbol, id: await resolveId(symbol) }))
  );
  const validPairs = idPairs.filter((p) => p.id);
  if (validPairs.length === 0) return {};

  const ids = [...new Set(validPairs.map((p) => p.id))].sort();
  const cacheKey = `prices:${vsCurrency}:${ids.join(',')}`;
  const cached = getCached(cacheKey, CACHE_TTL_MS);
  if (cached) return remapToSymbols(cached, validPairs);

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=${vsCurrency}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch live prices from CoinGecko');
  const data = await res.json();
  setCached(cacheKey, data);
  return remapToSymbols(data, validPairs);
};

module.exports = { getLivePrices };
