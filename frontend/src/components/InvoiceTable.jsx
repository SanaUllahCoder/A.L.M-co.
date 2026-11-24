import { ChevronDown, FileText } from 'lucide-react';
import { dateLabel, money } from '../utils.js';

export default function InvoiceTable({ invoices, onSelect, emptyMessage }) {
  return (
    <div className="table-card">
      <table className="data-table invoice-list-table">
        <thead>
          <tr>
            <th>INVOICE</th>
            <th>SHOPKEEPER</th>
            <th>ORDER BROUGHT BY</th>
            <th>DATE</th>
            <th>ITEMS</th>
            <th>GRAND TOTAL</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {invoices.length ? invoices.map((invoice) => (
            <tr
              key={invoice._id}
              onClick={() => onSelect?.(invoice)}
              className={onSelect ? 'clickable-row' : ''}
            >
              <td><span className="invoice-number">{invoice.invoiceNumber}</span></td>
              <td>
                <div className="table-person">
                  <span className="person-dot">{invoice.shopkeeper.name.slice(0, 1).toUpperCase()}</span>
                  <span><b>{invoice.shopkeeper.name}</b><small>{invoice.shopkeeper.code}</small></span>
                </div>
              </td>
              <td className="seller-cell">{invoice.sellerName || '—'}</td>
              <td className="muted-cell">{dateLabel(invoice.invoiceDate)}</td>
              <td className="muted-cell">
                {invoice.products.length} {invoice.products.length === 1 ? 'item' : 'items'}
              </td>
              <td className="money-cell">{money(invoice.grandTotal)}</td>
              <td><ChevronDown className="row-chevron" size={16} /></td>
            </tr>
          )) : (
            <tr>
              <td colSpan="7">
                <div className="empty-state">
                  <div className="empty-icon"><FileText size={21} /></div>
                  <b>No invoices yet</b>
                  <span>{emptyMessage}</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
