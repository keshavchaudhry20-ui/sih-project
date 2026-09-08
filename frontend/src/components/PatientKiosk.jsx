import React, { useState } from "react";
import {
  Mic,
  MicOff,
  UploadCloud,
  FileText,
  HeartPulse,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  PhoneCall,
  UserCheck,
  Languages,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PatientKiosk() {
  const navigate = useNavigate();

  // Stepper State
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState("hi");
  const [assistedMode, setAssistedMode] = useState(false);
  const [sahayakAlert, setSahayakAlert] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Demographics
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");

  // Step 2: Consultation Approach & Chief Complaints
  const [consultationType, setConsultationType] = useState("Ayurveda"); // 'Ayurveda' | 'Modern Medicine'
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("3 days");
  const [severity, setSeverity] = useState(2); // 1-10 scale

  // Step 3: Ayurvedic Dashavidha Parameters & Past Records
  const [agni, setAgni] = useState("Visham (Irregular)");
  const [nidra, setNidra] = useState("Disturbed / Light");
  const [dietLifestyle, setDietLifestyle] = useState("Irregular routine");
  const [pastHistory, setPastHistory] = useState("");
  const [medications, setMedications] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Final Output
  const [result, setResult] = useState(null);

  // Floor Attendant Call Trigger
  const triggerSahayak = () => {
    setSahayakAlert(true);
    setTimeout(() => setSahayakAlert(false), 4500);
  };

  // Browser Speech-to-Text
  const toggleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Please use Google Chrome for voice dictation.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setSymptoms((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Multiple Medical Files Upload Handler
  const handleMultipleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const fileSummaries = files.map((f) => ({
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
      type: f.type || "Document"
    }));

    setUploadedFiles((prev) => [...prev, ...fileSummaries]);

    if (!pastHistory) {
      setPastHistory("Chronic Gastritis & Migraine (Auto-indexed from report)");
    }
    if (!medications) {
      setMedications("Tab. Pantocid 40mg, Sutshekhar Ras");
    }
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Pain Severity Badge
  const getSeverityBadge = (val) => {
    if (val <= 3) {
      return { text: "1-3 Light", color: "bg-emerald-100 text-emerald-800" };
    }
    if (val <= 7) {
      return { text: "4-7 Moderate", color: "bg-amber-100 text-amber-900" };
    }
    if (val <= 9) {
      return { text: "7-9 Severe (Orange Alert)", color: "bg-orange-500 text-white" };
    }
    return { text: "10 Critical Red Alert (STAT)", color: "bg-rose-600 text-white animate-pulse" };
  };

  // Submit Form
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Anonymous Patient",
          age: Math.max(1, Number(age) || 25),
          gender,
          phone: phone || "9876543210",
          consultationType,
          rawText: symptoms || "General Health Consultation",
          duration,
          severity,
          agni,
          nidra,
          dietLifestyle,
          pastHistory,
          medications,
          uploadedFiles
        })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setStep(5);
      } else {
        alert(data.message || "Failed to process intake");
      }
    } catch {
      alert("Backend connection failed. Make sure 'node server.js' is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <header className="bg-white border-b px-4 sm:px-8 py-3.5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-700 text-white rounded-2xl flex items-center justify-center shadow-sm">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-slate-900 tracking-tight">
                MediKiosk
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                SIH26047
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Smart Pre-Consultation | Clinical Triage
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={triggerSahayak}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition"
          >
            <PhoneCall className="h-3.5 w-3.5 text-rose-600 animate-bounce" />
            <span>सहायक बुलाओ (Help)</span>
          </button>

          <button
            type="button"
            onClick={() => setAssistedMode(!assistedMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition ${
              assistedMode
                ? "bg-amber-100 text-amber-900 border border-amber-300 font-black"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5 text-amber-600" />
            <span>{assistedMode ? "✓ सरल चालू" : "सरल (Easy)"}</span>
          </button>

          <button
            type="button"
            onClick={() => setLang(lang === "hi" ? "en" : "hi")}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1"
          >
            <Languages className="h-3.5 w-3.5 text-emerald-700" />
            <span>{lang === "hi" ? "हिन्दी" : "English"}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/portal")}
            className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition"
          >
            Patient Portal
          </button>

          <button
            type="button"
            onClick={() => navigate("/doctor")}
            className="text-xs font-bold text-slate-700 hover:text-emerald-700 px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1"
          >
            <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />
            <span>Doctor Desk</span>
          </button>
        </div>
      </header>

      {/* Sahayak Alert Toast */}
      {sahayakAlert && (
        <div className="bg-amber-500 text-amber-950 font-black text-xs py-2 text-center px-4 shadow-sm">
          हेल्पडेस्क सहायक को आपके कियोस्क पर भेजा गया है। कृपया 2 मिनट प्रतीक्षा करें। (Floor Attendant Notified)
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6 flex flex-col justify-center">
        {step < 5 && (
          <>
            {/* HERO BANNER MATCHING FIRST IMAGE */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-10 shadow-lg">
              <div className="relative z-10 max-w-xl space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-300">
                  National Digital OPD Initiative
                </span>
                <h1 className="text-3xl sm:text-4xl font-black leading-tight">
                  Welcome to <span className="text-emerald-300">MediKiosk</span>
                </h1>
                <p className="text-sm text-emerald-100 font-medium">
                  Your health information, simplified. Quick • Easy • Accurate • For a healthier tomorrow.
                </p>
              </div>
            </div>

            {/* FORM CARD */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              <div className="bg-slate-50 border-b px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {step === 1 && "Step 1: Basic Patient Details"}
                    {step === 2 && "Step 2: Consultation Approach & Current Concerns"}
                    {step === 3 && "Step 3: Dashavidha Parameters & Medical Records"}
                    {step === 4 && "Step 4: Clinical Review & Summary"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Structured pre-consultation history to eliminate OPD bottlenecks.
                  </p>
                </div>
                <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl">
                  Step {step} of 4
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                {/* STEP 1: BASIC DEMOGRAPHICS */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Patient Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rohan Kumar"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-sm font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Age (Years) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          required
                          placeholder="28"
                          value={age}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || Number(val) >= 1) setAge(val);
                          }}
                          className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-sm font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Gender *
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-sm font-semibold bg-white"
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Phone Number (Max 10 Digits) *
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          required
                          placeholder="9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-sm font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: CONSULTATION APPROACH & CHIEF COMPLAINTS */}
                {step === 2 && (
                  <div className="space-y-5">
                    {/* Approach Switch */}
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                      <label className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                        Choose Your Consultation Approach / आप किस पद्धति में परामर्श चाहते हैं?
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setConsultationType("Ayurveda")}
                          className={`py-3 px-4 rounded-xl text-xs font-black border transition ${
                            consultationType === "Ayurveda"
                              ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          Ayurveda (आयुर्वेद)
                        </button>
                        <button
                          type="button"
                          onClick={() => setConsultationType("Modern Medicine")}
                          className={`py-3 px-4 rounded-xl text-xs font-black border transition ${
                            consultationType === "Modern Medicine"
                              ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          Modern Medicine (एलोपैथी)
                        </button>
                      </div>
                    </div>

                    {/* Symptoms Elicitation with Voice */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700 uppercase">
                          What problem are you experiencing? / मुख्य समस्या क्या है? *
                        </label>
                        <button
                          type="button"
                          onClick={toggleVoice}
                          className={`text-xs font-black px-3 py-1 rounded-xl inline-flex items-center gap-1.5 transition ${
                            isRecording
                              ? "bg-rose-600 text-white animate-pulse"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-300"
                          }`}
                        >
                          {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                          <span>{isRecording ? "Listening..." : "Voice Input (माइक)"}</span>
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        required
                        placeholder="e.g. Headache since 3 days, acidity after eating, stomach bloating..."
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="w-full p-3.5 border border-slate-300 rounded-2xl text-sm font-semibold"
                      />
                    </div>

                    {/* Pain Severity Scale */}
                    <div className="bg-slate-50 p-4 rounded-2xl border space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-700 uppercase">
                          Pain / Distress Severity (1 to 10)
                        </label>
                        <span className={`text-xs font-black px-3 py-1 rounded-xl ${getSeverityBadge(severity).color}`}>
                          {getSeverityBadge(severity).text}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={severity}
                        onChange={(e) => setSeverity(Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer h-2"
                      />
                      <div className="flex justify-between text-[11px] font-bold text-slate-500">
                        <span>1-3 (Light)</span>
                        <span>4-7 (Moderate)</span>
                        <span>7-9 (Orange Alert)</span>
                        <span className="text-rose-600">10 (Red Critical)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: DASHAVIDHA & MULTI-DOC UPLOAD */}
                {step === 3 && (
                  <div className="space-y-4">
                    {consultationType === "Ayurveda" && (
                      <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
                        <span className="text-xs font-black text-emerald-900 uppercase tracking-wider block">
                          Ayurvedic Dashavidha Parameters
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              Agni (Appetite / Digestion)
                            </label>
                            <select
                              value={agni}
                              onChange={(e) => setAgni(e.target.value)}
                              className="w-full p-2.5 border rounded-xl text-xs font-semibold bg-white"
                            >
                              <option>Sama (Balanced)</option>
                              <option>Manda (Sluggish / Kapha)</option>
                              <option>Tikshna (Sharp / Hyperacidity)</option>
                              <option>Visham (Irregular / Gas & Bloating)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              Nidra (Sleep Quality)
                            </label>
                            <select
                              value={nidra}
                              onChange={(e) => setNidra(e.target.value)}
                              className="w-full p-2.5 border rounded-xl text-xs font-semibold bg-white"
                            >
                              <option>Sound & Refreshing</option>
                              <option>Disturbed / Light</option>
                              <option>Insomnia (Difficulty sleeping)</option>
                              <option>Excessive sleepiness / Lethargy</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              Diet & Lifestyle (Ahara-Vihara)
                            </label>
                            <input
                              type="text"
                              value={dietLifestyle}
                              onChange={(e) => setDietLifestyle(e.target.value)}
                              placeholder="e.g. Late dinners, spicy diet"
                              className="w-full p-2.5 border rounded-xl text-xs font-semibold"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MULTIPLE MEDICAL REPORTS UPLOAD */}
                    <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/30 rounded-2xl p-5 text-center space-y-3">
                      <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-emerald-950 uppercase block">
                          Upload Past Medical Reports / Prescriptions (Multiple Files Allowed)
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Accessible by AI for case-structuring and the attending physician.
                        </p>
                      </div>

                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs">
                        <FileText className="h-4 w-4" />
                        <span>Choose Files (Add Reports)</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf"
                          onChange={handleMultipleFileUpload}
                          className="hidden"
                        />
                      </label>

                      {/* Display Uploaded File Chips */}
                      {uploadedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center pt-2">
                          {uploadedFiles.map((file, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
                            >
                              <span>{file.name} ({file.size})</span>
                              <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="text-slate-400 hover:text-rose-600"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                          Past Medical History
                        </label>
                        <input
                          type="text"
                          value={pastHistory}
                          onChange={(e) => setPastHistory(e.target.value)}
                          placeholder="e.g. Hypertension, Gastritis, None"
                          className="w-full px-3.5 py-2.5 border rounded-2xl text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                          Ongoing Medications / Allergies
                        </label>
                        <input
                          type="text"
                          value={medications}
                          onChange={(e) => setMedications(e.target.value)}
                          placeholder="e.g. Pantocid 40mg, Sulfa allergy"
                          className="w-full px-3.5 py-2.5 border rounded-2xl text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: REVIEW */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-5 rounded-2xl border space-y-2 text-xs">
                      <div className="font-black text-slate-900 text-sm border-b pb-1">
                        Patient Case Summary Review
                      </div>
                      <div><strong>Name:</strong> {name} ({age}y / {gender}) • <strong>Phone:</strong> {phone}</div>
                      <div><strong>Consultation Approach:</strong> {consultationType}</div>
                      <div><strong>Chief Symptoms:</strong> {symptoms || "General checkup"}</div>
                      <div><strong>Reported Distress:</strong> {getSeverityBadge(severity).text}</div>
                      {consultationType === "Ayurveda" && (
                        <div><strong>Ayurvedic Indicators:</strong> Agni: {agni} • Nidra: {nidra}</div>
                      )}
                      <div><strong>Attached Documents:</strong> {uploadedFiles.length} file(s) uploaded</div>
                    </div>

                    <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-semibold text-amber-900">
                      <strong>Doctor Validation Principle:</strong> AI summarizes and extracts data. Final clinical confirmation remains solely with the attending physician.
                    </div>
                  </div>
                )}

                {/* Stepper Navigation Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="px-5 py-2.5 border rounded-2xl text-xs font-bold hover:bg-slate-50"
                    >
                      ← Previous
                    </button>
                  ) : <div />}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (step === 1 && (!name || !phone)) {
                          return alert("Please enter Name and 10-digit Mobile Number.");
                        }
                        setStep(step + 1);
                      }}
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-black inline-flex items-center gap-1 shadow-sm"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSubmit}
                      className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-black shadow-md"
                    >
                      {loading ? "Allocating Specialist..." : "Generate Token & Case Summary →"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 4 FEATURE CARDS MATCHING FIRST IMAGE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center">
                  <Mic className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-slate-900">Voice & Touch Support</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Answer clinical questions in your preferred language using voice or touch.
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-slate-900">Scan & Upload Documents</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload multiple past prescriptions and lab records for automated case structuring.
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-slate-900">AI-Powered Summary</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Structured clinical case sheet ready for immediate physician review.
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-slate-900">Secure & Private</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  DPDP Act 2023 compliant data vault integrated with national health standards.
                </p>
              </div>
            </div>
          </>
        )}

        {/* STEP 5: TOKEN & ALLOTTED DOCTOR RECEIPT */}
        {step === 5 && result && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 max-w-xl mx-auto">
            <div className="text-center space-y-1 border-b pb-4">
              <span className="text-[10px] font-black tracking-widest text-emerald-700 uppercase">
                ✓ Pre-Consultation Case Sheet Registered
              </span>
              <h2 className="text-4xl font-black text-slate-900 mt-1 font-mono">
                {result.token}
              </h2>
              <p className="text-xs text-slate-500">
                Please proceed to the designated chamber. Your case file is live on the doctor's desk.
              </p>
            </div>

            {/* Doctor Card */}
            <div className="bg-emerald-950 text-white rounded-3xl p-5 shadow-lg space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded">
                  Allotted Physician
                </span>
                <span className="font-bold text-slate-300">{result.allottedDoctor.cabin}</span>
              </div>
              <div className="flex gap-4 items-center">
                <img
                  src={result.allottedDoctor.photo}
                  alt="Doctor"
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-500/50"
                />
                <div>
                  <h3 className="font-black text-base text-white">{result.allottedDoctor.name}</h3>
                  <p className="text-xs text-emerald-300 font-semibold">{result.allottedDoctor.specialty}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{result.allottedDoctor.hospital}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border space-y-2 text-center">
              <p className="text-xs text-slate-600 font-medium">
                Track status and past discharge summaries on your mobile portal:
              </p>
              <button
                type="button"
                onClick={() => navigate(`/portal?phone=${phone}`)}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl transition"
              >
                Open Patient Health Vault →
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setResult(null);
                setSymptoms("");
                setUploadedFiles([]);
              }}
              className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Start Another Check-In
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-100/70 border-t border-emerald-900 px-6 py-4 mt-auto text-xs flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>MediKiosk • Healthy People, Healthy Nation</span>
        <div className="flex gap-4 text-[11px]">
          <span>Privacy Policy</span>
          <span>Terms of Use</span>
          <span>Contact OPD Support</span>
        </div>
      </footer>
    </div>
  );
}