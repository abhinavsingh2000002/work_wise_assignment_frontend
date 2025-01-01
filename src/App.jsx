import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SeatBookingPage from './pages/SeatBookingPage';

function App() {
    return (
        <Router>
            <Routes>
                {/* Default route redirects to the Login Page */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/seats" element={<SeatBookingPage />} />
            </Routes>
        </Router>
    );
}

export default App;
