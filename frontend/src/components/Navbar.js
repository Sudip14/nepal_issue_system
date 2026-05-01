import { useNavigate } from "react-router-dom";
import authController from "../controllers/authController";

function Navbar({ username, userType, onReport }) {
  const navigate = useNavigate();
  const userBadge =
    userType === "admin"
      ? "👑 Admin"
      : userType === "authority"
        ? "🏛 Authority"
        : "👤 Citizen";
  const bgColor =
    userType === "admin"
      ? "#0F2044"
      : userType === "authority"
        ? "#065F46"
        : "#0F2044";

  return (
    <div
      style={{
        background: bgColor,
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 56,
      }}
    >
      <span style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>
        🇳🇵 Nepal Issue Reporting
      </span>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ color: "#93C5FD", fontSize: 13 }}>
          {userBadge} · {username}
        </span>
        {onReport && (
          <button
            onClick={onReport}
            style={{
              background: "#1D4ED8",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "6px 16px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            + Report Issue
          </button>
        )}
        {userType === "admin" && (
          <a
            href="http://127.0.0.1:8000/admin/"
            target="_blank"
            rel="noreferrer"
            style={{
              background: "#7C3AED",
              color: "#fff",
              borderRadius: 8,
              padding: "6px 16px",
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Django Admin ↗
          </a>
        )}
        <a
          href="/map"
          style={{ color: "#93C5FD", fontSize: 13, textDecoration: "none" }}
        >
          🗺 Map
        </a>
        <a
          href="/dashboard"
          style={{ color: "#93C5FD", fontSize: 13, textDecoration: "none" }}
        >
          📋 Issues
        </a>
        <button
          onClick={() => authController.logout(navigate)}
          style={{
            background: "transparent",
            color: "#93C5FD",
            border: "1px solid #93C5FD",
            borderRadius: 8,
            padding: "6px 16px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
