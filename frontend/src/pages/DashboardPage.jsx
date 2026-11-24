import { useEffect, useState } from 'react';
import { ArrowRight, BadgePercent, CalendarDays, FilePlus2, FileText, Plus } from 'lucide-react';
import api, { getErrorMessage } from '../api.js';
import { money } from '../utils.js';
import InvoiceTable from '../components/InvoiceTable.jsx';

function StatCard({ label, value, icon: Icon, caption, accent }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${accent ? 'stat-icon-accent' : ''}`}>
        <Icon size={19} strokeWidth={1.8} />
      </div>
      <span className="stat-label">{label}</span>
      <strong className={`stat-value ${String(value).length > 12 ? 'stat-value-small' : ''}`}>{value}</strong>
      <span className="stat-caption">{caption}</span>
    </div>
  );
}

export default function DashboardPage({ onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/dashboard/summary'), api.get('/invoices')])
      .then(([stats, invoices]) => {
        setSummary(stats.data);
        setRecent(invoices.data.slice(0, 5));
      })
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, []);

  return (
    <div className="page-wrap">
      <div className="page-heading dashboard-heading">
        <div>
          <span className="eyebrow">OVERVIEW</span>
          <h1>Welcome to A.L.M &amp; co.</h1>
          <p>Invoice desk for Jhonson White, Becute and MMadam distribution.</p>
        </div>
        <button className="primary-button" onClick={() => onNavigate('create')}>
          <Plus size={17} />Create invoice
        </button>
      </div>
      {error && <div className="error-banner">{error}</div>}
      <div className="stats-grid">
        <StatCard label="Total invoices" value={summary?.totalInvoices ?? '—'} icon={FileText} caption="All invoices issued" />
        <StatCard label="Invoices today" value={summary?.todayInvoices ?? '—'} icon={CalendarDays} caption="Created since midnight" accent />
        <StatCard label="Total invoice sales" value={summary ? money(summary.totalSales) : '—'} icon={BadgePercent} caption="Across all invoices" />
      </div>
      <div className="section-heading">
        <div><h2>Recent invoices</h2><p>Your latest billing activity</p></div>
        <button className="text-button" onClick={() => onNavigate('history')}>
          View all invoices <ArrowRight size={15} />
        </button>
      </div>
      <InvoiceTable invoices={recent} emptyMessage="Your latest invoices will appear here." />
      <div className="quick-note">
        <div className="quick-icon"><FilePlus2 size={18} /></div>
        <div>
          <b>Ready for your next invoice?</b>
          <span>Look up a shopkeeper and add products by their codes.</span>
        </div>
        <button className="text-button" onClick={() => onNavigate('create')}>
          Start one <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
