import React from "react";

function Footer() {
  return (
    <footer style={{
      backgroundColor: "#003366",
      color: "white",
      padding: "10px 30px",
      textAlign: "center",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      fontSize: "0.9rem",
      position: "fixed",
      bottom: 0,
      width: "100%",
      boxShadow: "0 -2px 4px rgba(0,0,0,0.1)"
    }}>
      &copy; {new Date().getFullYear()} Government Blood Bank Management System. All rights reserved.
    </footer>
  );
}

export default Footer;
