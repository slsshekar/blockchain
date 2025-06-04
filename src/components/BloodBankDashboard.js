import React, { useState, useEffect } from "react";

function BloodBankDashboard({ web3, bloodBankManagementContract, donationTrackingContract, donorManagementContract, accounts, onGoBack }) {
  const [bankIds, setBankIds] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [donations, setDonations] = useState([]);
  const [donorInfo, setDonorInfo] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [donationComments, setDonationComments] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Fetch bank IDs owned by this account
  useEffect(() => {
    const fetchBankIds = async () => {
      if (!bloodBankManagementContract || !accounts || accounts.length === 0) return;
      try {
        const ids = await bloodBankManagementContract.methods.getBloodBankOwners(accounts[0]).call();
        setBankIds(ids);
        if (ids.length > 0) setSelectedBank(ids[0]);
      } catch (error) {
        setStatus("Error fetching your blood banks: " + error.message);
      }
    };
    fetchBankIds();
  }, [bloodBankManagementContract, accounts]);

  // Fetch all donations for this bank
  useEffect(() => {
    const fetchDonations = async () => {
      if (!donationTrackingContract || !selectedBank) return;
      setLoading(true);
      setStatus("");
      try {
        // Instead of accessing donations(i), try to fetch all donations for this bank
        // If getAllDonations is not available, explain to the user how to add it
        if (!donationTrackingContract.methods.getAllDonations) {
          setStatus("getAllDonations() is not available in the contract. Please add it for robust dashboard functionality.");
          setLoading(false);
          return;
        }
        const allDonations = await donationTrackingContract.methods.getAllDonations().call();
        const filtered = allDonations.filter(d => d.bankId === selectedBank);
        setDonations(filtered);
        // Fetch donor info for each donation
        let donorInfoMap = {};
        for (const d of filtered) {
          if (!donorInfoMap[d.medicalId]) {
            try {
              const info = await donorManagementContract.methods.getDonor(d.medicalId).call();
              donorInfoMap[d.medicalId] = info;
            } catch {
              donorInfoMap[d.medicalId] = null;
            }
          }
        }
      setDonorInfo(donorInfoMap);
    } catch (error) {
      setStatus("Error fetching donations: " + error.message);
      setDonations([]);
      setDonationComments({});
      setLoading(false);
      return;
    }

    // Fetch comments for each donation
    let commentsMap = {};
    for (const donation of donations) {
      try {
        const comments = await bloodBankManagementContract.methods.getInfectionComments(donation.timestamp).call();
        commentsMap[donation.timestamp] = comments;
      } catch {
        commentsMap[donation.timestamp] = [];
      }
    }
    setDonationComments(commentsMap);

    setLoading(false);
  };
  fetchDonations();
}, [donationTrackingContract, bloodBankManagementContract, donorManagementContract, selectedBank]);

  // Add infection comment to a donation
  const addComment = async (medicalId, donationIndex) => {
    if (!commentInputs[donationIndex] || !medicalId) return;
    setLoading(true);
    setStatus("");
    try {
      await bloodBankManagementContract.methods.addInfectionComment(medicalId, commentInputs[donationIndex]).send({ from: accounts[0] });
      setStatus("Comment added successfully!");
      setCommentInputs({ ...commentInputs, [donationIndex]: "" });
    } catch (error) {
      setStatus("Error adding comment: " + error.message);
    }
    setLoading(false);
  };

  // Record a donation for a donor
  const [recordMedicalId, setRecordMedicalId] = useState("");
  const [recordStatus, setRecordStatus] = useState("");
  const recordDonation = async () => {
    if (!recordMedicalId || !selectedBank) {
      setRecordStatus("Please enter a donor Medical ID.");
      return;
    }
    setLoading(true);
    setRecordStatus("");
    try {
      // Check if donor is registered before recording donation
      const donorExists = await donorManagementContract.methods.donorExists(recordMedicalId).call();
      if (!donorExists) {
        setRecordStatus("Donor is not registered. Cannot record donation.");
        setLoading(false);
        return;
      }
      if (!donationTrackingContract.methods.recordDonation) {
        setRecordStatus("recordDonation method not found in contract.");
        setLoading(false);
        return;
      }
      await donationTrackingContract.methods.recordDonation(recordMedicalId, selectedBank).send({ from: accounts[0] });

      // Fetch donor info to get blood group
      const donorInfo = await donorManagementContract.methods.getDonor(recordMedicalId).call();
      // getDonor returns tuple: (name, age, gender, bloodGroup, weight, donationCount)
      const bloodGroup = donorInfo[3]; // bloodGroup is 4th element

      console.log("Donor blood group:", bloodGroup);
      console.log("Selected bank:", selectedBank);

      if (selectedBank && bloodGroup && bloodGroup.trim() !== "") {
        // Update blood units in BloodBankManagement contract
        try {
          const receipt = await bloodBankManagementContract.methods.addBloodUnits(selectedBank, bloodGroup, 1).send({ from: accounts[0] });
          console.log("addBloodUnits transaction receipt:", receipt);
        } catch (err) {
          console.error("Error calling addBloodUnits:", err);
          throw err;
        }
      }

      setRecordStatus("Donation recorded successfully!");
      setRecordMedicalId("");
    } catch (error) {
      console.error("Error in recordDonation:", error);
      setRecordStatus("Error recording donation: " + (error.message || JSON.stringify(error)));
    }
    setLoading(false);
  };

  return (
    <div className="component">
      <h2>Blood Bank Dashboard</h2>
      {/* Remove dropdown if only one bank per account */}
      {bankIds.length > 0 && (
        <div>
          <strong>Bank ID:</strong> {bankIds[0]}
        </div>
      )}
      <hr />
      {/* Record Donation Form */}
      <h3>Record Donation</h3>
      <input
        type="text"
        placeholder="Donor Medical ID"
        value={recordMedicalId}
        onChange={e => setRecordMedicalId(e.target.value)}
        disabled={loading}
      />
      <button onClick={recordDonation} disabled={loading || !recordMedicalId}>
        Record Donation
      </button>
      {recordStatus && <p>{recordStatus}</p>}
      <hr />
      <h3>Donations at this Bank</h3>
      {loading && <p>Loading donations...</p>}
      {donations.length === 0 && <p>No donations recorded yet.</p>}
      <ul>
        {donations.map((don, idx) => (
          <li key={idx} style={{ marginBottom: "1em", border: "1px solid #eee", borderRadius: 6, padding: 10 }}>
            <div><strong>Donor Medical ID:</strong> {don.medicalId}</div>
            <div><strong>Date:</strong> {new Date(Number(don.timestamp) * 1000).toLocaleDateString()}</div>
            {donorInfo[don.medicalId] && (
              <div>
                <strong>Donor Info:</strong>
                <ul>
                  <li>Name: {donorInfo[don.medicalId][0]}</li>
                  <li>Age: {donorInfo[don.medicalId][1]}</li>
                  <li>Gender: {donorInfo[don.medicalId][2]}</li>
                  <li>Blood Group: {donorInfo[don.medicalId][3]}</li>
                  <li>Weight: {donorInfo[don.medicalId][4]}</li>
                  <li>Donation Count: {donorInfo[don.medicalId][5]}</li>
                </ul>
              </div>
            )}
            <div style={{ marginTop: 8 }}>
              <input
                type="text"
                placeholder="Add comment..."
                value={commentInputs[don.timestamp] || ""}
                onChange={e => setCommentInputs({ ...commentInputs, [don.timestamp]: e.target.value })}
                disabled={loading}
              />
              <button onClick={() => addComment(don.medicalId, don.timestamp)} disabled={loading || !commentInputs[don.timestamp]}>Add Comment</button>
            </div>
            <div style={{ marginTop: 8 }}>
              <strong>Comments:</strong>
              {donationComments[don.timestamp] && donationComments[don.timestamp].length > 0 ? (
                <ul>
                  {donationComments[don.timestamp].map((comment, idx) => (
                    <li key={idx}>{comment}</li>
                  ))}
                </ul>
              ) : (
                <p>No comments.</p>
              )}
            </div>
          </li>
        ))}
      </ul>
      {status && <p>{status}</p>}
      <button onClick={onGoBack} style={{ marginTop: "10px" }}>Go Back</button>
    </div>
  );
}

export default BloodBankDashboard;
