import React, { useState, useEffect } from "react";
import {
  Phone,
  FileText,
  Calendar,
  Download,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PatientPortal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const phoneParam = searchParams.get("phone") || "";
  const [phone, setPhone] = useState(phoneParam || "");
  const [isSearched, setIsSearched] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [thankedTokens, setThankedTokens] = useState([]);

  const fetchPatientRecords = async (targetPhone) => {
    if (!targetPhone) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/patient/vault/${targetPhone}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.records || []);
        setIsSearched(true);
      } else {
        alert(data.message || "No records found.");
      }
    } catch {
      alert("Server connection failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phoneParam) {
      setPhone(phoneParam);
      fetchPatientRecords(phoneParam);
    }
  }, [phoneParam]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 5) return alert("Please enter a valid mobile number.");
    fetchPatientRecords(phone);
  };

  const handleMarkCured = async (record) => {
    try {
      const res = await fetch("http://localhost:5000/api/patient/thank-you", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: record.token,
          patientName: record.name,
          doctorId: record.allottedDoctorId
        })
      });
      const data = await res.json();
      if (data.success) {
        setThankedTokens((prev) => [...prev, record.token]);
        alert(`Thank you note sent to ${record.allottedDoctorName}! Your recovery is recorded.`);
        fetchPatientRecords(phone);
      }
    } catch {
      alert("Failed to send status update");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <header className="bg-white border-b px-6 py-3.5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img 
            src="/medikiosk-logo.png.jpg" 
            alt="MediKiosk" 
            className="h-10 w-auto object-contain cursor-pointer"
            onClick={() => navigate("/")}
          />
          <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">| Patient Health Vault</span>
        </div>

        <button
          onClick={() => navigate("/")}
          className="text-xs font-black text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Kiosk Intake</span>
        </button>
      </header>

      {/* Main Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Phone Lookup Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Phone className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="tel"
                placeholder="Enter Registered Mobile Number (e.g. 9876543210)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-2xl text-xs font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black transition"
            >
              {loading ? "Searching..." : "Access Health Records →"}
            </button>
          </form>
          <p className="text-[11px] text-slate-400 font-medium">
            No password needed. Access prescriptions, case history, and live queue status directly via phone.
          </p>
        </div>

        {/* Records Display */}
        {isSearched && (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase text-slate-500 tracking-wider">
              Consultation Records ({records.length})
            </h2>

            {records.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border text-slate-400 text-xs space-y-2">
                <FileText className="h-10 w-10 mx-auto text-slate-300" />
                <p>No medical consultations found under {phone}.</p>
                <button
                  onClick={() => navigate("/")}
                  className="text-blue-600 underline font-black"
                >
                  Generate First OPD Token on Kiosk →
                </button>
              </div>
            ) : (
              records.map((rec) => {
                const isCured = rec.status === "Cured" || thankedTokens.includes(rec.token);
                return (
                  <div
                    key={rec.token}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2 border-b pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-lg text-slate-900">{rec.token}</span>
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                              isCured
                                ? "bg-emerald-100 text-emerald-800"
                                : rec.status === "Consulted"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {isCured ? "✓ Recovered & Cured" : rec.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Patient: <strong>{rec.name}</strong> ({rec.age}y / {rec.gender})
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase text-slate-400">Allotted Doctor</span>
                        <div className="text-xs font-black text-slate-800">{rec.allottedDoctorName}</div>
                        <div className="text-[11px] text-blue-600 font-semibold">{rec.allottedDoctorHospital}</div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border text-xs space-y-1">
                      <div className="font-bold text-slate-700">Presenting Symptoms Reported at Kiosk:</div>
                      <p className="text-slate-600 font-medium">{rec.rawText}</p>
                      <div className="text-[11px] text-slate-400 font-semibold pt-1">
                        Triage: {rec.triagePriority} (Severity Score: {rec.severityScore}/10)
                      </div>
                    </div>

                    {rec.diagnosis ? (
                      <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-emerald-900">Digital Rx & Clinical Advice</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Follow-up: {rec.assignedSlot || "In 7 Days"}
                          </span>
                        </div>

                        <div className="text-xs space-y-1.5">
                          <div><strong>Clinical Diagnosis:</strong> {rec.diagnosis}</div>
                          <div>
                            <strong>Rx Medicines:</strong>
                            <pre className="mt-1 p-2 bg-white rounded-xl border border-emerald-200 text-emerald-950 font-mono">
                              {rec.rx}
                            </pre>
                          </div>
                          {rec.advice && <div><strong>Advice:</strong> {rec.advice}</div>}
                        </div>

                        <div className="pt-2 border-t border-emerald-200 flex flex-wrap gap-2 justify-between items-center">
                          <button
                            onClick={() => window.print()}
                            className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 hover:bg-slate-50"
                          >
                            <Download className="h-3.5 w-3.5 text-blue-600" />
                            <span>Download Medical Summary (PDF)</span>
                          </button>

                          {!isCured && (
                            <button
                              onClick={() => handleMarkCured(rec)}
                              className="text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Mark as Cured & Thank Doctor</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        <span>
                          Patient is in the live queue for <strong>{rec.allottedDoctorName}</strong> ({rec.allottedDoctorCabin}). Please wait for consultation.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}