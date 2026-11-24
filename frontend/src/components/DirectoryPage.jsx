import { useCallback, useEffect, useState } from 'react';
import { BadgePercent, Plus, Search, ShoppingBag, Trash2, Users } from 'lucide-react';
import api, { getErrorMessage } from '../api.js';
import { money } from '../utils.js';
import RecordModal from './RecordModal.jsx';

export default function DirectoryPage({ kind, notify }) {
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
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }, [endpoint, search]);

  useEffect(() => {
    const timer = window.setTimeout(load, 200);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function remove(record) {
    if (!window.confirm(`Delete ${record.name}?`)) return;
    try {
      await api.delete(`${endpoint}/${record._id}`);
      notify(`${isShopkeepers ? 'Shopkeeper' : 'Product'} deleted.`);
      load();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function save(record) {
    try {
      if (dialog?._id) await api.put(`${endpoint}/${dialog._id}`, record);
      else await api.post(endpoint, record);
      setDialog(null);
      notify(`${isShopkeepers ? 'Shopkeeper' : 'Product'} ${dialog?._id ? 'updated' : 'added'}.`);
      load();
    } catch (requestError) {
      throw new Error(getErrorMessage(requestError));
    }
  }

  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR DIRECTORY</span>
          <h1>{title}</h1>
          <p>{isShopkeepers ? 'Manage customer details and their individual discounts.' : 'Manage products and their shared sale rates.'}</p>
        </div>
        <button className="primary-button" onClick={() => setDialog({})}>
          <Plus size={17} />Add {isShopkeepers ? 'shopkeeper' : 'product'}
        </button>
      </div>
      <div className="directory-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()} by code or name…`} />
        </div>
        <span className="count-pill">{records.length} {records.length === 1 ? 'record' : 'records'}</span>
      </div>
      {error && <div className="error-banner">{error}</div>}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>{isShopkeepers ? 'SHOPKEEPER' : 'PRODUCT'}</th>
              <th>CODE</th>
              {isShopkeepers ? <><th>AREA / CITY</th><th>CONTACT</th><th>DISCOUNT</th></> : <th>SALE RATE</th>}
              <th />
            </tr>
          </thead>
          <tbody>
            {records.length ? records.map((record) => (
              <tr key={record._id}>
                <td>
                  <div className="table-person">
                    <span className={`person-dot ${isShopkeepers ? '' : 'product-dot'}`}>{record.name.slice(0, 1).toUpperCase()}</span>
                    <b>{record.name}</b>
                  </div>
                </td>
                <td><span className="code-pill">{record.code}</span></td>
                {isShopkeepers ? (
                  <>
                    <td className="muted-cell">{record.area}</td>
                    <td className="muted-cell">{record.contactNumber || '—'}</td>
                    <td><span className="discount-tag"><BadgePercent size={14} />{record.discountPercentage}%</span></td>
                  </>
                ) : <td className="money-cell">{money(record.saleRate)}</td>}
                <td>
                  <div className="row-actions">
                    <button onClick={() => setDialog(record)} className="edit-action">Edit</button>
                    <button onClick={() => remove(record)} className="delete-action" aria-label={`Delete ${record.name}`}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={isShopkeepers ? 6 : 4}>
                  <div className="empty-state">
                    <div className="empty-icon">{isShopkeepers ? <Users size={20} /> : <ShoppingBag size={20} />}</div>
                    <b>No {title.toLowerCase()} found</b>
                    <span>Add one to start using it on invoices.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {dialog && (
        <RecordModal
          kind={kind}
          record={dialog}
          onClose={() => setDialog(null)}
          onSave={save}
        />
      )}
    </div>
  );
}
