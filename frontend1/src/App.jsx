import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Browse from "./pages/Browse.jsx";
import ListingForm from "./pages/ListingForm.jsx";
import ItemDetail from "./pages/ItemDetail.jsx";

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {user && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/browse" element={<RequireAuth><Browse /></RequireAuth>} />
          <Route path="/new/:mode" element={<RequireAuth><ListingForm /></RequireAuth>} />
          <Route path="/item/:id" element={<RequireAuth><ItemDetail /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
