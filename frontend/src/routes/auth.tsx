import { API_URL } from "../config";

// Example Sign Up Function
const handleSignUp = async (userData: any) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    console.log("Success:", data);
    alert("Account created successfully!");
  } catch (error: any) {
    console.error("Signup Error:", error.message);
    alert(error.message);
  }
};

// Example Sign In Function
const handleSignIn = async (credentials: any) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Save token if your backend sends one
    if (data.token) {
      localStorage.setItem("authToken", data.token);
    }
    
    alert("Signed in successfully!");
    window.location.href = "/dashboard"; // Redirect user
  } catch (error: any) {
    console.error("Login Error:", error.message);
    alert(error.message);
  }
};
