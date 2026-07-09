import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AuthCallback() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    console.log("Token:", token);

    if (!token || typeof token !== "string") {
      navigate("/login");
      return;
    }

    localStorage.setItem("token", token);
    window.location.href = "/home"; 
  }, [navigate]);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh"
    }}>
      Signing you in...
    </div>
  );
}

export default AuthCallback;