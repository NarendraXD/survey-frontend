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
        <Route path="/" element={
          token ? (isAdmin ? <Navigate to="/admin" /> : <Navigate to="/survey" />) : <Navigate to="/login" />
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/survey" element={<Survey />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;