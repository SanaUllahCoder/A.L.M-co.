import { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import Modal from './Modal.jsx';

export default function RecordModal({ kind, record, onClose, onSave }) {
  const isShopkeepers = kind === 'shopkeepers';
  const [form, setForm] = useState({
    code: record.code ?? '',
    name: record.name ?? '',
    area: record.area ?? '',
    contactNumber: record.contactNumber ?? '',
    discountPercentage: record.discountPercentage ?? 0,
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
        ? {
          code: form.code,
          name: form.name,
          area: form.area,
          contactNumber: form.contactNumber,
          discountPercentage: Number(form.discountPercentage)
        }
        : { code: form.code, name: form.name, saleRate: Number(form.saleRate) };
      await onSave(payload);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <form className="record-form" onSubmit={submit}>
        <div className="modal-heading">
          <div>
            <span className="eyebrow">{record._id ? 'EDIT DETAILS' : 'NEW RECORD'}</span>
            <h2>{record._id ? 'Edit' : 'Add'} {isShopkeepers ? 'shopkeeper' : 'product'}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close form">
            <X size={18} />
          </button>
        </div>
        {error && <div className="error-banner">{error}</div>}
        <label>
          {isShopkeepers ? 'Shopkeeper' : 'Product'} code
          <input required maxLength="40" value={form.code} onChange={(event) => set('code', event.target.value)} placeholder={isShopkeepers ? 'e.g. SHOP-001' : 'e.g. PRD-001'} />
        </label>
        <label>
          {isShopkeepers ? 'Shopkeeper' : 'Product'} name
          <input required value={form.name} onChange={(event) => set('name', event.target.value)} placeholder="Enter a name" />
        </label>
        {isShopkeepers ? (
          <>
            <div className="modal-fields">
              <label>Area / city<input required value={form.area} onChange={(event) => set('area', event.target.value)} placeholder="e.g. Lahore" /></label>
              <label>Contact number <small>(optional)</small><input value={form.contactNumber} onChange={(event) => set('contactNumber', event.target.value)} placeholder="+92 300 0000000" /></label>
            </div>
            <label>Individual discount (%)<input type="number" min="0" max="100" step="0.01" required value={form.discountPercentage} onChange={(event) => set('discountPercentage', event.target.value)} /></label>
          </>
        ) : (
          <label>Fixed sale rate (PKR)<input type="number" min="0.01" step="0.01" required value={form.saleRate} onChange={(event) => set('saleRate', event.target.value)} placeholder="0.00" /></label>
        )}
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" disabled={busy}>
            {busy ? 'Saving…' : record._id ? 'Save changes' : 'Add record'}<ArrowRight size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
