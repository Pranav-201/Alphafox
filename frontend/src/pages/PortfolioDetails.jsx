import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { fetchLivePrices } from '../api/prices';
import Alert from '../components/Alert';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

export default function PortfolioDetails() {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [summary, setSummary] = useState(null);
  const [topAsset, setTopAsset] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [assets, setAssets] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [symbolFilter, setSymbolFilter] = useState('');
  const [page, setPage] = useState(1);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [assetForm, setAssetForm] = useState({
    coinName: '',
    symbol: '',
    quantity: '',
    buyPrice: '',
    currentPrice: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const loadOverview = useCallback(async () => {
    try {
      const [pRes, sRes, tRes, dRes] = await Promise.all([
        client.get(`/portfolios/${id}`),
        client.get(`/portfolios/${id}/summary`),
        client.get(`/portfolios/${id}/top-asset`),
        client.get(`/portfolios/${id}/distribution`),
      ]);
      setPortfolio(pRes.data.data.portfolio);
      setSummary(sRes.data.data);
      setTopAsset(tRes.data.data.topAsset);
      setDistribution(dRes.data.data.distribution);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load portfolio');
    }
  }, [id]);

  const loadAssets = useCallback(async () => {
    try {
      const params = { page, limit: 10, portfolioId: id, sort };
      if (search) params.search = search;
      if (symbolFilter) params.symbol = symbolFilter;
      const { data } = await client.get('/assets', { params });
      setAssets(data.data.items);
      setMeta(data.meta);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assets');
    }
  }, [id, page, sort, search, symbolFilter]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const refreshAll = () => {
    loadOverview();
    loadAssets();
  };

  // Fetch live price for the symbol currently typed in the add/edit form and auto-fill Current Price
  const fetchPriceForForm = async () => {
    if (!assetForm.symbol) {
      setError('Enter a symbol first (e.g. BTC)');
      return;
    }
    setFetchingPrice(true);
    setError('');
    try {
      const prices = await fetchLivePrices([assetForm.symbol]);
      const priceData = prices[assetForm.symbol.toUpperCase()];
      if (!priceData || priceData.inr === undefined) {
        setError(`No live price found for "${assetForm.symbol}". Enter it manually.`);
      } else {
        setAssetForm((f) => ({ ...f, currentPrice: priceData.inr }));
        setSuccess(`Live price fetched for ${assetForm.symbol.toUpperCase()}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch live price');
    } finally {
      setFetchingPrice(false);
    }
  };

  // Refresh live currentPrice for every distinct symbol currently shown in the assets table
  const refreshLivePrices = useCallback(async () => {
    if (assets.length === 0) return;
    setRefreshingAll(true);
    try {
      const distinctSymbols = [...new Set(assets.map((a) => a.symbol))];
      const prices = await fetchLivePrices(distinctSymbols);
      const updates = assets
        .filter((a) => prices[a.symbol]?.inr !== undefined)
        .map((a) => client.put(`/assets/${a._id}`, { currentPrice: prices[a.symbol].inr }));
      if (updates.length > 0) {
        await Promise.all(updates);
        await Promise.all([loadOverview(), loadAssets()]);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to refresh live prices');
    } finally {
      setRefreshingAll(false);
    }
  }, [assets, loadOverview, loadAssets]);

  // Auto-refresh live prices every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshLivePrices();
    }, 60000);
    return () => clearInterval(interval);
  }, [refreshLivePrices]);

  const resetForm = () => {
    setAssetForm({ coinName: '', symbol: '', quantity: '', buyPrice: '', currentPrice: '' });
    setEditingId(null);
  };

  const submitAsset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const payload = {
      coinName: assetForm.coinName,
      symbol: assetForm.symbol,
      quantity: Number(assetForm.quantity),
      buyPrice: Number(assetForm.buyPrice),
      currentPrice: Number(assetForm.currentPrice),
      portfolioId: id,
    };
    try {
      if (editingId) {
        delete payload.portfolioId;
        await client.put(`/assets/${editingId}`, payload);
        setSuccess('Asset updated!');
      } else {
        await client.post('/assets', payload);
        setSuccess('Asset added!');
      }
      resetForm();
      setShowAddForm(false);
      refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save asset');
    }
  };

  const editAsset = (a) => {
    setAssetForm({
      coinName: a.coinName,
      symbol: a.symbol,
      quantity: a.quantity,
      buyPrice: a.buyPrice,
      currentPrice: a.currentPrice,
    });
    setEditingId(a._id);
    setShowAddForm(true);
  };

  const deleteAsset = async (assetId) => {
    if (!confirm('Delete this asset?')) return;
    try {
      await client.delete(`/assets/${assetId}`);
      refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete asset');
    }
  };

  if (!portfolio) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <Link to="/dashboard" className="muted">
        ← Back to portfolios
      </Link>
      <h1>{portfolio.name}</h1>
      <p className="muted">{portfolio.description}</p>

      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      {summary && (
        <div className="stats-grid">
          <div className="card stat">
            <span className="stat-label">Total Investment</span>
            <span className="stat-value">{fmt(summary.totalInvestment)}</span>
          </div>
          <div className="card stat">
            <span className="stat-label">Current Value</span>
            <span className="stat-value">{fmt(summary.currentValue)}</span>
          </div>
          <div className="card stat">
            <span className="stat-label">Profit / Loss</span>
            <span className={`stat-value ${summary.profit >= 0 ? 'positive' : 'negative'}`}>
              {fmt(summary.profit)} ({summary.profitPercentage}%)
            </span>
          </div>
          <div className="card stat">
            <span className="stat-label">Top Asset</span>
            <span className="stat-value">{topAsset ? topAsset.asset.symbol : '—'}</span>
          </div>
        </div>
      )}

      {distribution.length > 0 && (
        <div className="card">
          <h3>Asset Distribution</h3>
          <div className="dist-bar">
            {distribution.map((d, i) => (
              <div
                key={d.coin}
                className="dist-segment"
                style={{
                  width: `${d.percentage}%`,
                  background: `hsl(${(i * 67) % 360}, 65%, 55%)`,
                }}
                title={`${d.coin}: ${d.percentage}%`}
              >
                {d.percentage > 8 ? `${d.coin} ${d.percentage}%` : ''}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="row space-between">
        <h2>Assets</h2>
        <div className="row">
          {lastRefreshed && (
            <span className="muted small-text">Last refreshed: {lastRefreshed.toLocaleTimeString()}</span>
          )}
          <button className="btn-secondary" onClick={refreshLivePrices} disabled={refreshingAll || assets.length === 0}>
            {refreshingAll ? 'Refreshing...' : '🔄 Refresh Live Prices'}
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowAddForm(!showAddForm);
            }}
          >
            {showAddForm ? 'Cancel' : '+ Add Asset'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form className="card inline-form wrap" onSubmit={submitAsset}>
          <input
            placeholder="Coin name e.g. Bitcoin"
            required
            value={assetForm.coinName}
            onChange={(e) => setAssetForm({ ...assetForm, coinName: e.target.value })}
          />
          <input
            placeholder="Symbol e.g. BTC"
            required
            value={assetForm.symbol}
            onChange={(e) => setAssetForm({ ...assetForm, symbol: e.target.value })}
          />
          <input
            type="number"
            step="any"
            placeholder="Quantity"
            required
            value={assetForm.quantity}
            onChange={(e) => setAssetForm({ ...assetForm, quantity: e.target.value })}
          />
          <input
            type="number"
            step="any"
            placeholder="Buy price"
            required
            value={assetForm.buyPrice}
            onChange={(e) => setAssetForm({ ...assetForm, buyPrice: e.target.value })}
          />
          <input
            type="number"
            step="any"
            placeholder="Current price"
            required
            value={assetForm.currentPrice}
            onChange={(e) => setAssetForm({ ...assetForm, currentPrice: e.target.value })}
          />
          <button type="button" className="btn-secondary" onClick={fetchPriceForForm} disabled={fetchingPrice}>
            {fetchingPrice ? 'Fetching...' : '⚡ Fetch Live Price'}
          </button>
          <button className="btn-primary">{editingId ? 'Update Asset' : 'Add Asset'}</button>
        </form>
      )}

      <div className="row toolbar">
        <input
          placeholder="Search coin/symbol..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <input
          placeholder="Filter by symbol e.g. BTC"
          value={symbolFilter}
          onChange={(e) => {
            setPage(1);
            setSymbolFilter(e.target.value);
          }}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="-createdAt">Newest first</option>
          <option value="-profit">Profit: High to Low</option>
          <option value="profit">Profit: Low to High</option>
          <option value="-currentValue">Value: High to Low</option>
          <option value="-quantity">Quantity: High to Low</option>
        </select>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Coin</th>
            <th>Qty</th>
            <th>Buy Price</th>
            <th>Current Price</th>
            <th>Investment</th>
            <th>Value</th>
            <th>Profit</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => (
            <tr key={a._id}>
              <td>
                {a.coinName} <span className="muted">({a.symbol})</span>
              </td>
              <td>{a.quantity}</td>
              <td>{fmt(a.buyPrice)}</td>
              <td>{fmt(a.currentPrice)}</td>
              <td>{fmt(a.investment)}</td>
              <td>{fmt(a.currentValue)}</td>
              <td className={a.profit >= 0 ? 'positive' : 'negative'}>{fmt(a.profit)}</td>
              <td className="row">
                <button className="btn-secondary small" onClick={() => editAsset(a)}>
                  Edit
                </button>
                <button className="btn-danger small" onClick={() => deleteAsset(a._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {assets.length === 0 && (
            <tr>
              <td colSpan="8" className="muted">
                No assets yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {meta.pages > 1 && (
        <div className="row pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <span>
            Page {meta.page} of {meta.pages}
          </span>
          <button disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
