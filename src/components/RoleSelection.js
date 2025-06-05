import React from "react";

function RoleSelection({ onSelectRole }) {
  return (
    <div className="role-selection">
      <h2>Select Your Role</h2>
      <div className="button-group">
        <button className="primary-button" onClick={() => onSelectRole("donor")}>Donor</button>
        <button className="primary-button" onClick={() => onSelectRole("bloodbank")}>Blood Bank</button>
        <button className="primary-button" onClick={() => onSelectRole("hospital")}>Hospital</button>
      </div>
    </div>
  );
}

export default RoleSelection;
