import { dateLabel, money } from '../utils.js';
import { COMPANY_NAME, DISTRIBUTED_BRANDS } from '../config/brand.js';

export function InvoicePaper({ invoice }) {
  return (
    <div className="invoice-paper">
      <div className="paper-top">
        <div>
          <div className="paper-brand"><span>ALM</span> {COMPANY_NAME}</div>
          <small>AUTHORIZED DISTRIBUTOR</small>
          <small className="paper-brands">{DISTRIBUTED_BRANDS}</small>
        </div>
        <div className="paper-invoice-label">
          INVOICE<strong>{invoice.invoiceNumber}</strong><span>{dateLabel(invoice.invoiceDate)}</span>
        </div>
      </div>
      <div className="paper-rule" />
      <div className="paper-billto">
        <div>
          <span className="paper-label">BILLED TO</span>
          <b>{invoice.shopkeeper.name}</b>
          <span>{invoice.shopkeeper.code}</span>
          <span>{invoice.shopkeeper.area}</span>
          {invoice.shopkeeper.contactNumber && <span>{invoice.shopkeeper.contactNumber}</span>}
        </div>
        <div className="paper-seller">
          <span className="paper-label">ORDER BROUGHT BY</span>
          <b>{invoice.sellerName || '—'}</b>
        </div>
        <div className="paper-discount">
          <span className="paper-label">SHOPKEEPER DISCOUNT</span>
          <b>{invoice.discountPercentage}%</b>
        </div>
      </div>
      <table className="paper-table">
        <thead>
          <tr><th>#</th><th>PRODUCT</th><th>QTY</th><th>UNIT RATE</th><th>AMOUNT</th></tr>
        </thead>
        <tbody>
          {invoice.products.map((product, index) => (
            <tr key={`${product.productCode}-${index}`}>
              <td>{String(index + 1).padStart(2, '0')}</td>
              <td><b>{product.productName}</b><small>{product.productCode}</small></td>
              <td>{product.quantity}</td>
              <td>{money(product.unitRate)}</td>
              <td>{money(product.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="paper-bottom">
        <div className="paper-thanks">
          <span>Thank you for your business.</span>
          <small>We appreciate your continued partnership.</small>
        </div>
        <div className="paper-totals">
          <div><span>Subtotal</span><b>{money(invoice.subtotal)}</b></div>
          <div><span>Discount ({invoice.discountPercentage}%)</span><b className="discount-value">− {money(invoice.discountAmount)}</b></div>
          <div className="paper-grand"><span>Grand total</span><b>{money(invoice.grandTotal)}</b></div>
        </div>
      </div>
      <div className="paper-footer">
        {COMPANY_NAME} <span>·</span> DISTRIBUTOR: {DISTRIBUTED_BRANDS} <span>·</span> PAKISTAN
      </div>
    </div>
  );
}

export async function downloadInvoice(invoice, notify) {
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
  pdf.setFontSize(10);
  pdf.text('ORDER BROUGHT BY', left, 72);
  pdf.setFontSize(12);
  pdf.text(invoice.sellerName || '—', left + 36, 72);
  let y = 84;
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
    if (y > 255) {
      pdf.addPage();
      y = 24;
    }
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
  pdf.text('Subtotal', 124, y + 3);
  pdf.text(money(invoice.subtotal), 191, y + 3, { align: 'right' });
  pdf.text(`Discount (${invoice.discountPercentage}%)`, 124, y + 11);
  pdf.text(`- ${money(invoice.discountAmount)}`, 191, y + 11, { align: 'right' });
  pdf.setTextColor(55, 55, 50);
  pdf.setFontSize(14);
  pdf.text('Grand total', 124, y + 23);
  pdf.text(money(invoice.grandTotal), 191, y + 23, { align: 'right' });
  pdf.save(`${invoice.invoiceNumber}.pdf`);
  notify?.('PDF downloaded.');
}

export function printInvoice(invoice, notify) {
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    notify?.('Allow pop-ups in your browser to print this invoice.');
    return;
  }
  printWindow.opener = null;
  const rows = invoice.products.map((product, index) => (
    `<tr><td>${String(index + 1).padStart(2, '0')}</td><td><b>${escapeHtml(product.productName)}</b><small>${escapeHtml(product.productCode)}</small></td><td>${product.quantity}</td><td>${money(product.unitRate)}</td><td>${money(product.lineTotal)}</td></tr>`
  )).join('');
  printWindow.document.write(`<!doctype html><html><head><title>${escapeHtml(invoice.invoiceNumber)}</title><style>
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#383a35;margin:0;padding:52px;font-size:14px}.top{display:flex;justify-content:space-between;align-items:flex-start}.brand{font-size:25px;font-weight:bold}.muted{color:#85867f;font-size:12px;letter-spacing:.5px;margin-top:7px}.right{text-align:right}.right b{display:block;font-size:16px;margin:7px 0}.rule{border-top:1px solid #e8e5df;margin:22px 0}.bill{display:flex;justify-content:space-between;gap:22px;margin-bottom:30px}.bill b{display:block;font-size:17px;margin:8px 0}.label{font-size:11px;letter-spacing:.5px;color:#777}.discount{font-size:21px;font-weight:bold;margin-top:8px}table{width:100%;border-collapse:collapse}th{text-align:left;color:#62645d;font-size:11px;letter-spacing:.4px;background:#f7f6f3;padding:12px 9px}td{padding:14px 9px;border-bottom:1px solid #eeece8}td small{display:block;color:#777;margin-top:5px}.bottom{display:flex;justify-content:space-between;margin-top:25px}.thanks{color:#666;font-size:13px;line-height:1.8}.totals{width:260px}.totals div{display:flex;justify-content:space-between;padding:7px 0}.grand{border-top:1px solid #ddd9d2;margin-top:5px;padding-top:12px!important;font-size:17px;font-weight:bold}@media print{body{padding:24px}}</style></head><body><div class="top"><div><div class="brand">${COMPANY_NAME}</div><div class="muted">AUTHORIZED DISTRIBUTOR</div><div class="muted">Jhonson White | Becute | MMadam</div></div><div class="right"><span class="label">INVOICE</span><b>${escapeHtml(invoice.invoiceNumber)}</b>${dateLabel(invoice.invoiceDate)}</div></div><div class="rule"></div><div class="bill"><div><span class="label">BILLED TO</span><b>${escapeHtml(invoice.shopkeeper.name)}</b>${escapeHtml(invoice.shopkeeper.code)}<br>${escapeHtml(invoice.shopkeeper.area)}</div><div><span class="label">ORDER BROUGHT BY</span><b>${escapeHtml(invoice.sellerName || '—')}</b></div><div><span class="label">SHOPKEEPER DISCOUNT</span><div class="discount">${invoice.discountPercentage}%</div></div></div><table><thead><tr><th>#</th><th>PRODUCT</th><th>QTY</th><th>UNIT RATE</th><th>AMOUNT</th></tr></thead><tbody>${rows}</tbody></table><div class="bottom"><div class="thanks">Thank you for your business.<br>We appreciate your continued partnership.<br>Distributor: Jhonson White, Becute and MMadam</div><div class="totals"><div><span>Subtotal</span><b>${money(invoice.subtotal)}</b></div><div><span>Discount (${invoice.discountPercentage}%)</span><b>− ${money(invoice.discountAmount)}</b></div><div class="grand"><span>Grand total</span><b>${money(invoice.grandTotal)}</b></div></div></div><script>window.onload=()=>window.print()</script></body></html>`);
  printWindow.document.close();
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}
