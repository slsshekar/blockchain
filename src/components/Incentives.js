import React, { useState, useEffect } from "react";

function Incentives({ web3, contract, accounts, medicalId, onGoBack }) {
  const [donationCount, setDonationCount] = useState(0);
  const [incentiveClaimed, setIncentiveClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchIncentiveStatus = async () => {
      if (!contract || !medicalId) return;
      try {
        const donor = await contract.methods.getDonor(medicalId).call();
        setDonationCount(Number(donor.donationCount));
        // incentiveClaimed is not returned by getDonor, so we check by calling a public mapping or event
        // For now, assume incentiveClaimed is false and rely on error handling on claim
        setIncentiveClaimed(false);
      } catch (err) {
        setMessage("Error fetching incentive status");
      }
    };
    fetchIncentiveStatus();
  }, [contract, medicalId]);

  const claimIncentive = async () => {
    if (!contract || !medicalId || accounts.length === 0) return;
    setLoading(true);
    setMessage("");
    try {
      await contract.methods.claimIncentive(medicalId).send({ from: accounts[0] });
      setIncentiveClaimed(true);
      setMessage("Incentive claimed successfully!");
    } catch (err) {
      setMessage("Error claiming incentive: " + err.message);
    }
    setLoading(false);
  };

  const incentiveAmount = donationCount * 10; // 10 wei per donation as per contract

  return (
    <div className="component">
      <h2>Incentives</h2>
      <p>Medical ID: {medicalId}</p>
      <p>Total Donations: {donationCount}</p>
      <p>Incentive Amount: {incentiveAmount} wei</p>
      {incentiveClaimed ? (
        <p style={{ color: "green" }}>You have already claimed your incentive.</p>
      ) : (
        <button onClick={claimIncentive} disabled={loading || donationCount === 0}>
          {loading ? "Claiming..." : "Claim Incentive"}
        </button>
      )}
      {message && <p>{message}</p>}
      <button onClick={onGoBack} style={{ marginTop: "10px" }}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default Incentives;
