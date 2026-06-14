import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function CustomerForm() {
  const [sent, setSent] = useState(false);
  const [orderText, setOrderText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  function startRecording() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("הדפדפן הזה לא תומך בהקלטה קולית. נסי דרך Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "he-IL";
    recognition.interimResults = false;

    recognition.start();
    setIsRecording(true);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setOrderText((prev) => (prev ? prev + "\n" + text : text));
      setIsRecording(false);
    };

  recognition.onerror = (event) => {
  console.log("Speech error:", event.error);

  if (event.error === "not-allowed") {
    alert("צריך לאשר גישה למיקרופון בדפדפן.");
  } else if (event.error === "no-speech") {
    alert("לא נקלט דיבור. נסי לדבר קרוב יותר למיקרופון.");
  } else if (event.error === "network") {
    alert("בעיה בחיבור לזיהוי הקולי. נסי לפתוח ב-Safari או Chrome.");
  } else {
    alert("שגיאת הקלטה: " + event.error);
  }

  setIsRecording(false);
};

    recognition.onend = () => {
      setIsRecording(false);
    };
  }

  async function sendOrder(event) {
    event.preventDefault();

    const formData = {
      fullName: event.target[0].value,
      phone: event.target[1].value,
      address: event.target[2].value,
      orderText,
    };

    await supabase.from("orders").insert([
      {
        name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        order_text: formData.orderText,
      },
    ]);

    setSent(true);
  }

  if (sent) {
    return (
      <div dir="rtl" style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>תודה! ההזמנה התקבלה</h1>
          <p style={textStyle}>ניצור איתך קשר בהקדם לאישור ההזמנה.</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={pageStyle}>
      <img
  src="/logo.png"
  alt="לוגו משק דניאל"
  style={logoStyle}
/>

      <div style={cardStyle}>
        <h1 style={titleStyle}>טופס הזמנה</h1>
        <p style={textStyle}>מלאו את הפרטים וההזמנה תעבור אלינו לבדיקה.</p>

        <form onSubmit={sendOrder}>
          <label style={labelStyle}>שם מלא</label>
          <input style={inputStyle} required />

          <label style={labelStyle}>מספר טלפון</label>
          <input style={inputStyle} required />

          <label style={labelStyle}>כתובת</label>
          <input style={inputStyle} required />

          <label style={labelStyle}>הזמנה</label>
          <textarea
            style={{ ...inputStyle, height: 130 }}
            placeholder="לדוגמה: 20 ורדים לבנים, 10 חמניות"
            value={orderText}
            onChange={(e) => setOrderText(e.target.value)}
            required
          />

          <button type="button" onClick={startRecording} style={recordButtonStyle}>
            {isRecording ? "מקליט..." : "🎙 הקלט הזמנה"}
          </button>

          <button style={buttonStyle}>שליחת הזמנה</button>
        </form>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#ffffff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  paddingTop: 10,
  paddingLeft: 10,
  paddingRight: 10,
  fontFamily: "Arial",
  boxSizing: "border-box",
  overflowX: "hidden",
};;

const logoStyle = {
  width: "85vw",
  maxWidth: 280,
  height: "auto",
  marginBottom: 10,
};

const cardStyle = {
  width: "90vw",
  maxWidth: 420,
  background: "rgba(255,255,255,0.92)",
  padding: 22,
  borderRadius: 18,
  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
  boxSizing: "border-box",
};

const titleStyle = {
  margin: 0,
  marginBottom: 10,
  fontSize: 34,
  color: "#1f2d1f",
};

const textStyle = {
  marginTop: 0,
  marginBottom: 20,
  color: "#333",
  fontSize: 16,
  fontWeight: "bold",
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontWeight: "bold",
};

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: 13,
  marginBottom: 18,
  borderRadius: 10,
  border: "1px solid #d6d6d6",
  fontSize: 16,
};

const recordButtonStyle = {
  width: "100%",
  padding: 13,
  border: "1px solid #2f6f3e",
  borderRadius: 10,
  background: "white",
  color: "#2f6f3e",
  fontSize: 16,
  fontWeight: "bold",
  cursor: "pointer",
  marginBottom: 12,
};

const buttonStyle = {
  width: "100%",
  padding: 15,
  border: "none",
  borderRadius: 10,
  background: "#2f6f3e",
  color: "white",
  fontSize: 18,
  fontWeight: "bold",
  cursor: "pointer",
};