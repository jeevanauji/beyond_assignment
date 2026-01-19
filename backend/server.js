const express = require('express');
const http = require('http');
const app = express();
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const Product = require('./models/Products');
const port = process.env.PORT || 3000;
const authRoutes = require("./routes/auth.js");
const products = require("./routes/products.js");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const orderRoutes = require("./routes/orders");
const deliveryBoyRoutes = require("./routes/deliveryboy");
const env = require('dotenv');
const { Server } = require("socket.io");
const os = require('os');

env.config();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://jigsawpuzzles.in", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", products);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/delivery-boy", deliveryBoyRoutes);
 
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);
  socket.on("joinDeliveryRoom", (deliveryBoyId) => {
    if (!deliveryBoyId) return;
    socket.join(`delivery:${deliveryBoyId}`);
    console.log(`Delivery boy ${deliveryBoyId} joined room delivery:${deliveryBoyId}`);
  });
  socket.on("joinPublic", () => {
    socket.join("publicOrders");
    console.log("Client joined room: publicOrders");
  });
  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

app.get("/api/profile", (req, res) => {
  res.json({ message: "Profile route (example)" });
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jeevan';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

app.get('/prod', async (req, res) => {
  try {
    const products = await Product.find();
    console.log(products);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/health', (req, res) => {
  const mem = process.memoryUsage();
  const health = {
    status: mongoose.connection.readyState === 1 ? 'ok' : 'fail',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: {
      rss: mem.rss,
      heapUsed: mem.heapUsed
    },
    host: os.hostname()
  };
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server + Socket.IO running on port ${port}`);
});
