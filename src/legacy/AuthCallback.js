import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://sharx-backend.onrender.com";

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const exchangeCode = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        navigate("/login?error=oauth_failed");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/exchange`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (!response.ok || !data.token) {
          throw new Error(data.error || "Authentication failed");
        }

        localStorage.setItem("token", data.token);

        window.location.replace("/home");
      } catch (error) {
        console.error("OAuth exchange failed:", error);
        navigate("/login?error=oauth_failed");
      }
    };

    exchangeCode();
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      Signing you in...
    </div>
  );
}

export default AuthCallback;