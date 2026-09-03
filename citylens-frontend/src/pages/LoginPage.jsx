import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, MapPin, ArrowLeft } from "lucide-react";
import {
  loginUser,
  registerUser,
  forgotPassword,
} from "../services/authService";
import "./LoginPage.css";

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [showForgot, setShowForgot] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const switchTab = (tab) => {
    setActiveTab(tab);
    setShowForgot(false);
    setErrorMsg("");
    setInfoMsg("");
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);
    try {
      const response = await loginUser({ email, password });
      localStorage.setItem("token", response.token);
      localStorage.setItem("role", response.role);
      navigate("/home");
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Invalid email or password!",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);
    try {
      const response = await registerUser({ email, password, fullName });
      localStorage.setItem("token", response.token);
      localStorage.setItem("role", response.role);
      navigate("/home");
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Error creating account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setInfoMsg("A reset link has been sent to your email.");
    } catch (error) {
      console.error("Forgot password error:", error);
      setErrorMsg("Something went wrong. Please try again.");
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
          <h1>CityLens</h1>
          <p>Your smart travel guide</p>
        </div>

        {showForgot ? (
          <form onSubmit={handleForgot} className="login-form">
            {errorMsg && <div className="error-message">{errorMsg}</div>}
            {infoMsg && <div className="info-message">{infoMsg}</div>}

            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send reset link"}
            </button>

            <button
              type="button"
              className="forgot-link"
              onClick={() => {
                setShowForgot(false);
                setErrorMsg("");
                setInfoMsg("");
              }}
            >
              <ArrowLeft size={14} /> Back to sign in
            </button>
          </form>
        ) : (
          <>
            <div className="tab-switcher">
              <button
                className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
                onClick={() => switchTab("login")}
              >
                Sign in
              </button>
              <button
                className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
                onClick={() => switchTab("register")}
              >
                Sign up
              </button>
            </div>

            {activeTab === "login" ? (
              <form onSubmit={handleLogin} className="login-form">
                {errorMsg && <div className="error-message">{errorMsg}</div>}

                <div className="input-group">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => {
                    setShowForgot(true);
                    setErrorMsg("");
                    setInfoMsg("");
                  }}
                >
                  Forgot password?
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="login-form">
                {errorMsg && <div className="error-message">{errorMsg}</div>}

                <div className="input-group">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing up..." : "Sign up"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
