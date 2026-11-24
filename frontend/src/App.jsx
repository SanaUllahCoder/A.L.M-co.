import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine, ArrowRight, BadgePercent, CalendarDays, Check, ChevronDown,
  FilePlus2, FileText, LayoutDashboard, LogOut, Menu, Plus, Printer, Search,
  ShoppingBag, Store, Trash2, Users, X
} from 'lucide-react';
import api, { getErrorMessage } from './api.js';
import { dateLabel, money } from './utils.js';

const COMPANY_NAME = 'A.L.M & co.';
const DISTRIBUTED_BRANDS = 'Jhonson White · Becute · MMadam';

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'create', label: 'Create invoice', icon: FilePlus2 },
  { id: 'history', label: 'Invoice history', icon: FileText },
  { id: 'shopkeepers', label: 'Shopkeepers', icon: Store },
  { id: 'products', label: 'Products', icon: ShoppingBag }
];

function App() {
  const [token, setToken] = useState(localStorage.getItem('invoice-admin-token'));
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('invoice-admin') ?? 'null'); } catch { return null; }
  });
  const [page, setPage] = useState('dashboard');
  const [toast, setToast] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const notify = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3500);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('invoice-admin-token');
    localStorage.removeItem('invoice-admin');
    setToken(null);
    setAdmin(null);
  }, []);

  if (!token) {
    return <Login onLogin={(session) => {
      localStorage.setItem('invoice-admin-token', session.token);
      localStorage.setItem('invoice-admin', JSON.stringify(session.admin));
      setToken(session.token);
      setAdmin(session.admin);
    }} />;
  }

  const pageTitle = navigation.find((item) => item.id === page)?.label ?? 'Dashboard';
  return (
    <div className="app-shell">
      {sidebarOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">ALM</div>
          <div className="brand-copy"><strong>{COMPANY_NAME}</strong><span>AUTHORIZED DISTRIBUTOR</span><small>{DISTRIBUTED_BRANDS}</small></div>
          <button className="icon-button mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${page === id ? 'nav-active' : ''}`}
              onClick={() => { setPage(id); setSidebarOpen(false); }}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {id === 'create' && <span className="nav-shortcut"><Plus size={13} /></span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="profile" onClick={signOut}>
            <div className="avatar">{(admin?.name ?? 'A').slice(0, 1).toUpperCase()}</div>
            <span className="profile-name"><b>{admin?.name ?? 'Administrator'}</b><small>Administrator</small></span>
            <LogOut size={16} className="logout-icon" />
          </button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><b>{pageTitle}</b></div>
          <div className="topbar-right"><span className="today-date"><CalendarDays size={15} />{dateLabel(new Date())}</span><div className="topbar-avatar">{(admin?.name ?? 'A').slice(0, 1).toUpperCase()}</div></div>
        </header>
        <div className="page-content">
          {page === 'dashboard' && <Dashboard key={refreshKey} onNavigate={setPage} />}
          {page === 'create' && <CreateInvoice onSaved={() => { setRefreshKey((key) => key + 1); }} notify={notify} />}
          {page === 'history' && <InvoiceHistory notify={notify} />}
          {page === 'shopkeepers' && <Directory kind="shopkeepers" notify={notify} />}
          {page === 'products' && <Directory kind="products" notify={notify} />}
        </div>
      </main>
      {toast && <div className="toast"><Check size={17} />{toast}</div>}
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      onLogin(data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-art"><div className="art-glow" /><div className="login-brand"><span className="brand-mark">ALM</span><span>{COMPANY_NAME}</span></div><div className="art-copy"><span className="eyebrow light-eyebrow">YOUR DISTRIBUTION, MADE SIMPLE</span><h1>Good business<br />starts with a<br /><em>beautifully</em> clear<br />invoice.</h1><p>Official distributor of Jhonson White, Becute and MMadam.</p></div><div className="art-footer">COSMETICS DISTRIBUTION · PAKISTAN</div></div>
      <div className="login-form-wrap"><form className="login-form" onSubmit={submit}>
        <span className="eyebrow">WELCOME BACK</span><h2>Sign in to your desk</h2><p className="form-subtitle">Enter your administrator credentials to continue.</p>
        {error && <div className="error-banner">{error}</div>}
        <label>Email address<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@yourbusiness.com" /></label>
        <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /></label>
        <button className="primary-button login-submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}<ArrowRight size={17} /></button>
        <p className="login-foot">Secure administrator access</p>
      </form></div>
    </div>
  );
}

function Dashboard({ onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/dashboard/summary'), api.get('/invoices')])
      .then(([stats, invoices]) => { setSummary(stats.data); setRecent(invoices.data.slice(0, 5)); })
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, []);

  return (
    <div className="page-wrap">
      <div className="page-heading dashboard-heading"><div><span className="eyebrow">OVERVIEW</span><h1>Welcome to A.L.M &amp; co.</h1><p>Invoice desk for Jhonson White, Becute and MMadam distribution.</p></div><button className="primary-button" onClick={() => onNavigate('create')}><Plus size={17} />Create invoice</button></div>
      {error && <div className="error-banner">{error}</div>}
      <div className="stats-grid">
        <StatCard label="Total invoices" value={summary?.totalInvoices ?? '—'} icon={FileText} caption="All invoices issued" />
        <StatCard label="Invoices today" value={summary?.todayInvoices ?? '—'} icon={CalendarDays} caption="Created since midnight" accent />
        <StatCard label="Total invoice sales" value={summary ? money(summary.totalSales) : '—'} icon={BadgePercent} caption="Across all invoices" />
      </div>
      <div className="section-heading"><div><h2>Recent invoices</h2><p>Your latest billing activity</p></div><button className="text-button" onClick={() => onNavigate('history')}>View all invoices <ArrowRight size={15} /></button></div>
      <InvoiceTable invoices={recent} emptyMessage="Your latest invoices will appear here." />
      <div className="quick-note"><div className="quick-icon"><FilePlus2 size={18} /></div><div><b>Ready for your next invoice?</b><span>Look up a shopkeeper and add products by their codes.</span></div><button className="text-button" onClick={() => onNavigate('create')}>Start one <ArrowRight size={15} /></button></div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, caption, accent }) {
  return <div className="stat-card"><div className={`stat-icon ${accent ? 'stat-icon-accent' : ''}`}><Icon size={19} strokeWidth={1.8} /></div><span className="stat-label">{label}</span><strong className={`stat-value ${String(value).length > 12 ? 'stat-value-small' : ''}`}>{value}</strong><span className="stat-caption">{caption}</span></div>;
}

function CreateInvoice({ onSaved, notify }) {
  const [shopCode, setShopCode] = useState('');
  const [shopkeeper, setShopkeeper] = useState(null);
  const [shopError, setShopError] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([{ productCode: '', productName: '', quantity: 1, unitRate: 0, resolved: false }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  async function lookupShopkeeper(code) {
    setShopError('');
    setShopkeeper(null);
    if (!code.trim()) return;
    try {
      const { data } = await api.get(`/shopkeepers/by-code/${encodeURIComponent(code.trim())}`);
      setShopkeeper(data);
    } catch (requestError) {
      setShopError(getErrorMessage(requestError));
    }
  }

  async function lookupProduct(index, code) {
    const update = (patch) => setRows((current) => current.map((row, i) => i === index ? { ...row, ...patch } : row));
    setError('');
    if (!code.trim()) { update({ productName: '', unitRate: 0, resolved: false }); return; }
    try {
      const { data } = await api.get(`/products/by-code/${encodeURIComponent(code.trim())}`);
      update({ productCode: data.code, productName: data.name, unitRate: data.saleRate, resolved: true });
    } catch (requestError) {
      update({ productName: '', unitRate: 0, resolved: false });
      setError(getErrorMessage(requestError));
      window.setTimeout(() => setError(''), 3500);
    }
  }

  const subtotal = useMemo(() => Math.round(rows.reduce((sum, row) => {
    const lineTotal = Math.round((Number(row.quantity) || 0) * (Number(row.unitRate) || 0) * 100) / 100;
    return sum + lineTotal;
  }, 0) * 100) / 100, [rows]);
  const discount = shopkeeper ? Math.round(subtotal * shopkeeper.discountPercentage) / 100 : 0;
  const grandTotal = Math.round((subtotal - discount) * 100) / 100;
  const updateRow = (index, patch) => setRows((current) => current.map((row, i) => i === index ? { ...row, ...patch } : row));

  async function previewInvoice() {
    setError('');
    if (!shopkeeper && !shopCode.trim()) { setError('Enter a shopkeeper code before previewing.'); return; }
    if (!rows.length || rows.some((row) => !row.productCode.trim())) { setError('Enter a product code for every row.'); return; }
    if (rows.some((row) => !Number.isInteger(Number(row.quantity)) || Number(row.quantity) <= 0)) { setError('Product quantities must be positive whole numbers.'); return; }
    setBusy(true);
    try {
      const activeShopkeeper = shopkeeper ?? (await api.get(`/shopkeepers/by-code/${encodeURIComponent(shopCode.trim())}`)).data;
      const verifiedRows = await Promise.all(rows.map(async (row) => {
        if (row.resolved) return row;
        const { data } = await api.get(`/products/by-code/${encodeURIComponent(row.productCode.trim())}`);
        return { ...row, productCode: data.code, productName: data.name, unitRate: data.saleRate, resolved: true };
      }));
      const products = verifiedRows.map((row) => ({
        productCode: row.productCode,
        productName: row.productName,
        quantity: Number(row.quantity),
        unitRate: row.unitRate,
        lineTotal: Math.round(Number(row.quantity) * row.unitRate * 100) / 100
      }));
      const previewSubtotal = Math.round(products.reduce((sum, row) => sum + row.lineTotal, 0) * 100) / 100;
      const discountAmount = Math.round(previewSubtotal * activeShopkeeper.discountPercentage) / 100;
      setPreview({
        invoiceNumber: 'PREVIEW',
        invoiceDate,
        shopkeeper: {
          code: activeShopkeeper.code,
          name: activeShopkeeper.name,
          area: activeShopkeeper.area,
          contactNumber: activeShopkeeper.contactNumber
        },
        products,
        subtotal: previewSubtotal,
        discountPercentage: activeShopkeeper.discountPercentage,
        discountAmount,
        grandTotal: Math.round((previewSubtotal - discountAmount) * 100) / 100,
        isDraft: true
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function saveInvoice() {
    setError('');
    if (!shopkeeper && !shopCode.trim()) { setError('Enter a shopkeeper code before continuing.'); return; }
    if (!rows.length || rows.some((row) => !row.productCode.trim())) { setError('Enter a product code for every row.'); return; }
    if (rows.some((row) => !Number.isInteger(Number(row.quantity)) || Number(row.quantity) <= 0)) { setError('Product quantities must be positive whole numbers.'); return; }
    setBusy(true);
    try {
      const activeShopkeeper = shopkeeper ?? (await api.get(`/shopkeepers/by-code/${encodeURIComponent(shopCode.trim())}`)).data;
      const verifiedRows = await Promise.all(rows.map(async (row) => {
        if (row.resolved) return row;
        const { data } = await api.get(`/products/by-code/${encodeURIComponent(row.productCode.trim())}`);
        return { ...row, productCode: data.code, productName: data.name, unitRate: data.saleRate, resolved: true };
      }));
      const { data } = await api.post('/invoices', {
        shopkeeperCode: activeShopkeeper.code,
        invoiceDate,
        products: verifiedRows.map(({ productCode, quantity }) => ({ productCode, quantity: Number(quantity) }))
      });
      onSaved();
      notify('Invoice saved successfully.');
      setPreview(data);
      setRows([{ productCode: '', productName: '', quantity: 1, unitRate: 0, resolved: false }]);
      setShopCode('');
      setShopkeeper(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-wrap">
      <div className="page-heading"><div><span className="eyebrow">BILLING</span><h1>Create an invoice</h1><p>Enter a shopkeeper and add products by code.</p></div><span className="draft-badge"><span />NEW INVOICE</span></div>
      {error && <div className="error-banner">{error}</div>}
      <div className="invoice-layout">
        <div className="invoice-main">
          <section className="form-card">
            <div className="card-title-row"><div className="card-step">01</div><div><h2>Invoice details</h2><p>Choose who you’re billing and when.</p></div></div>
            <div className="form-grid">
              <label>Shopkeeper code <span className="required">*</span>
                <div className={`input-with-status ${shopError ? 'input-error' : ''}`}><input value={shopCode} onChange={(event) => { setShopCode(event.target.value); setShopkeeper(null); }} onBlur={() => lookupShopkeeper(shopCode)} onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), lookupShopkeeper(shopCode))} placeholder="e.g. SHOP-001" /><Search size={16} /></div>
                {shopError && <small className="field-error">{shopError}</small>}
              </label>
              <label>Invoice date <span className="required">*</span><input type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} /></label>
            </div>
            {shopkeeper ? <div className="shop-result"><div className="shop-result-icon"><Store size={18} /></div><div className="shop-result-main"><b>{shopkeeper.name}</b><span>{shopkeeper.code} <i>·</i> {shopkeeper.area}</span></div><span className="discount-tag"><BadgePercent size={14} />{shopkeeper.discountPercentage}% discount</span></div> : <div className="lookup-hint"><Search size={15} />Enter a shopkeeper code to automatically apply their discount.</div>}
          </section>
          <section className="form-card products-card">
            <div className="card-title-row"><div className="card-step">02</div><div><h2>Products</h2><p>Add the items on this invoice.</p></div><span className="items-count">{rows.length} {rows.length === 1 ? 'item' : 'items'}</span></div>
            <div className="product-table-wrap"><table className="product-table"><thead><tr><th>PRODUCT CODE</th><th>PRODUCT</th><th>QTY</th><th>UNIT RATE</th><th>AMOUNT</th><th /></tr></thead><tbody>
              {rows.map((row, index) => <tr key={index}>
                <td><input className={`table-input code-input ${row.resolved ? 'resolved-input' : ''}`} value={row.productCode} onChange={(event) => { setError(''); updateRow(index, { productCode: event.target.value, productName: '', unitRate: 0, resolved: false }); }} onBlur={() => lookupProduct(index, row.productCode)} onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), lookupProduct(index, row.productCode))} placeholder="Enter code" /></td>
                <td><span className={row.resolved ? 'product-name' : 'placeholder-text'}>{row.productName || 'Auto-filled'}</span></td>
                <td><input className="table-input quantity-input" type="number" min="1" step="1" value={row.quantity} onChange={(event) => updateRow(index, { quantity: event.target.value })} /></td>
                <td className="rate-cell">{row.resolved ? money(row.unitRate) : '—'}</td>
                <td className="amount-cell">{row.resolved ? money(Math.round((Number(row.quantity) || 0) * row.unitRate * 100) / 100) : '—'}</td>
                <td><button className="remove-row" aria-label="Remove product" onClick={() => setRows((current) => current.length > 1 ? current.filter((_, i) => i !== index) : current.map((item, i) => i === index ? { productCode: '', productName: '', quantity: 1, unitRate: 0, resolved: false } : item))}><Trash2 size={15} /></button></td>
              </tr>)}
            </tbody></table></div>
            <button className="add-row-button" onClick={() => setRows((current) => [...current, { productCode: '', productName: '', quantity: 1, unitRate: 0, resolved: false }])}><Plus size={15} />Add another product</button>
          </section>
        </div>
        <aside className="summary-card">
          <div className="summary-heading"><div className="summary-heading-icon"><FileText size={17} /></div><div><h2>Summary</h2><span>Invoice totals</span></div></div>
          <div className="summary-line"><span>Subtotal <small>({rows.filter((row) => row.resolved).length} products)</small></span><b>{money(subtotal)}</b></div>
          <div className="summary-line"><span>Shopkeeper discount <small>{shopkeeper ? `${shopkeeper.discountPercentage}%` : '—'}</small></span><b className="discount-value">− {money(discount)}</b></div>
          <div className="summary-total"><span>Grand total</span><strong>{money(grandTotal)}</strong></div>
          <div className="summary-meta"><span>Currency</span><b>PKR · Pakistani Rupee</b></div>
          <div className="summary-actions"><button className="secondary-button summary-preview" disabled={busy} onClick={previewInvoice}><FileText size={15} />Preview invoice</button><button className="primary-button summary-save" disabled={busy} onClick={saveInvoice}>{busy ? 'Saving invoice…' : 'Save invoice'}<ArrowRight size={16} /></button></div>
          <p className="summary-foot"><Check size={14} />Rates and discount are saved with this invoice.</p>
        </aside>
      </div>
      {preview && <InvoiceModal invoice={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

function InvoiceHistory({ notify }) {
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/invoices', { params: { search: search || undefined, from: from || undefined, to: to || undefined } });
      setInvoices(data);
      setError('');
    } catch (requestError) { setError(getErrorMessage(requestError)); }
  }, [search, from, to]);
  useEffect(() => { const timer = window.setTimeout(load, 250); return () => window.clearTimeout(timer); }, [load]);

  return <div className="page-wrap">
    <div className="page-heading"><div><span className="eyebrow">RECORDS</span><h1>Invoice history</h1><p>Find, review and reprint previous invoices.</p></div><span className="count-pill">{invoices.length} invoices</span></div>
    <div className="filter-bar">
      <div className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search invoice no., shopkeeper code or name…" /></div>
      <label className="filter-date"><span>From</span><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
      <label className="filter-date"><span>To</span><input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
      {(search || from || to) && <button className="clear-filters" onClick={() => { setSearch(''); setFrom(''); setTo(''); }}>Clear</button>}
    </div>
    {error && <div className="error-banner">{error}</div>}
    <InvoiceTable invoices={invoices} onSelect={setSelected} emptyMessage="No invoices match your search." />
    {selected && <InvoiceModal invoice={selected} onClose={() => setSelected(null)} notify={notify} />}
  </div>;
}

function InvoiceTable({ invoices, onSelect, emptyMessage }) {
  return <div className="table-card"><table className="data-table invoice-list-table"><thead><tr><th>INVOICE</th><th>SHOPKEEPER</th><th>DATE</th><th>ITEMS</th><th>GRAND TOTAL</th><th /></tr></thead><tbody>
    {invoices.length ? invoices.map((invoice) => <tr key={invoice._id} onClick={() => onSelect?.(invoice)} className={onSelect ? 'clickable-row' : ''}>
      <td><span className="invoice-number">{invoice.invoiceNumber}</span></td>
      <td><div className="table-person"><span className="person-dot">{invoice.shopkeeper.name.slice(0, 1).toUpperCase()}</span><span><b>{invoice.shopkeeper.name}</b><small>{invoice.shopkeeper.code}</small></span></div></td>
      <td className="muted-cell">{dateLabel(invoice.invoiceDate)}</td><td className="muted-cell">{invoice.products.length} {invoice.products.length === 1 ? 'item' : 'items'}</td>
      <td className="money-cell">{money(invoice.grandTotal)}</td><td><ChevronDown className="row-chevron" size={16} /></td>
    </tr>) : <tr><td colSpan="6"><div className="empty-state"><div className="empty-icon"><FileText size={21} /></div><b>No invoices yet</b><span>{emptyMessage}</span></div></td></tr>}
  </tbody></table></div>;
}

function Directory({ kind, notify }) {
  const isShopkeepers = kind === 'shopkeepers';
  const title = isShopkeepers ? 'Shopkeepers' : 'Products';
  const endpoint = isShopkeepers ? '/shopkeepers' : '/products';
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try {
      const { data } = await api.get(endpoint, { params: { search: search || undefined } });
      setRecords(data);
      setError('');
    } catch (requestError) { setError(getErrorMessage(requestError)); }
  }, [endpoint, search]);
  useEffect(() => { const timer = window.setTimeout(load, 200); return () => window.clearTimeout(timer); }, [load]);

  async function remove(record) {
    if (!window.confirm(`Delete ${record.name}?`)) return;
    try {
      await api.delete(`${endpoint}/${record._id}`);
      notify(`${isShopkeepers ? 'Shopkeeper' : 'Product'} deleted.`);
      load();
    } catch (requestError) { setError(getErrorMessage(requestError)); }
  }

  async function save(record) {
    try {
      if (dialog?._id) await api.put(`${endpoint}/${dialog._id}`, record);
      else await api.post(endpoint, record);
      setDialog(null);
      notify(`${isShopkeepers ? 'Shopkeeper' : 'Product'} ${dialog?._id ? 'updated' : 'added'}.`);
      load();
    } catch (requestError) { throw new Error(getErrorMessage(requestError)); }
  }

  return <div className="page-wrap">
    <div className="page-heading"><div><span className="eyebrow">YOUR DIRECTORY</span><h1>{title}</h1><p>{isShopkeepers ? 'Manage customer details and their individual discounts.' : 'Manage products and their shared sale rates.'}</p></div><button className="primary-button" onClick={() => setDialog({})}><Plus size={17} />Add {isShopkeepers ? 'shopkeeper' : 'product'}</button></div>
    <div className="directory-toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()} by code or name…`} /></div><span className="count-pill">{records.length} {records.length === 1 ? 'record' : 'records'}</span></div>
    {error && <div className="error-banner">{error}</div>}
    <div className="table-card"><table className="data-table"><thead><tr><th>{isShopkeepers ? 'SHOPKEEPER' : 'PRODUCT'}</th><th>CODE</th>{isShopkeepers ? <><th>AREA / CITY</th><th>CONTACT</th><th>DISCOUNT</th></> : <th>SALE RATE</th>}<th /></tr></thead><tbody>
      {records.length ? records.map((record) => <tr key={record._id}>
        <td><div className="table-person"><span className={`person-dot ${isShopkeepers ? '' : 'product-dot'}`}>{record.name.slice(0, 1).toUpperCase()}</span><b>{record.name}</b></div></td>
        <td><span className="code-pill">{record.code}</span></td>
        {isShopkeepers ? <><td className="muted-cell">{record.area}</td><td className="muted-cell">{record.contactNumber || '—'}</td><td><span className="discount-tag"><BadgePercent size={14} />{record.discountPercentage}%</span></td></> : <td className="money-cell">{money(record.saleRate)}</td>}
        <td><div className="row-actions"><button onClick={() => setDialog(record)} className="edit-action">Edit</button><button onClick={() => remove(record)} className="delete-action" aria-label={`Delete ${record.name}`}><Trash2 size={15} /></button></div></td>
      </tr>) : <tr><td colSpan={isShopkeepers ? 6 : 4}><div className="empty-state"><div className="empty-icon">{isShopkeepers ? <Users size={20} /> : <ShoppingBag size={20} />}</div><b>No {title.toLowerCase()} found</b><span>Add one to start using it on invoices.</span></div></td></tr>}
    </tbody></table></div>
    {dialog && <RecordModal kind={kind} record={dialog} onClose={() => setDialog(null)} onSave={save} />}
  </div>;
}

function RecordModal({ kind, record, onClose, onSave }) {
  const isShopkeepers = kind === 'shopkeepers';
  const [form, setForm] = useState({
    code: record.code ?? '', name: record.name ?? '', area: record.area ?? '',
    contactNumber: record.contactNumber ?? '', discountPercentage: record.discountPercentage ?? 0,
    saleRate: record.saleRate ?? ''
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = isShopkeepers
        ? { code: form.code, name: form.name, area: form.area, contactNumber: form.contactNumber, discountPercentage: Number(form.discountPercentage) }
        : { code: form.code, name: form.name, saleRate: Number(form.saleRate) };
      await onSave(payload);
    } catch (saveError) { setError(saveError.message); }
    finally { setBusy(false); }
  }

  return <Modal onClose={onClose}><form className="record-form" onSubmit={submit}>
    <div className="modal-heading"><div><span className="eyebrow">{record._id ? 'EDIT DETAILS' : 'NEW RECORD'}</span><h2>{record._id ? 'Edit' : 'Add'} {isShopkeepers ? 'shopkeeper' : 'product'}</h2></div><button type="button" className="icon-button" onClick={onClose}><X size={18} /></button></div>
    {error && <div className="error-banner">{error}</div>}
    <label>{isShopkeepers ? 'Shopkeeper' : 'Product'} code<input required maxLength="40" value={form.code} onChange={(event) => set('code', event.target.value)} placeholder={isShopkeepers ? 'e.g. SHOP-001' : 'e.g. PRD-001'} /></label>
    <label>{isShopkeepers ? 'Shopkeeper' : 'Product'} name<input required value={form.name} onChange={(event) => set('name', event.target.value)} placeholder="Enter a name" /></label>
    {isShopkeepers ? <>
      <div className="modal-fields"><label>Area / city<input required value={form.area} onChange={(event) => set('area', event.target.value)} placeholder="e.g. Lahore" /></label><label>Contact number <small>(optional)</small><input value={form.contactNumber} onChange={(event) => set('contactNumber', event.target.value)} placeholder="+92 300 0000000" /></label></div>
      <label>Individual discount (%)<input type="number" min="0" max="100" step="0.01" required value={form.discountPercentage} onChange={(event) => set('discountPercentage', event.target.value)} /></label>
    </> : <label>Fixed sale rate (PKR)<input type="number" min="0.01" step="0.01" required value={form.saleRate} onChange={(event) => set('saleRate', event.target.value)} placeholder="0.00" /></label>}
    <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={busy}>{busy ? 'Saving…' : record._id ? 'Save changes' : 'Add record'}<ArrowRight size={16} /></button></div>
  </form></Modal>;
}

function InvoiceModal({ invoice, onClose, notify }) {
  if (!invoice) return null;
  return <Modal onClose={onClose} wide><div className="invoice-preview">
    <div className="preview-toolbar"><div><span className="eyebrow">{invoice.isDraft ? 'DRAFT · NOT SAVED' : 'INVOICE PREVIEW'}</span><h2>{invoice.invoiceNumber}</h2></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div>
    <InvoicePaper invoice={invoice} />
    {invoice.isDraft ? <p className="draft-preview-note">This preview is not saved. Save the invoice to assign its invoice number and enable printing or download.</p> : <div className="preview-actions"><button className="secondary-button" onClick={() => printInvoice(invoice, notify)}><Printer size={16} />Print invoice</button><button className="primary-button" onClick={() => downloadInvoice(invoice, notify).catch((error) => notify?.(`PDF could not be generated: ${error.message}`))}><ArrowDownToLine size={16} />Download PDF</button></div>}
  </div></Modal>;
}

function InvoicePaper({ invoice }) {
  return <div className="invoice-paper">
    <div className="paper-top"><div><div className="paper-brand"><span>ALM</span> {COMPANY_NAME}</div><small>AUTHORIZED DISTRIBUTOR</small><small className="paper-brands">{DISTRIBUTED_BRANDS}</small></div><div className="paper-invoice-label">INVOICE<strong>{invoice.invoiceNumber}</strong><span>{dateLabel(invoice.invoiceDate)}</span></div></div>
    <div className="paper-rule" />
    <div className="paper-billto"><div><span className="paper-label">BILLED TO</span><b>{invoice.shopkeeper.name}</b><span>{invoice.shopkeeper.code}</span><span>{invoice.shopkeeper.area}</span>{invoice.shopkeeper.contactNumber && <span>{invoice.shopkeeper.contactNumber}</span>}</div><div className="paper-discount"><span className="paper-label">SHOPKEEPER DISCOUNT</span><b>{invoice.discountPercentage}%</b></div></div>
    <table className="paper-table"><thead><tr><th>#</th><th>PRODUCT</th><th>QTY</th><th>UNIT RATE</th><th>AMOUNT</th></tr></thead><tbody>{invoice.products.map((product, index) => <tr key={`${product.productCode}-${index}`}><td>{String(index + 1).padStart(2, '0')}</td><td><b>{product.productName}</b><small>{product.productCode}</small></td><td>{product.quantity}</td><td>{money(product.unitRate)}</td><td>{money(product.lineTotal)}</td></tr>)}</tbody></table>
    <div className="paper-bottom"><div className="paper-thanks"><span>Thank you for your business.</span><small>We appreciate your continued partnership.</small></div><div className="paper-totals"><div><span>Subtotal</span><b>{money(invoice.subtotal)}</b></div><div><span>Discount ({invoice.discountPercentage}%)</span><b className="discount-value">− {money(invoice.discountAmount)}</b></div><div className="paper-grand"><span>Grand total</span><b>{money(invoice.grandTotal)}</b></div></div></div>
    <div className="paper-footer">{COMPANY_NAME} <span>·</span> DISTRIBUTOR: {DISTRIBUTED_BRANDS} <span>·</span> PAKISTAN</div>
  </div>;
}

function Modal({ children, onClose, wide }) {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className={`modal-panel ${wide ? 'modal-wide' : ''}`}>{children}</div></div>;
}

async function downloadInvoice(invoice, notify) {
  const { default: jsPDF } = await import('jspdf');
  const pdf = new jsPDF();
  const left = 18;
  pdf.setTextColor(72, 72, 65);
  pdf.setFontSize(20);
  pdf.text(COMPANY_NAME, left, 21);
  pdf.setFontSize(10);
  pdf.setTextColor(125, 125, 115);
  pdf.text('AUTHORIZED DISTRIBUTOR', left, 28);
  pdf.setFontSize(9);
  pdf.text('Jhonson White | Becute | MMadam', left, 35);
  pdf.setFontSize(11);
  pdf.text('INVOICE', 145, 19);
  pdf.setFontSize(14);
  pdf.setTextColor(55, 55, 50);
  pdf.text(invoice.invoiceNumber, 145, 26);
  pdf.setFontSize(10);
  pdf.setTextColor(125, 125, 115);
  pdf.text(dateLabel(invoice.invoiceDate), 145, 35);
  pdf.setDrawColor(229, 226, 220);
  pdf.line(left, 42, 192, 42);
  pdf.setFontSize(10);
  pdf.text('BILLED TO', left, 53);
  pdf.setFontSize(14);
  pdf.setTextColor(55, 55, 50);
  pdf.text(invoice.shopkeeper.name, left, 56);
  pdf.setFontSize(10);
  pdf.setTextColor(125, 125, 115);
  pdf.text(`${invoice.shopkeeper.code}  ·  ${invoice.shopkeeper.area}`, left, 62);
  pdf.text(`Discount: ${invoice.discountPercentage}%`, 145, 56);
  let y = 76;
  pdf.setFillColor(247, 246, 243);
  pdf.rect(left, y - 7, 174, 13, 'F');
  pdf.setTextColor(100, 100, 92);
  pdf.setFontSize(10);
  pdf.text('PRODUCT', left + 3, y + 1);
  pdf.text('QTY', 116, y + 1);
  pdf.text('RATE', 139, y + 1);
  pdf.text('AMOUNT', 168, y + 1);
  y += 14;
  invoice.products.forEach((product, index) => {
    if (y > 255) { pdf.addPage(); y = 24; }
    pdf.setTextColor(65, 65, 58);
    pdf.setFontSize(10);
    pdf.text(`${product.productName} (${product.productCode})`, left + 3, y);
    pdf.text(String(product.quantity), 116, y);
    pdf.text(money(product.unitRate), 139, y);
    pdf.text(money(product.lineTotal), 168, y);
    y += 10;
    if (index < invoice.products.length - 1) {
      pdf.setDrawColor(239, 237, 232);
      pdf.line(left, y - 4, 192, y - 4);
    }
  });
  y += 8;
  pdf.setDrawColor(229, 226, 220);
  pdf.line(122, y - 4, 192, y - 4);
  pdf.setTextColor(110, 110, 103);
  pdf.text('Subtotal', 124, y + 3); pdf.text(money(invoice.subtotal), 191, y + 3, { align: 'right' });
  pdf.text(`Discount (${invoice.discountPercentage}%)`, 124, y + 11); pdf.text(`- ${money(invoice.discountAmount)}`, 191, y + 11, { align: 'right' });
  pdf.setTextColor(55, 55, 50); pdf.setFontSize(14);
  pdf.text('Grand total', 124, y + 23); pdf.text(money(invoice.grandTotal), 191, y + 23, { align: 'right' });
  pdf.save(`${invoice.invoiceNumber}.pdf`);
  notify?.('PDF downloaded.');
}

function printInvoice(invoice, notify) {
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    notify?.('Allow pop-ups in your browser to print this invoice.');
    return;
  }
  printWindow.opener = null;
  const rows = invoice.products.map((product, index) => `<tr><td>${String(index + 1).padStart(2, '0')}</td><td><b>${escapeHtml(product.productName)}</b><small>${escapeHtml(product.productCode)}</small></td><td>${product.quantity}</td><td>${money(product.unitRate)}</td><td>${money(product.lineTotal)}</td></tr>`).join('');
  printWindow.document.write(`<!doctype html><html><head><title>${escapeHtml(invoice.invoiceNumber)}</title><style>
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#383a35;margin:0;padding:52px;font-size:14px}.top{display:flex;justify-content:space-between;align-items:flex-start}.brand{font-size:25px;font-weight:bold}.muted{color:#85867f;font-size:12px;letter-spacing:.5px;margin-top:7px}.right{text-align:right}.right b{display:block;font-size:16px;margin:7px 0}.rule{border-top:1px solid #e8e5df;margin:22px 0}.bill{display:flex;justify-content:space-between;margin-bottom:30px}.bill b{display:block;font-size:17px;margin:8px 0}.label{font-size:11px;letter-spacing:.5px;color:#777}.discount{font-size:21px;font-weight:bold;margin-top:8px}table{width:100%;border-collapse:collapse}th{text-align:left;color:#62645d;font-size:11px;letter-spacing:.4px;background:#f7f6f3;padding:12px 9px}td{padding:14px 9px;border-bottom:1px solid #eeece8}td small{display:block;color:#777;margin-top:5px}.bottom{display:flex;justify-content:space-between;margin-top:25px}.thanks{color:#666;font-size:13px;line-height:1.8}.totals{width:260px}.totals div{display:flex;justify-content:space-between;padding:7px 0}.grand{border-top:1px solid #ddd9d2;margin-top:5px;padding-top:12px!important;font-size:17px;font-weight:bold}@media print{body{padding:24px}}</style></head><body><div class="top"><div><div class="brand">${COMPANY_NAME}</div><div class="muted">AUTHORIZED DISTRIBUTOR</div><div class="muted">Jhonson White | Becute | MMadam</div></div><div class="right"><span class="label">INVOICE</span><b>${escapeHtml(invoice.invoiceNumber)}</b>${dateLabel(invoice.invoiceDate)}</div></div><div class="rule"></div><div class="bill"><div><span class="label">BILLED TO</span><b>${escapeHtml(invoice.shopkeeper.name)}</b>${escapeHtml(invoice.shopkeeper.code)}<br>${escapeHtml(invoice.shopkeeper.area)}</div><div><span class="label">SHOPKEEPER DISCOUNT</span><div class="discount">${invoice.discountPercentage}%</div></div></div><table><thead><tr><th>#</th><th>PRODUCT</th><th>QTY</th><th>UNIT RATE</th><th>AMOUNT</th></tr></thead><tbody>${rows}</tbody></table><div class="bottom"><div class="thanks">Thank you for your business.<br>We appreciate your continued partnership.<br>Distributor: Jhonson White, Becute and MMadam</div><div class="totals"><div><span>Subtotal</span><b>${money(invoice.subtotal)}</b></div><div><span>Discount (${invoice.discountPercentage}%)</span><b>− ${money(invoice.discountAmount)}</b></div><div class="grand"><span>Grand total</span><b>${money(invoice.grandTotal)}</b></div></div></div><script>window.onload=()=>window.print()</script></body></html>`);
  printWindow.document.close();
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

export default App;
