import mongoose from 'mongoose';

const shopkeeperSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  name: { type: String, required: true, trim: true },
  contactNumber: { type: String, default: '', trim: true },
  area: { type: String, required: true, trim: true },
  discountPercentage: { type: Number, required: true, min: 0, max: 100 }
}, { timestamps: true });

export default mongoose.model('Shopkeeper', shopkeeperSchema);
