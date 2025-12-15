const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public"));

const SUPPORTED_STOCKS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];

// Store stock prices
let stockPrices = {};
SUPPORTED_STOCKS.forEach(stock => {
  stockPrices[stock] = Math.floor(Math.random() * 1000) + 100;
});

// Store user subscriptions
let userSubscriptions = {};

io.on("connection", socket => {
  console.log("User connected:", socket.id);

  socket.on("login", email => {
    userSubscriptions[socket.id] = { email, stocks: [] };
    console.log(`User logged in: ${email}`);
  });

  socket.on("subscribe", stock => {
    if (
      SUPPORTED_STOCKS.includes(stock) &&
      !userSubscriptions[socket.id].stocks.includes(stock)
    ) {
      userSubscriptions[socket.id].stocks.push(stock);
    }
  });

  socket.on("disconnect", () => {
    delete userSubscriptions[socket.id];
    console.log("User disconnected:", socket.id);
  });
});

// Update stock prices every second
setInterval(() => {
  SUPPORTED_STOCKS.forEach(stock => {
    stockPrices[stock] += Math.floor(Math.random() * 10 - 5);
  });

  // Send updates only to subscribed users
  for (let socketId in userSubscriptions) {
    const userStocks = userSubscriptions[socketId].stocks;
    let updates = {};

    userStocks.forEach(stock => {
      updates[stock] = stockPrices[stock];
    });

    io.to(socketId).emit("stockUpdate", updates);
  }
}, 1000);

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
