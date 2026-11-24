import mongoose from 'mongoose';

const invoiceLineSchema = new mongoose.Schema({
  productCode: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitRate: { type: Number, required: true },
  lineTotal: { type: Number, required: true }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  invoiceDate: { type: Date, required: true, default: Date.now },
  shopkeeper: {
    code: { type: String, required: true },
    name: { type: String, required: true },
    area: { type: String, required: true },
    contactNumber: { type: String, default: '' }
  },
  sellerName: { type: String, required: true, trim: true, maxlength: 120 },
  products: { type: [invoiceLineSchema], required: true, validate: (lines) => lines.length > 0 },
  subtotal: { type: Number, required: true },
  discountPercentage: { type: Number, required: true },
  discountAmount: { type: Number, required: true },
  grandTotal: { type: Number, required: true }
}, { timestamps: true });

invoiceSchema.index({ invoiceDate: -1 });
invoiceSchema.index({ 'shopkeeper.code': 1 });
invoiceSchema.index({ 'shopkeeper.name': 1 });

export default mongoose.model('Invoice', invoiceSchema);
