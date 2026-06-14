import { useState } from "react";
import Admin from "./Admin";
import CustomerForm from "./CustomerForm";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isAdmin, setIsAdmin] = useState(
    window.location.pathname === "/admin"
  );

  const [showLogin, setShowLogin] = useState(false); 

 function login() {
  if (
    username.trim().toLowerCase() === "paza" &&
    password.trim() === "123"
  ) {
    setIsAdmin(true);
    window.history.pushState({}, "", "/admin");
  } else {
    alert("שם משתמש או סיסמה שגויים");
  }
}

  if (isAdmin) {
    return <Admin />;
  }

  return (
    <div dir="rtl" style={pageWrapper}>
      <div style={containerStyle}>
        
<div>
  <button onClick={() => setShowLogin(true)} style={iconButtonStyle}>
    👤
  </button>

  {showLogin && (
    <div style={loginBoxStyle}>
      <h3>כניסת עובדים</h3>

      <input
        placeholder="שם משתמש"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="סיסמה"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />

      <button onClick={login} style={loginButtonStyle}>
        כניסה
      </button>

      <button
        onClick={() => setShowLogin(false)}
        style={closeButtonStyle}
      >
        סגור
      </button>
    </div>
  )}
</div>

        {/* טופס הזמנה */}
        <CustomerForm />

      </div>
    </div>
  );
}

/* ====== STYLES ====== */

const pageWrapper = {
  display: "flex",
  justifyContent: "center",
  width: "100%",
  marginTop: 0,
  padding: 0,
  boxSizing: "border-box",
  overflowX: "hidden",
};

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
};

const loginBoxStyle = {
  background: "white",
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
  width: 220,
  fontFamily: "Arial",
};

const inputStyle = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
};

const loginButtonStyle = {
  width: "100%",
  padding: 10,
  border: "none",
  borderRadius: 8,
  background: "#2f6f3e",
  color: "white",
  cursor: "pointer",
};
const iconButtonStyle = {
  fontSize: 24,
  border: "none",
  background: "white",
  cursor: "pointer",
  borderRadius: "50%",
  width: 50,
  height: 50,
  boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
};

const closeButtonStyle = {
  width: "100%",
  padding: 8,
  border: "1px solid #ccc",
  borderRadius: 8,
  background: "white",
  cursor: "pointer",
  marginTop: 6,
};