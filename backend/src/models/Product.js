import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  name: { type: String, required: true, trim: true },
  saleRate: { type: Number, required: true, min: 0.01 }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
