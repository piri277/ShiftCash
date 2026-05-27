import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home      from "./pages/Home";
import AuthPage  from "./pages/AuthPage";
import Dashboard from "./components/dashboard/Dashboard";
import Navbar    from "./components/Navbar";
import Footer    from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthProvider";

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function AuthLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/auth" element={<AuthLayout><AuthPage /></AuthLayout>} />
          <Route path="/login" element={<AuthLayout><AuthPage /></AuthLayout>} />
          <Route path="/registro" element={<AuthLayout><AuthPage /></AuthLayout>} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}