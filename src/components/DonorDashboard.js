import React, { useState, useEffect } from "react";
import Incentives from "./Incentives";

function DonorDashboard({ web3, donorManagementContract, bloodBankManagementContract, donationTrackingContract, accounts, medicalId, onGoToHistory, onGoBack }) {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showIncentives, setShowIncentives] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [infectionComments, setInfectionComments] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!donorManagementContract || !bloodBankManagementContract || !donationTrackingContract || !medicalId) return;
      setLoading(true);
      setStatus("");
      try {
        const exists = await donorManagementContract.methods.donorExists(medicalId).call();
        if (!exists) {
          setStatus("Donor not found. Please register.");
          setProfile(null);
          setInfectionComments([]);
          setDonationHistory([]);
        } else {
          const data = await donorManagementContract.methods.getDonor(medicalId).call();
          setProfile({
            name: data[0],
            age: data[1],
            gender: data[2],
            medicalId: medicalId,
            bloodGroup: data[3],
            weight: data[4],
            donationCount: data[5],
          });
          // Fetch infection comments from bloodBankManagementContract
          const comments = await bloodBankManagementContract.methods.getInfectionComments(medicalId).call();
          setInfectionComments(comments);
          // Fetch donation history from donationTrackingContract
          const history = await donationTrackingContract.methods.getDonationsByDonor(medicalId).call();
          setDonationHistory(history);
        }
      } catch (error) {
        setStatus("Error fetching donor profile: " + error.message);
        setProfile(null);
        setInfectionComments([]);
        setDonationHistory([]);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [donorManagementContract, bloodBankManagementContract, donationTrackingContract, medicalId]);

  const handleGoToIncentives = () => {
    setShowIncentives(true);
  };

  const handleGoBackFromIncentives = () => {
    setShowIncentives(false);
  };

  const handleToggleHistory = () => {
    setShowHistory(!showHistory);
  };

  if (!web3 || !donorManagementContract || !bloodBankManagementContract || !donationTrackingContract || !accounts || accounts.length === 0) {
    return <div className="component"><p>Loading contracts and accounts...</p></div>;
  }

  if (showIncentives) {
    return (
      <Incentives
        web3={web3}
        contract={donorManagementContract}
        accounts={accounts}
        medicalId={profile?.medicalId}
        onGoBack={handleGoBackFromIncentives}
      />
    );
  }

  return (
    <div className="component">
      <h2>Donor Dashboard</h2>
      {loading && <p>Loading...</p>}
      {status && <p>{status}</p>}
      {profile && !showHistory && (
        <div>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Age:</strong> {profile.age}</p>
          <p><strong>Gender:</strong> {profile.gender}</p>
          <p><strong>Medical ID:</strong> {profile.medicalId}</p>
          <p><strong>Blood Group:</strong> {profile.bloodGroup}</p>
          <p><strong>Weight:</strong> {profile.weight}</p>
          <h4>Infection Comments</h4>
          <ul>
            {infectionComments.length === 0 && <li>No comments.</li>}
            {infectionComments.map((c, idx) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
        </div>
      )}
      {showHistory && (
        <div>
          <h3>Donation History</h3>
          {donationHistory.length === 0 && <p>No donation history available.</p>}
          <ul>
            {donationHistory.map((don, idx) => (
              <li key={idx}>
                <p><strong>Donation #{idx + 1}</strong></p>
                <p>Date: {new Date(Number(don.timestamp) * 1000).toLocaleDateString()}</p>
                <p>Bank ID: {don.bankId}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Added Donation History button back as per user request */}
      <button onClick={handleToggleHistory} style={{ marginRight: "10px" }}>
        {showHistory ? "View Profile" : "View Donation History"}
      </button>
      {/* <button onClick={onGoBack}>Go Back</button> */}
      <button onClick={onGoBack}>Go Back</button>
    </div>
  );
}

export default DonorDashboard;
