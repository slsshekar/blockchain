import React, { useEffect, useState } from "react";
// import Web3 from "web3";
// import bloodDonationContract from "../contracts/BloodDonationABI.json";

function BloodMatch({ web3, contract, accounts, onGoBack }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!contract || !accounts || accounts.length === 0) {
        setStatus("Loading contracts and accounts...");
        setLoading(false);
        return;
      }
      setLoading(true);
      setStatus("");
      try {
        // This is a placeholder: you should implement a real blood match logic based on your contract
        // For now, just set matches to an empty array or some demo data
        setMatches([]);
      } catch (error) {
        setStatus("Error loading matches: " + error.message);
        setMatches([]);
      }
      setLoading(false);
    };
    load();
  }, [contract, accounts]);

  if (loading) {
    return <div className="component"><p>Loading matches...</p></div>;
  }

  return (
    <div className="component">
      <h2>Blood Donation Matches</h2>
      {status && <p>{status}</p>}
      <ul>
        {Array.isArray(matches) && matches.length > 0 ? (
          matches.map((donor, index) => (
            <li key={index}>
              <strong>Name:</strong> {donor.name} | <strong>Blood Group:</strong> {donor.bloodGroup}
            </li>
          ))
        ) : (
          <li>No matches found.</li>
        )}
      </ul>
      {onGoBack && <button onClick={onGoBack}>Go Back</button>}
    </div>
  );
}

export default BloodMatch;
