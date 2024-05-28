import server from "./server";
import * as secp256k1 from "ethereum-cryptography/secp256k1";

function Wallet({
  address,
  setAddFress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
}) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    const address = secp256k1.getPublicKey(privateKey);
    setAddFress(address);
    setPrivateKey(privateKey);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key{/* never include a private key in a real world project  */}
        <input
          placeholder="Type in a private key"
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
