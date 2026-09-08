import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PatientKiosk from "./components/PatientKiosk";
import DoctorDashboard from "./components/Doctordashboard";
import PatientPortal from "./components/PatientPortal";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Patient OPD Kiosk / Intake */}
        <Route path="/" element={<PatientKiosk />} />
        <Route path="/kiosk" element={<PatientKiosk />} />

        {/* Dedicated Patient Dashboard / History / Appointment */}
        <Route path="/portal" element={<PatientPortal />} />

        {/* Doctor Desk */}
        <Route path="/doctor" element={<DoctorDashboard />} />

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}