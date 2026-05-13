import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home      from "./pages/Home";
import Login     from "./pages/Login";
import Register  from "./pages/Register";
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

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/registro" element={<PublicLayout><Register /></PublicLayout>} />

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