import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Home from './Pages/Home';
import AuthCallback from './Pages/AuthCallback';
import ForgotPassword from './Pages/ForgotPassword';
import Privacy from './Pages/Privacy';

import { AuthProvider } from './Context/AuthContext';
import { ProfileProvider } from './Context/ProfileContext';

// Footer Pages
import AboutUs from './Pages/AboutUs';
import Contact from './Pages/Contact';

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <Router>
          <Routes>

            {/* Redirect root URL to Home */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Main Website */}
            <Route path="/home" element={<Home />} />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Footer Pages */}
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />

          </Routes>
        </Router>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;