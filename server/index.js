const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const secp256k1 = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "030410aca059e46e9a57f638fab485482b67eae869d7a877421244b6aed1f6bf68": 100,
  "0260d897e3e8b3319c9ffa60f696abb4f48e8dcd1cc1400a93eeeea0cbbb070df4": 50,
  "024762cd63bb0911bbc8a62659502206e96e17af0cdfc61d36700da9549869e84a": 75, //2405530b5f176b655a03237dc65f5547aeef8f96a35dc95c56e665f0d0edbcf0
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { transaction, signature, recoveryBit } = req.body;
  if (!transaction || !signature || recoveryBit === undefined) {
    return res.status(400).send({ message: "Invalid transaction data" });
  }

  const { sender, recipient, amount } = transaction;

  const message = JSON.stringify(transaction);
  const messageHash = toHex(utf8ToBytes(message));

  try {
    const publicKeyRecovered = secp256k1.recoverPublicKey(messageHash, Buffer.from(signature, 'hex'), recoveryBit);
    const publicKey = toHex(publicKeyRecovered);

    if (publicKey !== sender) {
      return res.status(400).send({ message: "Invalid signature" });
    }

    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } catch (error) {
    return res.status(400).send({ message: "Error processing transaction" });
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
