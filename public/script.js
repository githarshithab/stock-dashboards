const socket = io();
const email = localStorage.getItem("email");

socket.emit("login", email);

let stocks = {};

function subscribe() {
  const stock = document.getElementById("stockSelect").value;
  socket.emit("subscribe", stock);

  if (!stocks[stock]) {
    stocks[stock] = 0;
    render();
  }
}

socket.on("stockUpdate", updates => {
  Object.keys(updates).forEach(stock => {
    stocks[stock] = updates[stock];
  });
  render();
});

function render() {
  const list = document.getElementById("stockList");
  list.innerHTML = "";

  Object.keys(stocks).forEach(stock => {
    const li = document.createElement("li");
    li.textContent = `${stock}: $${stocks[stock]}`;
    list.appendChild(li);
  });
}
