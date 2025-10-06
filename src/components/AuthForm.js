import React, { useState } from "react";
import "../styles/AuthForm.css";

const API_BASE_URL = "https://agentic-movie-recommendation-system-api-7.onrender.com";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const url = isLogin
        ? `${API_BASE_URL}/login`
        : `${API_BASE_URL}/signup`;

      const payload = isLogin
        ? { email, password }
        : { username, email, password };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      if (isLogin) {
        setMessage({ type: "success", text: "Login successful!" });
        const loginToken = data.username ? `user:${data.username}` : "logged-in";
        localStorage.setItem("token", loginToken);
        if (data.username) {
          localStorage.setItem("username", data.username);
        }
        if (data.email) {
          localStorage.setItem("email", data.email);
        }

        setTimeout(() => {
          window.location.reload();
        }, 600);
      } else {
        setMessage({ type: "success", text: "Signup successful! You can login now." });
        setTimeout(() => {
          setIsLogin(true);
          setMessage(null);
          setUsername("");
          setEmail("");
          setPassword("");
        }, 1500);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setMessage(null);
    setUsername("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Login" : "Signup"}</h2>

      {message && (
        <p className={`auth-message ${message.type}`}>
          {message.text}
        </p>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : isLogin ? "Login" : "Signup"}
        </button>
      </form>

      <p className="auth-toggle">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button onClick={handleToggle}>
          {isLogin ? "Signup here" : "Login here"}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;