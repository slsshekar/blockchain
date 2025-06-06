import React, { useState, useEffect } from "react";

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
        if (!donationTrackingContract.methods.getAllDonations) {
          setStatus("getAllDonations() is not available in the contract. Please add it for robust dashboard functionality.");
          setLoading(false);
          return;
        }
        const allDonations = await donationTrackingContract.methods.getAllDonations().call();
        const filtered = allDonations.filter(d => d.bankId === selectedBank);
        setDonations(filtered);
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

      const donorInfo = await donorManagementContract.methods.getDonor(recordMedicalId).call();
      const bloodGroup = donorInfo[3];

      if (selectedBank && bloodGroup && bloodGroup.trim() !== "") {
        try {
          await bloodBankManagementContract.methods.addBloodUnits(selectedBank, bloodGroup, 1).send({ from: accounts[0] });
        } catch (err) {
          throw err;
        }
      }

      setRecordStatus("Donation recorded successfully!");
      setRecordMedicalId("");
    } catch (error) {
      setRecordStatus("Error recording donation: " + (error.message || JSON.stringify(error)));
    }
    setLoading(false);
  };

  return (
    <>
      <div style={backgroundStyle}></div>
      <div style={overlayStyle}></div>
      <div className="component" style={contentStyle}>
        <h2>Blood Bank Dashboard</h2>
        {bankIds.length > 0 && (
          <div>
            <strong>Bank ID:</strong> {bankIds[0]}
          </div>
        )}
        <hr />
        <h3>Record Donation</h3>
        <div className="form-group">
          <label htmlFor="recordMedicalId">Donor Medical ID</label>
          <input
            id="recordMedicalId"
            type="text"
            placeholder="Donor Medical ID"
            value={recordMedicalId}
            onChange={e => setRecordMedicalId(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="button-group">
          <button className="primary-button" onClick={recordDonation} disabled={loading || !recordMedicalId}>
            Record Donation
          </button>
        </div>
        {recordStatus && <p>{recordStatus}</p>}
        <hr />
        <h3>Donations at this Bank</h3>
        {loading && <p>Loading donations...</p>}
        {donations.length === 0 && <p>No donations recorded yet.</p>}
        <ul className="donation-list">
          {donations.map((don, idx) => (
            <li key={idx} className="donation-item">
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
              <div className="comment-section">
                <input
                  type="text"
                  placeholder="Add comment..."
                  value={commentInputs[don.timestamp] || ""}
                  onChange={e => setCommentInputs({ ...commentInputs, [don.timestamp]: e.target.value })}
                  disabled={loading}
                />
                <button className="primary-button" onClick={() => addComment(don.medicalId, don.timestamp)} disabled={loading || !commentInputs[don.timestamp]}>Add Comment</button>
              </div>
              <div className="comments-list">
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
        <div className="button-group" style={{ marginTop: "10px" }}>
          <button className="secondary-button" onClick={onGoBack}>Go Back</button>
        </div>
      </div>
    </>
  );
}

export default BloodBankDashboard;
