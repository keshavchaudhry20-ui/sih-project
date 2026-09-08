import React, { useState, useEffect } from "react";
import {
  Stethoscope,
  Lock,
  Mail,
  RefreshCw,
  LogOut,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [loading, setLoading] = useState(false);

  // Login Credentials
  const [email, setEmail] = useState("vaidya.sharma@aiia.gov.in");
  const [password, setPassword] = useState("123");

  // Registration Form
  const [regForm, setRegForm] = useState({
    name: "Vaidya R. K. Sharma",
    city: "New Delhi",
    hospital: "All India Institute of Ayurveda",
    specialty: "Kayachikitsa (Ayurvedic Medicine)",
    degree: "BAMS, MD (Kayachikitsa)",
    cabin: "Chamber 12, AYUSH OPD Wing",
    email: "vaidya.sharma@aiia.gov.in",
    password: "123",
    photoBase64: ""
  });

  // Active Desk States
  const [activeQueue, setActiveQueue] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [rx, setRx] = useState("");
  const [advice, setAdvice] = useState("");
  const [assignedSlot, setAssignedSlot] = useState("In 7 Days");

  // Doctor Verification Column for AI Summary Table
  const [doctorVerification, setDoctorVerification] = useState({
    prakritiConfirm: "Confirmed Vata Tendency",
    vikritiConfirm: "Confirmed Vata Imbalance",
    agniConfirm: "Confirmed Vishama Agni"
  });

  const fetchQueue = async (docId) => {
    if (!docId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/doctor/queue/${docId}`);
      const data = await res.json();
      if (data.success) {
        setActiveQueue(data.activeQueue || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isLoggedIn && currentDoctor) {
      const docId = currentDoctor._id || currentDoctor.id;
      fetchQueue(docId);
      const interval = setInterval(() => fetchQueue(docId), 3500);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, currentDoctor]);

  // Handle Photo with 5MB validation
  const handlePhotoPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please select a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setRegForm((prev) => ({ ...prev, photoBase64: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/doctor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentDoctor(data.doctor);
        setIsLoggedIn(true);
      } else {
        alert(data.message || "Invalid doctor credentials.");
      }
    } catch {
      alert("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/doctor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm)
      });
      const data = await res.json();
      if (data.success) {
        alert("Registration Successful! Chamber loaded.");
        setCurrentDoctor(data.doctor);
        setIsLoggedIn(true);
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch {
      alert("Registration failed. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrescribe = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    try {
      const res = await fetch("http://localhost:5000/api/doctor/prescribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: selectedPatient.token,
          diagnosis,
          rx,
          advice,
          assignedSlot,
          doctorVerification
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Prescription recorded for Token ${selectedPatient.token}!`);
        setSelectedPatient(null);
        setDiagnosis("");
        setRx("");
        setAdvice("");
        const docId = currentDoctor._id || currentDoctor.id;
        await fetchQueue(docId);
      }
    } catch {
      alert("Failed to submit prescription");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 bg-emerald-700 text-white rounded-2xl flex items-center justify-center mx-auto">
              <Stethoscope className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Physician Chamber</h1>
            <p className="text-xs text-slate-500">Authorized Clinical Consultation Desk</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setAuthMode("login")}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition ${
                authMode === "login" ? "bg-white text-emerald-950 shadow-sm" : "text-slate-500"
              }`}
            >
              Doctor Login
            </button>
            <button
              onClick={() => setAuthMode("register")}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition ${
                authMode === "register" ? "bg-white text-emerald-950 shadow-sm" : "text-slate-500"
              }`}
            >
              Register Doctor
            </button>
          </div>

          {authMode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email ID</label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl"
              >
                {loading ? "Authenticating..." : "Login to Consultation Chamber →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block">Doctor Name</label>
                <input
                  type="text"
                  required
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block">City</label>
                  <input
                    type="text"
                    required
                    value={regForm.city}
                    onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block">Hospital Name (Manual)</label>
                  <input
                    type="text"
                    required
                    value={regForm.hospital}
                    onChange={(e) => setRegForm({ ...regForm, hospital: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block">Specialty</label>
                  <input
                    type="text"
                    required
                    value={regForm.specialty}
                    onChange={(e) => setRegForm({ ...regForm, specialty: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block">Cabin / Room</label>
                  <input
                    type="text"
                    required
                    value={regForm.cabin}
                    onChange={(e) => setRegForm({ ...regForm, cabin: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block">
                  Profile Photo (Max 5MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoPick}
                  className="w-full text-xs text-slate-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block">Email</label>
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block">Password</label>
                <input
                  type="password"
                  required
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl"
              >
                Register & Open Chamber Desk
              </button>
            </form>
          )}

          <div className="text-center pt-2 border-t">
            <button
              onClick={() => navigate("/")}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ← Back to Patient Kiosk
            </button>
          </div>
        </div>
      </div>
    );
  }

  const docId = currentDoctor._id || currentDoctor.id;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Bar */}
      <header className="bg-emerald-950 text-white px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src={currentDoctor.photo || "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format"}
            alt="Doctor"
            className="h-10 w-10 rounded-xl object-cover border border-emerald-400"
          />
          <div>
            <div className="font-black text-sm">{currentDoctor.name}</div>
            <div className="text-[11px] text-emerald-300 font-semibold">
              {currentDoctor.specialty} • {currentDoctor.cabin} ({currentDoctor.hospital})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchQueue(docId)}
            className="text-xs font-bold bg-emerald-900 hover:bg-emerald-800 px-3 py-1.5 rounded-xl inline-flex items-center gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-xs font-bold bg-rose-900/60 hover:bg-rose-900 text-rose-200 px-3 py-1.5 rounded-xl inline-flex items-center gap-1"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Dual-Pane Workspace */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Col: Queue with Alert Badges */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h2 className="font-black text-sm text-slate-900 flex justify-between">
              <span>Waiting Patients ({activeQueue.length})</span>
              <span className="text-xs text-slate-400 font-normal">Sorted by Severity</span>
            </h2>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
              {activeQueue.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-medium">
                  No patients waiting in chamber queue.
                </div>
              ) : (
                activeQueue.map((p) => {
                  const score = p.severityScore || 2;
                  let badgeColor = "bg-slate-100 text-slate-700";
                  if (score >= 4 && score <= 7) badgeColor = "bg-amber-100 text-amber-900 border border-amber-300";
                  if (score > 7 && score <= 9) badgeColor = "bg-orange-500 text-white";
                  if (score >= 10) badgeColor = "bg-rose-600 text-white animate-pulse";

                  return (
                    <div
                      key={p.token}
                      onClick={() => setSelectedPatient(p)}
                      className={`p-4 rounded-2xl border cursor-pointer transition ${
                        selectedPatient?.token === p.token
                          ? "ring-2 ring-emerald-600 bg-emerald-50/50 border-emerald-300"
                          : score >= 10
                          ? "bg-rose-50 border-rose-300"
                          : "bg-white hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900">{p.token}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${badgeColor}`}>
                            {score >= 10 ? "P1 RED ALERT" : score >= 8 ? "ORANGE ALERT" : `Score: ${score}/10`}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-bold">{p.createdAtTime}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-700 mt-1">
                        {p.name} ({p.age}y / {p.gender})
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {p.rawText}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Consultation & Verification Table */}
        <div className="lg:col-span-7 space-y-4">
          {selectedPatient ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b pb-3 flex justify-between items-center">
                <div>
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-wide">
                    Active Clinical Consultation
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    {selectedPatient.name} • Token: {selectedPatient.token}
                  </h3>
                </div>
                <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-xl">
                  Phone: {selectedPatient.phone}
                </span>
              </div>

              {/* Patient Chief Complaints */}
              <div className="bg-slate-50 p-4 rounded-2xl border text-xs space-y-1">
                <div><strong>Chief Complaints:</strong> {selectedPatient.rawText}</div>
                <div><strong>Onset:</strong> {selectedPatient.duration || "3 days"}</div>
                <div><strong>Past History:</strong> {selectedPatient.pastHistory || "None"}</div>
                <div><strong>Medications:</strong> {selectedPatient.medications || "None"}</div>
                {selectedPatient.uploadedFiles && selectedPatient.uploadedFiles.length > 0 && (
                  <div className="pt-1 text-emerald-800 font-bold">
                    Attached Reports ({selectedPatient.uploadedFiles.length}):{" "}
                    {selectedPatient.uploadedFiles.map((f, i) => f.name).join(", ")}
                  </div>
                )}
              </div>

              {/* SUMMARY TABLE WITH DOCTOR CONFIRM COLUMN */}
              <div className="border border-emerald-200 rounded-2xl overflow-hidden text-xs">
                <div className="bg-emerald-800 text-white font-black px-4 py-2 flex justify-between">
                  <span>Ayurvedic Clinical Parameter</span>
                  <span>AI-Derived Indicator</span>
                  <span>Doctor Confirm / Modify (Physician Column)</span>
                </div>

                <div className="divide-y divide-slate-200 bg-white">
                  <div className="grid grid-cols-3 p-3 items-center">
                    <span className="font-bold text-slate-900">Prakriti</span>
                    <span className="text-emerald-800 font-semibold">
                      Vata tendency detected (Confidence: Moderate)
                    </span>
                    <input
                      type="text"
                      value={doctorVerification.prakritiConfirm}
                      onChange={(e) =>
                        setDoctorVerification({ ...doctorVerification, prakritiConfirm: e.target.value })
                      }
                      className="border border-slate-300 rounded-lg p-1.5 font-semibold text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-3 p-3 items-center">
                    <span className="font-bold text-slate-900">Vikriti</span>
                    <span className="text-emerald-800 font-semibold">
                      Vata-related indicators
                    </span>
                    <input
                      type="text"
                      value={doctorVerification.vikritiConfirm}
                      onChange={(e) =>
                        setDoctorVerification({ ...doctorVerification, vikritiConfirm: e.target.value })
                      }
                      className="border border-slate-300 rounded-lg p-1.5 font-semibold text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-3 p-3 items-center">
                    <span className="font-bold text-slate-900">Agni</span>
                    <span className="text-emerald-800 font-semibold">
                      {selectedPatient.agni || "Vishama tendency"}
                    </span>
                    <input
                      type="text"
                      value={doctorVerification.agniConfirm}
                      onChange={(e) =>
                        setDoctorVerification({ ...doctorVerification, agniConfirm: e.target.value })
                      }
                      className="border border-slate-300 rounded-lg p-1.5 font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Prescription Form */}
              <form onSubmit={handlePrescribe} className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Provisional / Final Clinical Diagnosis
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shiroroga (Vataja Headache) / Acute Migraine"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Rx Medicines & Dosages
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Shirashoolavajra Ras 1 tab BD with warm water&#10;Pathyadi Kadha 15ml BD with equal water"
                    value={rx}
                    onChange={(e) => setRx(e.target.value)}
                    className="w-full p-2.5 border rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Diet / Lifestyle Advice</label>
                    <input
                      type="text"
                      placeholder="e.g. Avoid cold water, early dinner"
                      value={advice}
                      onChange={(e) => setAdvice(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Next Follow-up</label>
                    <select
                      value={assignedSlot}
                      onChange={(e) => setAssignedSlot(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white"
                    >
                      <option>In 3 Days</option>
                      <option>In 7 Days</option>
                      <option>In 14 Days</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl transition shadow-md"
                >
                  Confirm Clinical Assessment & Issue Digital Prescription →
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center text-slate-400 text-xs font-medium">
              Select a patient from the queue to review structured intake and complete consultation.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}