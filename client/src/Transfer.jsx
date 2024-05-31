import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { Buffer } from "buffer";

function Transfer({ address, privateKey, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const transaction = { sender: address, recipient, amount: parseInt(sendAmount) };
      const message = JSON.stringify(transaction);
      const messageHash = toHex(utf8ToBytes(message));

      const privateKeyBuffer = Buffer.from(privateKey, 'hex');
      const [signature, recoveryBit] = await secp.secp256k1.sign(messageHash, privateKeyBuffer, { recovered: true });

      const body = {
        transaction,
        signature: toHex(signature),
        recoveryBit,
      };

      const response = await server.post(`send`, body);
      if (response && response.data) {
        const { balance } = response.data;
        setBalance(balance);
      } else {
        console.error("Unexpected response format:", response);
        alert("An error occurred while processing the transaction.");
      }
    } catch (error) {
      console.error("Error in transfer:", error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("An error occurred while processing the transaction.");
      }
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type in the public key to receive the transaction"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;