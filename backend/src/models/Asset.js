const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    coinName: { type: String, required: true, trim: true },
    symbol: { type: String, required: true, trim: true, uppercase: true },
    quantity: { type: Number, required: true, min: 0 },
    buyPrice: { type: Number, required: true, min: 0 },
    currentPrice: { type: Number, required: true, min: 0 },
    portfolioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

assetSchema.virtual('investment').get(function () {
  return this.quantity * this.buyPrice;
});
assetSchema.virtual('currentValue').get(function () {
  return this.quantity * this.currentPrice;
});
assetSchema.virtual('profit').get(function () {
  return this.currentValue - this.investment;
});
assetSchema.virtual('profitPercentage').get(function () {
  return this.investment === 0 ? 0 : (this.profit / this.investment) * 100;
});

assetSchema.set('toJSON', { virtuals: true });
assetSchema.set('toObject', { virtuals: true });

assetSchema.index({ symbol: 'text', coinName: 'text' });

module.exports = mongoose.model('Asset', assetSchema);
