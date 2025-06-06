import React, { useState } from "react";

const backgroundStyle = {
  backgroundImage: 'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80")',
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  zIndex: -1,
};

const overlayStyle = {
  position: "fixed",
  top: 120,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(255, 255, 255, 0.6)",
  zIndex: 0,
};

const contentStyle = {
  position: "relative",
  zIndex: 1,
  padding: "20px",
};

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
    <>
      <div style={backgroundStyle}></div>
      <div style={overlayStyle}></div>
      <div className="component" style={contentStyle}>
        <h2>Register as Donor</h2>
        <label htmlFor="name">Full Name</label>
        <input id="name" type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} disabled={loading} />
        
        <label htmlFor="age">Age</label>
        <input id="age" type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} disabled={loading} />
        
        <label htmlFor="gender">Gender</label>
        <input id="gender" type="text" placeholder="Gender" value={gender} onChange={e => setGender(e.target.value)} disabled={loading} />
        
        <label htmlFor="medicalId">Medical ID</label>
        <input id="medicalId" type="text" placeholder="Medical ID" value={medicalId} onChange={e => setMedicalId(e.target.value)} disabled={loading} />
        
        <label htmlFor="bloodGroup">Blood Group</label>
        <select id="bloodGroup" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} disabled={loading}>
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
        
        <label htmlFor="weight">Weight (kg)</label>
        <input id="weight" type="number" placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} disabled={loading} />
        
        <label htmlFor="password">Password</label>
        <input id="password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
        
        <div className="button-group">
          <button onClick={registerDonor} disabled={loading}>{loading ? "Registering..." : "Register"}</button>
          <button onClick={onGoBack} disabled={loading} className="secondary-button">Go Back</button>
        </div>
      </div>
    </>
  );
}

export default DonorRegistration;
