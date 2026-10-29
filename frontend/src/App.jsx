
import { useState } from "react";
import axios from "axios";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import MoneySchool from "./pages/MoneySchool";
import "./App.css";

// Your deployed Render backend
const API_URL = "https://smartspend-backend-xhjr.onrender.com/api";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function LoginRegister() {
  const navigate = useNavigate();

  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitForm = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      if (register) {
        const response = await axios.post(
          `${API_URL}/auth/register`,
          {
            name,
            email,
            password,
          }
        );

        alert(response.data.message || "Registration successful!");

        setRegister(false);
        setName("");
        setEmail("");
        setPassword("");
      } else {
        const response = await axios.post(
          `${API_URL}/auth/login`,
          {
            email,
            password,
          }
        );

        if (!response.data.token) {
          throw new Error("Login succeeded but no token was returned.");
        }

        localStorage.setItem("token", response.data.token);

        if (response.data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
          );
        }

        alert(response.data.message || "Login successful!");

        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Authentication error:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="auth-card">
        <div className="logo">💰</div>

        <h1>Personal Budget</h1>

        <p className="subtitle">
          Manage your money. Track your goals.
        </p>

        <div className="form-header">
          <h2>{register ? "Create Account" : "Welcome Back"}</h2>

          <p>
            {register
              ? "Start managing your finances today"
              : "Login to continue to your account"}
          </p>
        </div>

        <form onSubmit={submitForm}>
          {register && (
            <div className="input-group">
              <label>Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button
            className="main-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : register
              ? "Create Account"
              : "Login"}
          </button>
        </form>

        <div className="switch-section">
          <span>
            {register
              ? "Already have an account?"
              : "Don't have an account?"}
          </span>

          <button
            className="switch-button"
            type="button"
            onClick={() => {
              setRegister(!register);
              setName("");
              setEmail("");
              setPassword("");
            }}
          >
            {register ? "Login" : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginRegister />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/money-school"
          element={
            <ProtectedRoute>
              <MoneySchool />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
