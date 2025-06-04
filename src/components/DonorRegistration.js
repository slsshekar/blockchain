import React, { useState } from "react";

function DonorRegistration({ web3, contract, accounts, onRegisterSuccess, onGoBack }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [medicalId, setMedicalId] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [weight, setWeight] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const registerDonor = async () => {
    if (!web3 || !contract || accounts.length === 0) {
      alert("Web3, contract, or accounts not loaded yet.");
      return;
    }
    if (!name || !age || !gender || !medicalId || !bloodGroup || !weight || !password) {
      alert("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await contract.methods
        .registerDonor(name, parseInt(age), gender, medicalId, bloodGroup, parseInt(weight), password)
        .send({ from: accounts[0] });
      alert("Donor Registered Successfully");
      if (onRegisterSuccess) onRegisterSuccess();
      } catch (error) {
      console.error("Error registering donor:", error);
      alert("Failed to register donor. See console for details. Error: " + (error.message || error));
    }
    setLoading(false);
  };

  return (
    <div className="component">
      <h2>Register as Donor</h2>
      <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} disabled={loading} />
      <input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} disabled={loading} />
      <input type="text" placeholder="Gender" value={gender} onChange={e => setGender(e.target.value)} disabled={loading} />
      <input type="text" placeholder="Medical ID" value={medicalId} onChange={e => setMedicalId(e.target.value)} disabled={loading} />
      <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} disabled={loading}>
        <option value="">Select Blood Group</option>
        <option value="A+">A+</option>
        <option value="A-">A-</option>
        <option value="B+">B+</option>
        <option value="B-">B-</option>
        <option value="AB+">AB+</option>
        <option value="AB-">AB-</option>
        <option value="O+">O+</option>
        <option value="O-">O-</option>
      </select>
      <input type="number" placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} disabled={loading} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
      <button onClick={registerDonor} disabled={loading}>{loading ? "Registering..." : "Register"}</button>
      <button onClick={onGoBack} disabled={loading} style={{ marginLeft: "10px" }}>Go Back</button>
    </div>
  );
}

export default DonorRegistration;
