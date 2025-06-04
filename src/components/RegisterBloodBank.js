import React, { useState } from "react";

function RegisterBloodBank({ web3, contract, accounts, onRegisterSuccess, onGoBack }) {
  const [name, setName] = useState("");
  const [bankId, setBankId] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const registerBank = async () => {
    if (!web3 || !contract || accounts.length === 0) {
      alert("Web3, contract, or accounts not loaded yet.");
      return;
    }
    if (!name || !bankId || !location || !password) {
      alert("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await contract.methods
        .registerBloodBank(name, bankId, location, password)
        .send({ from: accounts[0] });
      alert("Blood Bank Registered Successfully");
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (error) {
      console.error("Error registering blood bank:", error);
      alert("Failed to register blood bank. See console for details.");
    }
    setLoading(false);
  };

  return (
    <div className="component">
      <h2>Register Blood Bank</h2>
      <input type="text" placeholder="Bank Name" value={name} onChange={e => setName(e.target.value)} disabled={loading} />
      <input type="text" placeholder="Bank ID" value={bankId} onChange={e => setBankId(e.target.value)} disabled={loading} />
      <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} disabled={loading} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
      <button onClick={registerBank} disabled={loading}>{loading ? "Registering..." : "Register"}</button>
      <button onClick={onGoBack} disabled={loading} style={{ marginLeft: "10px" }}>Go Back</button>
    </div>
  );
}

export default RegisterBloodBank;
