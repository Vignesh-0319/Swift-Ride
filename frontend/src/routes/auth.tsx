import { API_URL } from "../config"; // Ensure this points to the file we created

const handleSignUp = async (userData) => {
  // MUST call /register to match the backend router.post("/register")
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  // ... handle response
};

const handleSignIn = async (credentials) => {
  // MUST call /login to match the backend router.post("/login")
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  // ... handle response
};
