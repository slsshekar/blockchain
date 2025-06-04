import React, { useState, useEffect } from "react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function HospitalDashboard({ web3, bloodBankManagementContract, accounts, onGoBack }) {
  const [allBanks, setAllBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("");
  const [bloodUnits, setBloodUnits] = useState({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchAllBanks = async () => {
      if (!bloodBankManagementContract || !accounts || accounts.length === 0) return;
      try {
        const banks = await bloodBankManagementContract.methods.getBloodBankOwners(accounts[0]).call();
        setAllBanks(banks);
        if (banks.length > 0) setSelectedBank(banks[0]);
      } catch (error) {
        setStatus("Error fetching blood banks: " + error.message);
      }
    };
    fetchAllBanks();
  }, [bloodBankManagementContract, accounts]);

  useEffect(() => {
    const fetchBloodUnits = async () => {
      if (!bloodBankManagementContract || !selectedBank) {
        setBloodUnits({});
        return;
      }
      let units = {};
      try {
        for (const bg of BLOOD_GROUPS) {
          const count = await bloodBankManagementContract.methods.getBloodUnits(selectedBank, bg).call();
          units[bg] = count;
        }
        setBloodUnits(units);
      } catch (error) {
        setStatus("Error fetching blood units: " + error.message);
      }
    };
    fetchBloodUnits();
  }, [bloodBankManagementContract, selectedBank]);

  if (!web3 || !bloodBankManagementContract || !accounts || accounts.length === 0) {
    return <div className="component"><p>Loading contracts and accounts...</p></div>;
  }

  const filteredBloodGroups = bloodGroupFilter ? [bloodGroupFilter] : BLOOD_GROUPS;

  return (
    <div className="component">
      <h2>Hospital Dashboard - Blood Units</h2>
      <label>
        Select Blood Bank:
        <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)}>
          {allBanks.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>
      </label>
      <br />
      <label>
        Filter by Blood Group:
        <select value={bloodGroupFilter} onChange={e => setBloodGroupFilter(e.target.value)}>
          <option value="">All</option>
          {BLOOD_GROUPS.map((bg) => (
            <option key={bg} value={bg}>
              {bg}
            </option>
          ))}
        </select>
      </label>
      <br />
      <table border="1" style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Blood Group</th>
            <th>Units Available</th>
          </tr>
        </thead>
        <tbody>
          {filteredBloodGroups.map((bg) => (
            <tr key={bg}>
              <td>{bg}</td>
              <td>{bloodUnits[bg] || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {status && <p>{status}</p>}
      <button onClick={onGoBack} style={{ marginTop: "10px" }}>
        Go Back
      </button>
    </div>
  );
}

export default HospitalDashboard;
