import React, { useState, useEffect } from "react";

function DonationHistory({ web3, donationTrackingContract, accounts, onGoBack }) {
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!donationTrackingContract || !accounts || accounts.length === 0) return;
      setLoading(true);
      setStatus("");
      try {
        const medicalId = accounts[0];
        const donations = await donationTrackingContract.methods.getDonationsByDonor(medicalId).call();
        setHistory(Array.isArray(donations) ? donations : []);
        if (!Array.isArray(donations)) {
          setStatus("Donation history data is not an array.");
        }
      } catch (error) {
        setStatus("Error fetching donation history: " + error.message);
        setHistory([]);
      }
      setLoading(false);
    };
    fetchHistory();
  }, [donationTrackingContract, accounts]);

  if (!web3 || !donationTrackingContract || !accounts || accounts.length === 0) {
    return <div className="component"><p>Loading contracts and accounts...</p></div>;
  }

  return (
    <div className="component">
      <h2>Donation History</h2>
      {loading && <p>Loading...</p>}
      {status && <p>{status}</p>}
      <ul>
        {history.length === 0 && <li>No donation history found.</li>}
        {history.map((don, idx) => (
          <li key={idx}>
            Bank: {don.bankId}, Date: {new Date(Number(don.timestamp) * 1000).toLocaleDateString()}
          </li>
        ))}
      </ul>
      <button onClick={onGoBack}>Go Back</button>
    </div>
  );
}

export default DonationHistory;
