import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { flowerTranslations } from "./flowerTranslations";

function fallbackTransliterate(text) {
  const map = {
    א: "e", ב: "b", ג: "g", ד: "d", ה: "h",
    ו: "o", ז: "z", ח: "h", ט: "t", י: "i",
    כ: "k", ך: "k", ל: "l", מ: "m", ם: "m",
    נ: "n", ן: "n", ס: "s", ע: "a", פ: "p",
    ף: "p", צ: "tz", ץ: "tz", ק: "k", ר: "r",
    ש: "sh", ת: "t",
  };

  return text
    .split("")
    .map((char) => map[char] || char)
    .join("");
}

function translateText(text) {
  const quantityMatch = text.match(/^(\d+)\s+(.*)$/);

  const quantity = quantityMatch ? quantityMatch[1] : "";
  const itemName = quantityMatch ? quantityMatch[2] : text;

  let translatedName = itemName;

  Object.entries(flowerTranslations).forEach(([hebrew, english]) => {
    translatedName = translatedName.replaceAll(
      hebrew,
      `${english} / ${hebrew}`
    );
  });

  if (translatedName === itemName) {
    translatedName = `${fallbackTransliterate(itemName)} / ${itemName}`;
  }

  return quantity ? `${quantity} ${translatedName}` : translatedName;
}

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState({});

useEffect(() => {
  fetchOrders();

  const interval = setInterval(() => {
    fetchOrders();
  }, 3000);

  function refreshWhenBack() {
    fetchOrders();
  }

  window.addEventListener("focus", refreshWhenBack);
  document.addEventListener("visibilitychange", refreshWhenBack);
  window.addEventListener("touchstart", refreshWhenBack);

  return () => {
    clearInterval(interval);
    window.removeEventListener("focus", refreshWhenBack);
    document.removeEventListener("visibilitychange", refreshWhenBack);
    window.removeEventListener("touchstart", refreshWhenBack);
  };
}, []);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("בעיה בטעינת ההזמנות");
      return;
    }

    setOrders(data || []);
  }

  function markStatus(orderId, itemIndex, status, order, flowerLine) {
    const key = `${orderId}-${itemIndex}`;

    setStatuses({
      ...statuses,
      [key]: status,
    });

    if (status === "missing") {
      sendWhatsApp(order.name, order.phone, flowerLine);
    }
  }

  function sendWhatsApp(customerName, phone, flowerLine) {
    const message = `היי ${customerName}, בדקנו את ההזמנה שלך. כרגע חסר לנו: ${flowerLine}. ניצור איתך קשר לעדכון.`;
    const cleanPhone = phone.startsWith("0") ? "972" + phone.slice(1) : phone;

    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }
async function deleteOrder(orderId) {
  const confirmDelete = window.confirm("למחוק את ההזמנה?");

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", orderId);

  if (error) {
    console.error(error);
    alert("שגיאה במחיקה");
    return;
  }

  setOrders((prev) => prev.filter((o) => o.id !== orderId));
}

function printOrder(order) {
  const html = `
    <html dir="rtl">
      <head>
        <title>הזמנה</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body {
            font-family: Arial;
            padding: 20px;
            direction: rtl;
          }

          h1 {
            color: #2f6f3e;
          }

          .item {
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
          }

          .print-btn {
            margin-top: 20px;
            padding: 12px 20px;
            background: #2f6f3e;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
          }
        </style>
      </head>

      <body>
        <h1>הזמנה - משק דניאל</h1>

        <p><strong>שם:</strong> ${order.name}</p>
        <p><strong>טלפון:</strong> ${order.phone}</p>
        <p><strong>כתובת:</strong> ${order.address}</p>
        <p><strong>תאריך:</strong> ${new Date(order.created_at).toLocaleString("he-IL")}</p>

        <h2>פרחים</h2>

        ${(order.order_text || "")
          .split("\n")
         .map((line) => `<div class="item">${translateText(line)}</div>`)
          .join("")}

        <button class="print-btn" onclick="window.print()">
          🖨 הדפס
        </button>
      </body>
    </html>
  `;

  const newWindow = window.open("", "_blank");

  newWindow.document.write(html);
  newWindow.document.close();
}

  return (
    <div dir="rtl" style={pageStyle}>
      <h1 style={mainTitle}>ניהול הזמנות</h1>

      {orders.length === 0 && (
        <p style={{ textAlign: "center" }}>אין הזמנות להצגה</p>
      )}

      {orders.map((order) => (
        <div key={order.id} style={cardStyle}>
          <h2>הזמנה</h2>

<button
  onClick={() => deleteOrder(order.id)}
  style={deleteButtonStyle}
>
  ✕
</button>

<button
  onClick={() => printOrder(order)}
  style={printButtonStyle}
>
  🖨
</button>
          <p>
          <strong>{translateText(order.name)}</strong>
          </p>

          <p>{order.address}</p>

          <p style={dateStyle}>
            תאריך הזמנה: {new Date(order.created_at).toLocaleString("he-IL")}
          </p>

          {(order.order_text || "").split("\n").map((line, index) => {
            const key = `${order.id}-${index}`;
            const currentStatus = statuses[key];

            return (
              <div
                key={index}
                style={{
                  ...flowerRowStyle,
                  background:
                    currentStatus === "ok"
                      ? "#e8f5e9"
                      : currentStatus === "missing"
                      ? "#fdecea"
                      : "white",
                }}
              >
                <span>{translateText(line)}</span>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={currentStatus === "ok"}
                    onChange={() =>
                      markStatus(order.id, index, "ok", order, line)
                    }
                    style={{ width: 20, height: 20 }}
                  />

                  <button
                    style={{
                      background:
                        currentStatus === "missing" ? "#c62828" : "white",
                      color:
                        currentStatus === "missing" ? "white" : "#c62828",
                      border: "2px solid #c62828",
                      borderRadius: 8,
                      padding: "6px 12px",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      markStatus(order.id, index, "missing", order, line)
                    }
                  >
                    חסר
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const pageStyle = {
  padding: 30,
  fontFamily: "Arial",
  background: "#f7f7f7",
  minHeight: "100vh",
};

const mainTitle = {
  textAlign: "center",
  color: "#2f4f35",
  fontSize: 42,
};

const cardStyle = {
  position: "relative", // 👈 חשוב מאוד!
  background: "white",
  padding: 24,
  borderRadius: 16,
  marginBottom: 24,
  boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
};

const dateStyle = {
  color: "#777",
  fontSize: 15,
};

const flowerRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 14,
  marginTop: 10,
  border: "1px solid #eee",
  borderRadius: 12,
};

const printButtonStyle = {
  position: "absolute",
  top: 10,
  left: 48,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: 22,
};

const deleteButtonStyle = {
  position: "absolute",
  top: 10,
  right: 10, // 👈 פינה ימנית עליונה
  background: "white",
  color: "#c62828",
  border: "2px solid #c62828",
  borderRadius: "50%",
  width: 30,
  height: 30,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: "bold",
};