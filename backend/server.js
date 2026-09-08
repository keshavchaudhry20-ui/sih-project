import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Production URI with fail-safe in-memory cache
const MONGO_URI =
  "mongodb+srv://keshavchaudhry20_db_user:Keshav12345@cluster0.g31hryn.mongodb.net/medikiosk?retryWrites=true&w=majority";

let isDbConnected = false;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    isDbConnected = true;
    console.log("✓ MongoDB Atlas Connected Successfully!");
  })
  .catch((err) => {
    console.log("! In-Memory Cache Active (Fallback Mode):", err.message);
    isDbConnected = false;
  });

// Schemas
const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  city: { type: String, default: "New Delhi" },
  hospital: { type: String, default: "All India Institute of Ayurveda" },
  specialty: { type: String, default: "Kayachikitsa (Ayurvedic Medicine)" },
  degree: { type: String, default: "BAMS, MD" },
  cabin: { type: String, default: "Chamber 12, AYUSH OPD Wing" },
  photo: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format"
  },
  createdAt: { type: Date, default: Date.now }
});

const PatientSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  phone: { type: String, required: true },
  consultationType: { type: String, default: "Ayurveda" },
  rawText: { type: String, required: true },
  duration: { type: String, default: "3 days" },
  severityScore: { type: Number, default: 2 },
  triagePriority: { type: String, default: "P3 (Routine)" },
  agni: { type: String, default: "Normal" },
  nidra: { type: String, default: "Sound" },
  dietLifestyle: { type: String, default: "Normal" },
  pastHistory: { type: String },
  medications: { type: String },
  uploadedFiles: { type: Array, default: [] },
  allottedDoctorId: { type: String },
  allottedDoctorName: { type: String },
  allottedDoctorCabin: { type: String },
  allottedDoctorHospital: { type: String },
  status: { type: String, default: "Waiting" },
  diagnosis: { type: String, default: "" },
  rx: { type: String, default: "" },
  advice: { type: String, default: "" },
  assignedSlot: { type: String, default: "" },
  doctorVerification: { type: Object, default: {} },
  createdAtTime: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
const Patient = mongoose.models.Patient || mongoose.model("Patient", PatientSchema);

let memoryDoctors = [
  {
    _id: "doc_101",
    id: "doc_101",
    name: "Vaidya R. K. Sharma",
    email: "vaidya.sharma@aiia.gov.in",
    password: "123",
    city: "New Delhi",
    hospital: "All India Institute of Ayurveda",
    specialty: "Kayachikitsa (Ayurvedic Medicine)",
    degree: "BAMS, MD",
    cabin: "Chamber 12, AYUSH OPD Wing",
    photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format"
  }
];

let memoryPatients = [];
let memoryThankYous = [];

// API Endpoints
app.post("/api/doctor/register", async (req, res) => {
  try {
    const { name, email, password, city, hospital, specialty, degree, cabin, photo } = req.body;
    const docObj = {
      name,
      email: email.toLowerCase().trim(),
      password,
      city: city || "New Delhi",
      hospital: hospital || "All India Institute of Ayurveda",
      specialty: specialty || "Kayachikitsa",
      degree: degree || "BAMS, MD",
      cabin: cabin || "Chamber 12",
      photo: photo || "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format"
    };

    if (isDbConnected) {
      const newDoc = await Doctor.create(docObj);
      return res.json({ success: true, doctor: newDoc });
    }
    const fakeId = `doc_${Date.now()}`;
    const savedDoc = { ...docObj, _id: fakeId, id: fakeId };
    memoryDoctors.push(savedDoc);
    res.json({ success: true, doctor: savedDoc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/doctor/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || "").toLowerCase().trim();
    if (isDbConnected) {
      const doc = await Doctor.findOne({ email: cleanEmail, password });
      if (doc) return res.json({ success: true, doctor: doc });
    }
    const memDoc = memoryDoctors.find((d) => d.email === cleanEmail && d.password === password);
    if (memDoc) return res.json({ success: true, doctor: memDoc });
    res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/intake", async (req, res) => {
  try {
    const body = req.body;
    const token = `TK-${Math.floor(100 + Math.random() * 900)}`;

    let docList = isDbConnected ? await Doctor.find({}) : memoryDoctors;
    if (!docList.length) docList = memoryDoctors;
    const matchedDoc = docList[0];

    const patientData = {
      token,
      name: body.name,
      age: body.age,
      gender: body.gender,
      phone: body.phone,
      consultationType: body.consultationType,
      rawText: body.rawText,
      duration: body.duration,
      severityScore: Number(body.severity) || 2,
      triagePriority: Number(body.severity) >= 8 ? "P1 Critical" : "P3 Routine",
      agni: body.agni,
      nidra: body.nidra,
      dietLifestyle: body.dietLifestyle,
      pastHistory: body.pastHistory,
      medications: body.medications,
      uploadedFiles: body.uploadedFiles || [],
      allottedDoctorId: matchedDoc._id ? matchedDoc._id.toString() : matchedDoc.id,
      allottedDoctorName: matchedDoc.name,
      allottedDoctorCabin: matchedDoc.cabin,
      allottedDoctorHospital: matchedDoc.hospital,
      status: "Waiting",
      createdAtTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    if (isDbConnected) await Patient.create(patientData);
    memoryPatients.push(patientData);

    res.json({
      success: true,
      token,
      allottedDoctor: matchedDoc
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/doctor/queue/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    let allPatients = isDbConnected
      ? await Patient.find({ allottedDoctorId: doctorId }).sort({ severityScore: -1 })
      : memoryPatients.filter((p) => p.allottedDoctorId === doctorId);

    const activeQueue = allPatients.filter((p) => p.status === "Waiting");
    res.json({ success: true, activeQueue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/doctor/prescribe", async (req, res) => {
  try {
    const { token, diagnosis, rx, advice, assignedSlot, doctorVerification } = req.body;
    if (isDbConnected) {
      await Patient.findOneAndUpdate(
        { token },
        { diagnosis, rx, advice, assignedSlot, doctorVerification, status: "Consulted" }
      );
    }
    const p = memoryPatients.find((x) => x.token === token);
    if (p) {
      p.diagnosis = diagnosis;
      p.rx = rx;
      p.advice = advice;
      p.assignedSlot = assignedSlot;
      p.doctorVerification = doctorVerification;
      p.status = "Consulted";
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/patient/vault/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const records = isDbConnected
      ? await Patient.find({ phone }).sort({ createdAt: -1 })
      : memoryPatients.filter((p) => p.phone === phone);
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/dev/reset-database", async (req, res) => {
  try {
    if (isDbConnected) await Patient.deleteMany({});
    memoryPatients = [];
    res.json({ success: true, message: "Database wiped clean!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✓ Smart AYUSH OPD Server Running on Port ${PORT}`);
});