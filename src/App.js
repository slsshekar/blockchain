import "./style.css";
import React, { useState, useEffect } from "react";
import DonorRegistration from "./components/DonorRegistration";
import DonorDashboard from "./components/DonorDashboard";
import BloodMatch from "./components/BloodMatch";
import DonationHistory from "./components/DonationHistory";
import BloodBankDashboard from "./components/BloodBankDashboard";
import HospitalDashboard from "./components/HospitalDashboard";
import RegisterBloodBank from "./components/RegisterBloodBank";
import Login from "./components/Login";
import RoleSelection from "./components/RoleSelection";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { getWeb3, getContracts } from "./blockchain";

function App() {
  const [role, setRole] = useState("");
  const [authMode, setAuthMode] = useState(""); // "register" or "login"
  const [donorPage, setDonorPage] = useState("");
  const [bloodBankPage, setBloodBankPage] = useState("");
  const [hospitalPage, setHospitalPage] = useState("");
  const [web3, setWeb3] = useState(null);
  const [contracts, setContracts] = useState(null);
  const [accounts, setAccounts] = useState([]);
  // Removed bloodBankId state from here as it is managed inside BloodBankDashboard
  const [loggedIn, setLoggedIn] = useState(false);
  const [medicalId, setMedicalId] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        console.log("Initializing web3 and contracts...");
        const web3Instance = await getWeb3();
        console.log("Web3 instance:", web3Instance);
        setWeb3(web3Instance);
        const accountsList = await web3Instance.eth.getAccounts();
        console.log("Accounts list:", accountsList);
        if (!accountsList || accountsList.length === 0) {
          throw new Error("No accounts found. Please check your wallet connection.");
        }
        setAccounts(accountsList);
        const contractsInstance = await getContracts(web3Instance);
        console.log("Contracts instance:", contractsInstance);
        if (!contractsInstance) {
          throw new Error("Contracts instance is undefined.");
        }
        // Defensive check for contract properties
        if (!contractsInstance.donorManagement) {
          throw new Error("donorManagement contract is undefined.");
        }
        if (!contractsInstance.bloodBankManagement) {
          throw new Error("bloodBankManagement contract is undefined.");
        }
        if (!contractsInstance.donationTracking) {
          throw new Error("donationTracking contract is undefined.");
        }
        setContracts(contractsInstance);
      } catch (error) {
        console.error("Error loading web3, accounts, or contracts:", error);
        alert(`Failed to load web3, accounts, or contract. Error: ${error.message}`);
      }
    };
    init();
  }, []);

  const handleLoginSuccess = (id) => {
    setLoggedIn(true);
    setMedicalId(id);
  };

  const renderDonorMenu = () => (
    <div>
      <h3>Donor Menu</h3>
      <button onClick={() => setDonorPage("dashboard")}>Dashboard</button>
      {/* Removed Donation History and Blood Match buttons as per user request */}
      {/* <button onClick={() => setDonorPage("history")}>Donation History</button> */}
      {/* <button onClick={() => setDonorPage("bloodMatch")}>Blood Match</button> */}
      <br />
      <button onClick={() => { setRole(""); setDonorPage(""); setLoggedIn(false); }}>Back to Role Selection</button>
    </div>
  );

  const renderDonorContent = () => {
    if (!contracts || !contracts.donorManagement) {
      return <p>Loading donor management contract...</p>;
    }
    switch (donorPage) {
      case "register":
        return (
          <DonorRegistration
            web3={web3}
            contract={contracts.donorManagement}
            accounts={accounts}
            onRegisterSuccess={() => setDonorPage("dashboard")}
            onGoBack={() => setDonorPage("")}
          />
        );
      case "dashboard":
        return (
          <DonorDashboard
            web3={web3}
            donorManagementContract={contracts.donorManagement}
            bloodBankManagementContract={contracts.bloodBankManagement}
            donationTrackingContract={contracts.donationTracking}
            accounts={accounts}
            medicalId={medicalId}
            onGoToHistory={() => setDonorPage("history")}
            onGoBack={() => setDonorPage("")}
          />
        );
      case "history":
        return (
          <DonationHistory
            web3={web3}
            donationTrackingContract={contracts.donationTracking}
            accounts={accounts}
            onGoBack={() => setDonorPage("dashboard")}
          />
        );
      case "bloodMatch":
        return (
          <BloodMatch
            web3={web3}
            contract={contracts.donorManagement}
            accounts={accounts}
            onGoBack={() => setDonorPage("dashboard")}
          />
        );
      default:
        return renderDonorMenu();
    }
  };

  const renderBloodBankMenu = () => (
    <div>
      <h3>Blood Bank Menu</h3>
      <button onClick={() => setBloodBankPage("register")}>Register</button>
      <button onClick={() => setBloodBankPage("dashboard")}>Dashboard</button>
      <br />
      <button onClick={() => { setRole(""); setBloodBankPage(""); setLoggedIn(false); }}>Back to Role Selection</button>
    </div>
  );

  const renderBloodBankContent = () => {
    if (!contracts || !contracts.bloodBankManagement || !contracts.donationTracking || !contracts.donorManagement) {
      return <p>Loading blood bank management or donation tracking contracts...</p>;
    }
    switch (bloodBankPage) {
      case "register":
        return (
          <RegisterBloodBank
            web3={web3}
            contract={contracts.bloodBankManagement}
            accounts={accounts}
            onRegisterSuccess={() => setBloodBankPage("dashboard")}
            onGoBack={() => setBloodBankPage("")}
          />
        );
      case "dashboard":
        return (
          <BloodBankDashboard
            web3={web3}
            bloodBankManagementContract={contracts.bloodBankManagement}
            donationTrackingContract={contracts.donationTracking}
            donorManagementContract={contracts.donorManagement}
            accounts={accounts}
            onGoBack={() => setBloodBankPage("")}
          />
        );
      default:
        return renderBloodBankMenu();
    }
  };

  const renderHospitalContent = () => {
    if (!contracts || !contracts.bloodBankManagement || !contracts.donationTracking) {
      return <p>Loading blood bank management or donation tracking contract...</p>;
    }
    return (
      <HospitalDashboard
        web3={web3}
        bloodBankManagementContract={contracts.bloodBankManagement}
        donationTrackingContract={contracts.donationTracking}
        accounts={accounts}
        onGoBack={() => { setRole(""); setLoggedIn(false); }}
      />
    );
  };

  const renderContent = () => {
    if (!role) {
      return <RoleSelection onSelectRole={setRole} />;
    }
    if (role === "hospital") {
      return renderHospitalContent();
    }
    if (!authMode) {
      return (
        <div className="component">
          <h2>{`Selected Role: ${role.charAt(0).toUpperCase() + role.slice(1)}`}</h2>
          <button onClick={() => setAuthMode("register")}>Register</button>
          <button onClick={() => setAuthMode("login")}>Login</button>
          <button onClick={() => setRole("")}>Back to Role Selection</button>
        </div>
      );
    }
    if (!loggedIn) {
      if (authMode === "login") {
        return (
          <Login
            role={role}
            onLoginSuccess={handleLoginSuccess}
            contract={role === "donor" ? contracts.donorManagement : contracts.bloodBankManagement}
            accounts={accounts}
          />
        );
      } else if (authMode === "register") {
        if (role === "donor") {
          return (
            <DonorRegistration
              web3={web3}
              contract={contracts.donorManagement}
              accounts={accounts}
              onRegisterSuccess={() => {
                setAuthMode("login");
              }}
              onGoBack={() => setAuthMode("")}
            />
          );
        } else if (role === "bloodbank") {
          return (
            <RegisterBloodBank
              web3={web3}
              contract={contracts.bloodBankManagement}
              accounts={accounts}
              onRegisterSuccess={() => {
                setAuthMode("login");
              }}
              onGoBack={() => setAuthMode("")}
            />
          );
        } else {
          return (
            <div className="component">
              <p>Registration not available for this role.</p>
              <button onClick={() => setAuthMode("")}>Back</button>
            </div>
          );
        }
      }
    }
    switch (role) {
      case "donor":
        return renderDonorContent();
      case "bloodbank":
        return renderBloodBankContent();
      default:
        return (
          <div>
            <h2>Select your role</h2>
            <button onClick={() => setRole("donor")}>Donor</button>
            <button onClick={() => setRole("bloodbank")}>Blood Bank</button>
            <button onClick={() => setRole("hospital")}>Hospital</button>
          </div>
        );
    }
  };

  if (!web3 || !contracts || accounts.length === 0) {
    return (
      <div className="App">
        <Header />
        <h1>🩸 Blood Donation DApp</h1>
        <p>Loading Web3, accounts, and contracts...</p>
        <Footer />
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <h1>🩸 Blood Donation DApp</h1>
      {renderContent()}
      <Footer />
    </div>
  );
}

export default App;
