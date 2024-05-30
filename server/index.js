const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

// public keys
const balances = {
  "03ef38b17e7f732415cbae954cc6200c0ef7d367e81c48c4fa21a1a4bea53a5288": 100,
  "0230bbacca8e039a1508b5f90abf69c9c2eb3bc2c74572745ac358bd5b956ff8d3": 50,
  "030d8d2b136c5a785c625cb2e926e60ad07c7b37dfd1387052e366b6111d60a7c4": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // get signature from the client-side application
  //recover the public key from the signature
  //verify the signature with the public key
  const { sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
