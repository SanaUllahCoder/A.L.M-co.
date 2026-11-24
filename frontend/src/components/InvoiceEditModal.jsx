import { useState } from 'react';
import { BadgePercent, Check, Plus, Search, Store, Trash2, X } from 'lucide-react';
import api, { getErrorMessage } from '../api.js';
import { money } from '../utils.js';
import Modal from './Modal.jsx';

export default function InvoiceEditModal({ invoice, onClose, onSaved }) {
  const [shopCode, setShopCode] = useState(invoice.shopkeeper.code);
  const [shopkeeper, setShopkeeper] = useState({
    ...invoice.shopkeeper,
    discountPercentage: invoice.discountPercentage
  });
  const [shopError, setShopError] = useState('');
  const [sellerName, setSellerName] = useState(invoice.sellerName ?? '');
  const [invoiceDate, setInvoiceDate] = useState(new Date(invoice.invoiceDate).toISOString().slice(0, 10));
  const [rows, setRows] = useState(invoice.products.map((product, index) => ({
    rowKey: `original-${index}`,
    originalIndex: index,
    productCode: product.productCode,
    productName: product.productName,
    quantity: product.quantity,
    unitRate: product.unitRate,
    resolved: true
  })));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const shopkeeperUnchanged = shopCode.trim().toUpperCase() === invoice.shopkeeper.code.toUpperCase();
  const discountPercentage = shopkeeperUnchanged ? invoice.discountPercentage : shopkeeper?.discountPercentage ?? 0;
  const subtotal = Math.round(rows.reduce((sum, row) => {
    const lineTotal = Math.round((Number(row.quantity) || 0) * (Number(row.unitRate) || 0) * 100) / 100;
    return sum + lineTotal;
  }, 0) * 100) / 100;
  const discountAmount = Math.round(subtotal * discountPercentage) / 100;
  const grandTotal = Math.round((subtotal - discountAmount) * 100) / 100;

  async function lookupShopkeeper(code) {
    setShopError('');
    if (!code.trim()) {
      setShopkeeper(null);
      return;
    }
    if (code.trim().toUpperCase() === invoice.shopkeeper.code.toUpperCase()) {
      setShopkeeper({ ...invoice.shopkeeper, discountPercentage: invoice.discountPercentage });
      return;
    }
    try {
      const { data } = await api.get(`/shopkeepers/by-code/${encodeURIComponent(code.trim())}`);
      setShopkeeper(data);
    } catch (requestError) {
      setShopkeeper(null);
      setShopError(getErrorMessage(requestError));
    }
  }

  async function lookupProduct(index, code) {
    setError('');
    const row = rows[index];
    if (!row || !code.trim()) {
      setRows((current) => current.map((item, i) => i === index
        ? { ...item, productName: '', unitRate: 0, resolved: false }
        : item));
      return;
    }
    const original = row.originalIndex === null ? null : invoice.products[row.originalIndex];
    if (original && original.productCode.toUpperCase() === code.trim().toUpperCase()) {
      setRows((current) => current.map((item, i) => i === index
        ? { ...item, productCode: original.productCode, productName: original.productName, unitRate: original.unitRate, resolved: true }
        : item));
      return;
    }
    try {
      const { data } = await api.get(`/products/by-code/${encodeURIComponent(code.trim())}`);
      setRows((current) => current.map((item, i) => i === index
        ? { ...item, productCode: data.code, productName: data.name, unitRate: data.saleRate, resolved: true }
        : item));
    } catch (requestError) {
      setRows((current) => current.map((item, i) => i === index
        ? { ...item, productName: '', unitRate: 0, resolved: false }
        : item));
      setError(getErrorMessage(requestError));
    }
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!sellerName.trim()) { setError('Enter the seller name who brought this order.'); return; }
    if (!shopCode.trim()) { setError('Enter a shopkeeper code.'); return; }
    if (!rows.length || rows.some((row) => !row.productCode.trim())) { setError('Enter a product code for every row.'); return; }
    if (rows.some((row) => !isValidQuantity(row.quantity))) { setError('Product quantities must be positive whole numbers.'); return; }

    setBusy(true);
    try {
      const verifiedRows = await Promise.all(rows.map(async (row) => {
        const original = row.originalIndex === null ? null : invoice.products[row.originalIndex];
        if (original && original.productCode.toUpperCase() === row.productCode.trim().toUpperCase()) {
          return {
            ...row,
            productCode: original.productCode,
            productName: original.productName,
            unitRate: original.unitRate,
            resolved: true
          };
        }
        if (row.resolved) return row;
        const { data } = await api.get(`/products/by-code/${encodeURIComponent(row.productCode.trim())}`);
        return { ...row, productCode: data.code, productName: data.name, unitRate: data.saleRate, resolved: true };
      }));

      const { data } = await api.put(`/invoices/${invoice._id}`, {
        shopkeeperCode: shopCode.trim(),
        sellerName: sellerName.trim(),
        invoiceDate,
        products: verifiedRows.map(({ productCode, quantity, originalIndex }) => ({
          productCode,
          quantity: Number(quantity),
          originalIndex
        }))
      });
      onSaved(data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose} wide>
      <form className="invoice-edit-form" onSubmit={submit}>
        <div className="modal-heading">
          <div><span className="eyebrow">EDIT SAVED INVOICE</span><h2>{invoice.invoiceNumber}</h2></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close edit invoice"><X size={18} /></button>
        </div>
        <p className="edit-invoice-note">
          Use codes to select the correct records when names are similar. Unchanged rates and discounts stay as originally invoiced; changing a code uses the current catalogue rate or discount.
        </p>
        {error && <div className="error-banner">{error}</div>}
        <div className="edit-invoice-fields">
          <label>
            Shopkeeper code <span className="required">*</span>
            <div className={`input-with-status ${shopError ? 'input-error' : ''}`}>
              <input
                value={shopCode}
                onChange={(event) => {
                  setShopCode(event.target.value);
                  setShopError('');
                  if (event.target.value.trim().toUpperCase() === invoice.shopkeeper.code.toUpperCase()) {
                    setShopkeeper({ ...invoice.shopkeeper, discountPercentage: invoice.discountPercentage });
                  } else {
                    setShopkeeper(null);
                  }
                }}
                onBlur={() => lookupShopkeeper(shopCode)}
                placeholder="Enter shopkeeper code"
              />
              <Search size={16} />
            </div>
            {shopError && <small className="field-error">{shopError}</small>}
          </label>
          <label>
            Invoice date <span className="required">*</span>
            <input type="date" required value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} />
          </label>
          <label>
            Order brought by <span className="required">*</span>
            <input required maxLength="120" value={sellerName} onChange={(event) => setSellerName(event.target.value)} placeholder="Enter seller's name" />
          </label>
        </div>
        {shopkeeper && (
          <div className="shop-result">
            <div className="shop-result-icon"><Store size={18} /></div>
            <div className="shop-result-main"><b>{shopkeeper.name}</b><span>{shopkeeper.code} · {shopkeeper.area}</span></div>
            <span className="discount-tag"><BadgePercent size={14} />{discountPercentage}% discount</span>
          </div>
        )}
        <section className="edit-products">
          <div className="card-title-row">
            <div>
              <h2>Invoice products</h2>
              <p>Change a product code to replace it with a current catalogue product.</p>
            </div>
          </div>
          <div className="product-table-wrap">
            <table className="product-table">
              <thead><tr><th>PRODUCT CODE</th><th>PRODUCT</th><th>QTY</th><th>UNIT RATE</th><th>AMOUNT</th><th /></tr></thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.rowKey}>
                    <td>
                      <input
                        className={`table-input code-input ${row.resolved ? 'resolved-input' : ''}`}
                        value={row.productCode}
                        onChange={(event) => {
                          setError('');
                          setRows((current) => current.map((item, i) => i === index
                            ? { ...item, productCode: event.target.value, productName: '', unitRate: 0, resolved: false }
                            : item));
                        }}
                        onBlur={() => lookupProduct(index, row.productCode)}
                        placeholder="Enter code"
                      />
                    </td>
                    <td><span className={row.resolved ? 'product-name' : 'placeholder-text'}>{row.productName || 'Look up by code'}</span></td>
                    <td><input className="table-input quantity-input" type="number" min="1" step="1" value={row.quantity} onChange={(event) => setRows((current) => current.map((item, i) => i === index ? { ...item, quantity: event.target.value } : item))} /></td>
                    <td className="rate-cell">{row.resolved ? money(row.unitRate) : '—'}</td>
                    <td className="amount-cell">{row.resolved ? money(calculateLineTotal(row.quantity, row.unitRate)) : '—'}</td>
                    <td>
                      <button type="button" className="remove-row" aria-label="Remove product" onClick={() => setRows((current) => current.filter((_, i) => i !== index))}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="add-row-button"
            onClick={() => setRows((current) => [...current, {
              rowKey: `new-${Date.now()}-${current.length}`,
              originalIndex: null,
              productCode: '',
              productName: '',
              quantity: 1,
              unitRate: 0,
              resolved: false
            }])}
          >
            <Plus size={15} />Add another product
          </button>
        </section>
        <div className="edit-invoice-summary">
          <div><span>Subtotal</span><b>{money(subtotal)}</b></div>
          <div><span>Discount ({discountPercentage}%)</span><b>− {money(discountAmount)}</b></div>
          <div className="edit-grand-total"><span>Grand total</span><strong>{money(grandTotal)}</strong></div>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" disabled={busy}>{busy ? 'Saving changes…' : 'Save invoice changes'}<Check size={16} /></button>
        </div>
      </form>
    </Modal>
  );
}

function isValidQuantity(quantity) {
  return Number.isInteger(Number(quantity)) && Number(quantity) > 0;
}

function calculateLineTotal(quantity, unitRate) {
  return Math.round((Number(quantity) || 0) * (Number(unitRate) || 0) * 100) / 100;
}
