import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, MapPin } from "lucide-react";
import { resetPassword } from "../services/authService";
import "./LoginPage.css";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords don't match!");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setInfoMsg("Your password has been changed. You can now sign in.");
      setTimeout(() => navigate("/login"), 2500);
    } catch (error) {
      console.error("Reset password error:", error);
      setErrorMsg("This link is invalid or has expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="map-grid" />
      <div className="bg-glow-1" />
      <div className="bg-glow-2" />

      <div className="glass-panel login-box">
        <div className="brand-header">
          <div className="icon-circle">
            <MapPin size={28} color="white" />
          </div>
          <h1>New password</h1>
          <p>Choose a new password for your account</p>
        </div>

        <form onSubmit={handleReset} className="login-form">
          {errorMsg && <div className="error-message">{errorMsg}</div>}
          {infoMsg && <div className="info-message">{infoMsg}</div>}

          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Saving..." : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;