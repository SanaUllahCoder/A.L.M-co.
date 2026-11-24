import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api, { getErrorMessage } from '../api.js';
import InvoiceEditModal from '../components/InvoiceEditModal.jsx';
import InvoicePreviewModal from '../components/InvoicePreviewModal.jsx';
import InvoiceTable from '../components/InvoiceTable.jsx';

export default function InvoiceHistoryPage({ notify }) {
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/invoices', {
        params: {
          search: search || undefined,
          from: from || undefined,
          to: to || undefined
        }
      });
      setInvoices(data);
      setError('');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }, [search, from, to]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  function handleSaved(updated) {
    setEditing(null);
    setSelected(updated);
    load();
    notify('Invoice updated successfully.');
  }

  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div>
          <span className="eyebrow">RECORDS</span>
          <h1>Invoice history</h1>
          <p>Find, review and reprint previous invoices.</p>
        </div>
        <span className="count-pill">{invoices.length} invoices</span>
      </div>
      <div className="filter-bar">
        <div className="search-field">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search invoice, shopkeeper or seller…"
          />
        </div>
        <label className="filter-date">
          <span>From</span>
          <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label className="filter-date">
          <span>To</span>
          <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </label>
        {(search || from || to) && (
          <button className="clear-filters" onClick={() => {
            setSearch('');
            setFrom('');
            setTo('');
          }}>
            Clear
          </button>
        )}
      </div>
      {error && <div className="error-banner">{error}</div>}
      <InvoiceTable
        invoices={invoices}
        onSelect={setSelected}
        emptyMessage="No invoices match your search."
      />
      {selected && (
        <InvoicePreviewModal
          invoice={selected}
          onClose={() => setSelected(null)}
          notify={notify}
          onEdit={() => {
            setEditing(selected);
            setSelected(null);
          }}
        />
      )}
      {editing && (
        <InvoiceEditModal
          invoice={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
