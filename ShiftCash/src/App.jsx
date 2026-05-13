import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home      from "./pages/Home";
import Login     from "./pages/Login";
import Register  from "./pages/Register";
import Dashboard from "./components/dashboard/Dashboard";
import Navbar    from "./components/Navbar";
import Footer    from "./components/Footer";

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
    <Router>
      <Routes>
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/registro" element={<PublicLayout><Register /></PublicLayout>} />

        {/* Dashboard va sin Navbar ni Footer — tiene su propio layout */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}