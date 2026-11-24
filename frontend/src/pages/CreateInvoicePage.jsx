import { useMemo, useState } from 'react';
import { BadgePercent, Check, FileText, Plus, Search, Store, Trash2, ArrowRight } from 'lucide-react';
import api, { getErrorMessage } from '../api.js';
import { money } from '../utils.js';
import InvoicePreviewModal from '../components/InvoicePreviewModal.jsx';

export default function CreateInvoicePage({ onSaved, notify }) {
  const [shopCode, setShopCode] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [shopkeeper, setShopkeeper] = useState(null);
  const [shopError, setShopError] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([emptyProductRow()]);
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
    if (!code.trim()) {
      update({ productName: '', unitRate: 0, resolved: false });
      return;
    }
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
    if (!sellerName.trim()) { setError('Enter the seller name who brought this order.'); return; }
    if (!shopkeeper && !shopCode.trim()) { setError('Enter a shopkeeper code before previewing.'); return; }
    if (!rows.length || rows.some((row) => !row.productCode.trim())) { setError('Enter a valid product code for every row.'); return; }
    if (rows.some((row) => !isValidQuantity(row.quantity))) { setError('Product quantities must be positive whole numbers.'); return; }
    setBusy(true);
    try {
      const activeShopkeeper = shopkeeper ?? (await api.get(`/shopkeepers/by-code/${encodeURIComponent(shopCode.trim())}`)).data;
      const verifiedRows = await Promise.all(rows.map((row) => verifyProductRow(row)));
      const products = verifiedRows.map((row) => ({
        productCode: row.productCode,
        productName: row.productName,
        quantity: Number(row.quantity),
        unitRate: row.unitRate,
        lineTotal: calculateLineTotal(row.quantity, row.unitRate)
      }));
      const previewSubtotal = calculateSubtotal(products);
      const discountAmount = Math.round(previewSubtotal * activeShopkeeper.discountPercentage) / 100;
      setPreview({
        invoiceNumber: 'PREVIEW',
        invoiceDate,
        shopkeeper: snapshotShopkeeper(activeShopkeeper),
        sellerName: sellerName.trim(),
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
    if (!sellerName.trim()) { setError('Enter the seller name who brought this order.'); return; }
    if (!shopkeeper && !shopCode.trim()) { setError('Enter a shopkeeper code before continuing.'); return; }
    if (!rows.length || rows.some((row) => !row.productCode.trim())) { setError('Enter a product code for every row.'); return; }
    if (rows.some((row) => !isValidQuantity(row.quantity))) { setError('Product quantities must be positive whole numbers.'); return; }
    setBusy(true);
    try {
      const activeShopkeeper = shopkeeper ?? (await api.get(`/shopkeepers/by-code/${encodeURIComponent(shopCode.trim())}`)).data;
      const verifiedRows = await Promise.all(rows.map((row) => verifyProductRow(row)));
      const { data } = await api.post('/invoices', {
        shopkeeperCode: activeShopkeeper.code,
        sellerName: sellerName.trim(),
        invoiceDate,
        products: verifiedRows.map(({ productCode, quantity }) => ({
          productCode,
          quantity: Number(quantity)
        }))
      });
      onSaved();
      notify('Invoice saved successfully.');
      setPreview(data);
      setRows([emptyProductRow()]);
      setShopCode('');
      setSellerName('');
      setShopkeeper(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div>
          <span className="eyebrow">BILLING</span>
          <h1>Create an invoice</h1>
          <p>Enter a shopkeeper and add products by code.</p>
        </div>
        <span className="draft-badge"><span />NEW INVOICE</span>
      </div>
      {error && <div className="error-banner">{error}</div>}
      <div className="invoice-layout">
        <div className="invoice-main">
          <section className="form-card">
            <div className="card-title-row">
              <div className="card-step">01</div>
              <div><h2>Invoice details</h2><p>Choose who you’re billing and when.</p></div>
            </div>
            <div className="form-grid">
              <label>
                Shopkeeper code <span className="required">*</span>
                <div className={`input-with-status ${shopError ? 'input-error' : ''}`}>
                  <input
                    value={shopCode}
                    onChange={(event) => { setShopCode(event.target.value); setShopkeeper(null); }}
                    onBlur={() => lookupShopkeeper(shopCode)}
                    onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), lookupShopkeeper(shopCode))}
                    placeholder="e.g. SHOP-001"
                  />
                  <Search size={16} />
                </div>
                {shopError && <small className="field-error">{shopError}</small>}
              </label>
              <label>
                Invoice date <span className="required">*</span>
                <input type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} />
              </label>
            </div>
            <label className="seller-input">
              Order brought by <span className="required">*</span>
              <input
                required
                maxLength="120"
                value={sellerName}
                onChange={(event) => setSellerName(event.target.value)}
                placeholder="Enter seller's name"
                autoComplete="name"
              />
            </label>
            {shopkeeper ? (
              <div className="shop-result">
                <div className="shop-result-icon"><Store size={18} /></div>
                <div className="shop-result-main">
                  <b>{shopkeeper.name}</b>
                  <span>{shopkeeper.code} <i>·</i> {shopkeeper.area}</span>
                </div>
                <span className="discount-tag"><BadgePercent size={14} />{shopkeeper.discountPercentage}% discount</span>
              </div>
            ) : (
              <div className="lookup-hint">
                <Search size={15} />Enter a shopkeeper code to automatically apply their discount.
              </div>
            )}
          </section>
          <section className="form-card products-card">
            <div className="card-title-row">
              <div className="card-step">02</div>
              <div><h2>Products</h2><p>Add the items on this invoice.</p></div>
              <span className="items-count">{rows.length} {rows.length === 1 ? 'item' : 'items'}</span>
            </div>
            <div className="product-table-wrap">
              <table className="product-table">
                <thead><tr><th>PRODUCT CODE</th><th>PRODUCT</th><th>QTY</th><th>UNIT RATE</th><th>AMOUNT</th><th /></tr></thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          className={`table-input code-input ${row.resolved ? 'resolved-input' : ''}`}
                          value={row.productCode}
                          onChange={(event) => {
                            setError('');
                            updateRow(index, { productCode: event.target.value, productName: '', unitRate: 0, resolved: false });
                          }}
                          onBlur={() => lookupProduct(index, row.productCode)}
                          onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), lookupProduct(index, row.productCode))}
                          placeholder="Enter code"
                        />
                      </td>
                      <td><span className={row.resolved ? 'product-name' : 'placeholder-text'}>{row.productName || 'Auto-filled'}</span></td>
                      <td><input className="table-input quantity-input" type="number" min="1" step="1" value={row.quantity} onChange={(event) => updateRow(index, { quantity: event.target.value })} /></td>
                      <td className="rate-cell">{row.resolved ? money(row.unitRate) : '—'}</td>
                      <td className="amount-cell">{row.resolved ? money(calculateLineTotal(row.quantity, row.unitRate)) : '—'}</td>
                      <td>
                        <button className="remove-row" aria-label="Remove product" onClick={() => setRows((current) => current.length > 1 ? current.filter((_, i) => i !== index) : current.map((item, i) => i === index ? emptyProductRow() : item))}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="add-row-button" onClick={() => setRows((current) => [...current, emptyProductRow()])}>
              <Plus size={15} />Add another product
            </button>
          </section>
        </div>
        <aside className="summary-card">
          <div className="summary-heading">
            <div className="summary-heading-icon"><FileText size={17} /></div>
            <div><h2>Summary</h2><span>Invoice totals</span></div>
          </div>
          <div className="summary-line">
            <span>Subtotal <small>({rows.filter((row) => row.resolved).length} products)</small></span>
            <b>{money(subtotal)}</b>
          </div>
          <div className="summary-line">
            <span>Shopkeeper discount <small>{shopkeeper ? `${shopkeeper.discountPercentage}%` : '—'}</small></span>
            <b className="discount-value">− {money(discount)}</b>
          </div>
          <div className="summary-total"><span>Grand total</span><strong>{money(grandTotal)}</strong></div>
          <div className="summary-meta"><span>Currency</span><b>PKR · Pakistani Rupee</b></div>
          <div className="summary-actions">
            <button className="secondary-button summary-preview" disabled={busy} onClick={previewInvoice}>
              <FileText size={15} />Preview invoice
            </button>
            <button className="primary-button summary-save" disabled={busy} onClick={saveInvoice}>
              {busy ? 'Saving invoice…' : 'Save invoice'}<ArrowRight size={16} />
            </button>
          </div>
          <p className="summary-foot"><Check size={14} />Rates and discount are saved with this invoice.</p>
        </aside>
      </div>
      {preview && <InvoicePreviewModal invoice={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

function emptyProductRow() {
  return { productCode: '', productName: '', quantity: 1, unitRate: 0, resolved: false };
}

function isValidQuantity(quantity) {
  return Number.isInteger(Number(quantity)) && Number(quantity) > 0;
}

async function verifyProductRow(row) {
  if (row.resolved) return row;
  const { data } = await api.get(`/products/by-code/${encodeURIComponent(row.productCode.trim())}`);
  return { ...row, productCode: data.code, productName: data.name, unitRate: data.saleRate, resolved: true };
}

function snapshotShopkeeper(shopkeeper) {
  return {
    code: shopkeeper.code,
    name: shopkeeper.name,
    area: shopkeeper.area,
    contactNumber: shopkeeper.contactNumber
  };
}

function calculateLineTotal(quantity, unitRate) {
  return Math.round((Number(quantity) || 0) * (Number(unitRate) || 0) * 100) / 100;
}

function calculateSubtotal(products) {
  return Math.round(products.reduce((sum, product) => sum + product.lineTotal, 0) * 100) / 100;
}
