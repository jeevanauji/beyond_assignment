const mongoose  = require('mongoose');

const productsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priceStart: {
    type: Number,
    required: true
  },
  mainImage: {
    type: String,
    required: true
  },
  thumbnails: [
    {
      type: String
    }
  ]
});

const Product = mongoose.model('Product', productsSchema);
module.exports = Product;
