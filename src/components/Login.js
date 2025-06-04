import React, { useState } from "react";

function Login({ role, onLoginSuccess, contract, accounts }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!contract || accounts.length === 0) {
      alert("Contract or accounts not loaded yet.");
      return;
    }
    if (!id || !password) {
      alert("Please enter all fields.");
      return;
    }
    setLoading(true);
    try {
      let isValid = false;
      if (role === "donor") {
        // Check if donor exists before verifying password
        const exists = await contract.methods.donorExists(id).call();
        if (!exists) {
          alert("Donor does not exist.");
          setLoading(false);
          return;
        }
        isValid = await contract.methods.verifyPassword(id, password).call();
      } else if (role === "bloodbank") {
        // Check if blood bank exists before login
        const exists = await contract.methods.bankExists(id).call();
        if (!exists) {
          alert("Blood bank does not exist.");
          setLoading(false);
          return;
        }
        isValid = await contract.methods.loginBloodBank(id, password).call();
      }
      if (isValid) {
        alert("Login successful!");
        onLoginSuccess(id);
      } else {
        alert("Invalid credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. See console for details. Error: " + (error.message || error));
    }
    setLoading(false);
  };

  return (
    <div className="component">
      <h2>{role === "donor" ? "Donor" : "Blood Bank"} Login</h2>
      <input type="text" placeholder={role === "donor" ? "Medical ID" : "Bank ID"} value={id} onChange={e => setId(e.target.value)} disabled={loading} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
      <button onClick={handleLogin} disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
    </div>
  );
}

export default Login;
