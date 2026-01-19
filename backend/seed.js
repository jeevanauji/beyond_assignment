const mongoose = require('mongoose');
const Products = require('./models/Products');

const products = [
  {
    title: 'Laptops',
    description: 'High-performance laptops for work and gaming',
    priceStart: 499,
    mainImage: 'https://i.imgur.com/O0GMYuw.jpg',
    thumbnails: [
      'https://i.imgur.com/ILEU18M.jpg',
      'https://i.imgur.com/2kePJmX.jpg'
    ]
  },
  {
    title: 'Mobiles',
    description: 'Latest smartphones at affordable prices',
    priceStart: 50,
    mainImage: 'https://i.imgur.com/uRgdVY1.jpg',
    thumbnails: [
      'https://i.imgur.com/VwSKS7A.jpg',
      'https://i.imgur.com/gTvZ2H5.jpg'
    ]
  },
  {
    title: 'Accessories',
    description: 'Cool gadgets and accessories',
    priceStart: 9,
    mainImage: 'https://i.imgur.com/0jO40CF.jpg',
    thumbnails: [
      'https://i.imgur.com/dWYAg41.jpg',
      'https://i.imgur.com/5oQEZSC.jpg'
    ]
  }
];

mongoose
  .connect('mongodb://127.0.0.1:27017/jeevan')
  .then(async () => {
    await Products.deleteMany(); // Clear old data
    await Products.insertMany(products);
    console.log('✅ Products added successfully');
    mongoose.connection.close();
  })
  .catch((err) => console.error('❌ Error:', err));
