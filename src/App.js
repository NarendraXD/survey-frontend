import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Survey from "./pages/Survey";

function App() {
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email") || "";
  const isAdmin = email.toLowerCase().includes("admin");

  return (
    <BrowserRouter>
      <Routes>
        {/* If they are an admin with a token, go to admin. Otherwise, ALWAYS go to login */}
        <Route path="/" element={
          token && isAdmin ? <Navigate to="/admin" /> : <Navigate to="/login" />
        } />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        
        {/* The public "Magic Link" route */}
        <Route path="/survey/:id" element={<Survey />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;