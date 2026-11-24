import { ArrowDownToLine, Pencil, Printer, X } from 'lucide-react';
import Modal from './Modal.jsx';
import { InvoicePaper, downloadInvoice, printInvoice } from './InvoiceDocument.jsx';

export default function InvoicePreviewModal({ invoice, onClose, notify, onEdit }) {
  if (!invoice) return null;

  return (
    <Modal onClose={onClose} wide>
      <div className="invoice-preview">
        <div className="preview-toolbar">
          <div>
            <span className="eyebrow">{invoice.isDraft ? 'DRAFT · NOT SAVED' : 'INVOICE PREVIEW'}</span>
            <h2>{invoice.invoiceNumber}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close preview"><X size={18} /></button>
        </div>
        <InvoicePaper invoice={invoice} />
        {invoice.isDraft ? (
          <p className="draft-preview-note">
            This preview is not saved. Save the invoice to assign its invoice number and enable printing or download.
          </p>
        ) : (
          <div className="preview-actions">
            {onEdit && (
              <button className="secondary-button" onClick={onEdit}>
                <Pencil size={15} />Edit invoice
              </button>
            )}
            <button className="secondary-button" onClick={() => printInvoice(invoice, notify)}>
              <Printer size={16} />Print invoice
            </button>
            <button
              className="primary-button"
              onClick={() => downloadInvoice(invoice, notify).catch((error) => notify?.(`PDF could not be generated: ${error.message}`))}
            >
              <ArrowDownToLine size={16} />Download PDF
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
