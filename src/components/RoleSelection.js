import React from "react";

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
  top: 130,
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

function RoleSelection({ onSelectRole }) {
  return (
    <>
      <div style={backgroundStyle}></div>
      <div style={overlayStyle}></div>
      <div className="role-selection" style={contentStyle}>
        <h2>Select Your Role</h2>
        <div className="button-group">
          <button className="primary-button" onClick={() => onSelectRole("donor")}>Donor</button>
          <button className="primary-button" onClick={() => onSelectRole("bloodbank")}>Blood Bank</button>
          <button className="primary-button" onClick={() => onSelectRole("hospital")}>Hospital</button>
        </div>
      </div>
    </>
  );
}

export default RoleSelection;
