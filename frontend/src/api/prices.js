import client from './client';

// Returns e.g. { BTC: { inr: 10000000 }, ETH: { inr: 180000 } }
export async function fetchLivePrices(symbols, vs = 'inr') {
  if (!symbols || symbols.length === 0) return {};
  const { data } = await client.get('/prices', { params: { symbols: symbols.join(','), vs } });
  return data.data.prices;
}
