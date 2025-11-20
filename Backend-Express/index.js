import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import multer from "multer";
import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import helmet from "helmet";
import timeout from "express-timeout-handler";

dotenv.config({ debug: true });

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer to use /tmp directory for Vercel
const uploadDir = "/tmp/uploads";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log("[cAPi] : Created directory /tmp/uploads");
      }
      cb(null, uploadDir);
    } catch (error) {
      console.error("[cAPi] : Failed to create /tmp/uploads directory", error.message);
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') {
      return cb(new Error('Only PDF files are allowed'), false);
    }
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('File must be a valid PDF'), false);
    }
    cb(null, true);
  },
});

// Security Middleware
app.use(helmet());
app.disable('x-powered-by');
app.use(timeout.handler({
  timeout: 10000, // 10 seconds
  onTimeout: (req, res) => {
    res.status(408).json({ success: false, error: 'Request timed out' });
  },
}));

// Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many upload requests, please try again later.',
});

const captchaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many captcha verification requests, please try again later.',
});

// CORS Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "keyword", "state", "district", "offset"],
}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, keyword, state, district, offset");
  next();
});

app.use(express.json());

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Supabase Configuration
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_KEY || ""
);

// CSV Loader
let colleges = null;

async function loadCSV() {
  try {
    const url = "https://res.cloudinary.com/dqudvximt/raw/upload/v1759602659/database_maro0f.csv";
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }

    const data = await response.text();
    console.log("[cAPi] : File fetched from Cloudinary!");

    await new Promise((resolve, reject) => {
      parse(data, { columns: false }, (err, output) => {
        if (err) {
          console.error("[cAPi] : CSV parsing failed", err.message);
          reject(err);
          return;
        }
        colleges = output;
        console.log("[cAPi] : CSV Loaded! Total records:", colleges.length);
        resolve();
      });
    });
  } catch (err) {
    console.error("[cAPi] : Failed to load CSV file", err.message);
    throw err;
  }
}

// PDF Compression
async function compressPDF(inputPath, outputPath) {
  try {
    const existingPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    fs.writeFileSync(outputPath, pdfBytes);
    console.log("[cAPi] : PDF compressed successfully");
  } catch (error) {
    console.error("[cAPi] : PDF compression failed", error.message);
    throw error;
  }
}

// Routes
app.get("/", (req, res) => {
  res.json({ 
    message: "Colleges API : SriGuru Institute of Technology, Coimbatore",
    status: "running",
    version: "1.0.0",
    endpoints: {
      colleges: "/colleges/*",
      captcha: "/verify-turnstile, /verify-hcaptcha",
      resume: "/upload-resume, /delete-resume"
    }
  });
});

app.post("/colleges/total", (req, res) => {
  if (!colleges) return res.status(500).json({ error: "Data not loaded" });
  res.json({ total: colleges.length });
});

app.post(
  "/colleges/search",
  [
    body('keyword').optional().isString().trim().escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    if (!colleges) return res.status(500).json({ error: "Data not loaded" });

    const keyword = req.headers.keyword?.toLowerCase() || "";
    const result = colleges
      .filter((row) => !keyword || row[2]?.toLowerCase().includes(keyword))
      .map((row) => {
        const cleanedRow = [...row];
        cleanedRow[2] = cleanedRow[2].replace(/\s*\(ID?:[^)]*\)$/i, "").trim();
        cleanedRow[1] = cleanedRow[1].replace(/\s*\(ID?:[^)]*\)$/i, "").trim();
        return cleanedRow;
      });

    res.json(result);
  }
);

app.post(
  "/colleges/state",
  [
    body('state').notEmpty().withMessage('State is required').isString().trim().escape(),
    body('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    if (!colleges) return res.status(500).json({ error: "Data not loaded" });

    const state = req.headers.state?.toLowerCase();
    const offset = Number(req.headers.offset) || 0;

    const result = colleges
      .filter((row) => row[4]?.toLowerCase().includes(state))
      .map((row) => {
        const cleanedRow = [...row];
        cleanedRow[2] = cleanedRow[2].replace(/\s*\(ID?:[^)]*\)$/i, "").trim();
        cleanedRow[1] = cleanedRow[1].replace(/\s*\(ID?:[^)]*\)$/i, "").trim();
        return cleanedRow;
      });

    res.json(result.slice(offset, offset + 10));
  }
);

app.post(
  "/colleges/district",
  [
    body('district').notEmpty().withMessage('District is required').isString().trim().escape(),
    body('offset').optional().isInt({ min: -1 }).withMessage('Offset must be an integer'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    if (!colleges) return res.status(500).json({ error: "Data not loaded" });

    const district = req.headers.district?.toLowerCase();
    const offset = Number(req.headers.offset) || -1;

    const result = colleges
      .filter((row) => row[5]?.toLowerCase().includes(district))
      .map((row) => {
        const cleanedRow = [...row];
        cleanedRow[2] = cleanedRow[2].replace(/\s*\(ID?:[^)]*\)$/i, "").trim();
        cleanedRow[1] = cleanedRow[1].replace(/\s*\(ID?:[^)]*\)$/i, "").trim();
        return cleanedRow;
      });

    res.json(offset === -1 ? result : result.slice(offset, offset + 10));
  }
);

app.post("/allstates", (req, res) => {
  if (!colleges) return res.status(500).json({ error: "Data not loaded" });
  const result = [...new Set(colleges.slice(1).map((row) => row[4]))];
  res.json(result);
});

app.post(
  "/districts",
  [
    body('state').notEmpty().withMessage('State is required').isString().trim().escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    if (!colleges) return res.status(500).json({ error: "Data not loaded" });

    const state = req.headers.state?.toLowerCase();
    const result = [...new Set(colleges.filter((row) => row[4]?.toLowerCase().includes(state)).map((row) => row[5]))];
    res.json(result);
  }
);

app.post("/verify-hcaptcha", captchaLimiter, async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, error: "missing-token" });

  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) return res.status(500).json({ success: false, error: "missing-secret" });

  try {
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);

    const verifyRes = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      body: params,
    });

    const body = await verifyRes.json();
    console.log("[cAPi] : hCaptcha verification completed", { success: body.success });
    res.json(body);
  } catch (err) {
    console.error("[cAPi] : hCaptcha verification error", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/verify-turnstile", captchaLimiter, async (req, res) => {
  const { token } = req.body;
  
  console.log("[cAPi] : Received Turnstile verification request");
  console.log("[cAPi] : Token present:", !!token);
  
  if (!token) {
    console.error("[cAPi] : No token provided in request");
    return res.status(400).json({ success: false, error: "missing-token" });
  }

  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) {
    console.error("[cAPi] : Missing TURNSTILE_SECRET environment variable");
    return res.status(500).json({ success: false, error: "missing-secret" });
  }

  try {
    console.log("[cAPi] : Verifying Turnstile token with Cloudflare");
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);

    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: params,
    });

    if (!verifyRes.ok) {
      console.error("[cAPi] : Cloudflare API returned non-OK status:", verifyRes.status);
      throw new Error(`Cloudflare API error: ${verifyRes.status}`);
    }

    const body = await verifyRes.json();
    console.log("[cAPi] : Turnstile verification completed", { 
      success: body.success, 
      errorCodes: body['error-codes'],
      hostname: body.hostname,
      timestamp: body.challenge_ts
    });

    if (body.success) {
      return res.json({ success: true, message: "Verification successful" });
    } else {
      console.error("[cAPi] : Turnstile verification failed", body['error-codes']);
      return res.status(400).json({ 
        success: false, 
        error: body['error-codes']?.join(', ') || "Verification failed" 
      });
    }
  } catch (err) {
    console.error("[cAPi] : Turnstile verification error", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post(
  "/upload-resume",
  uploadLimiter,
  upload.single("resume"),
  [
    body('userId').notEmpty().withMessage('userId is required').isString().withMessage('userId must be a string'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const inputPath = req.file?.path;
    if (!inputPath) return res.status(400).json({ success: false, error: "No file uploaded" });

    const userId = req.body.userId;
    const outputPath = path.join(uploadDir, `compressed_${Date.now()}.pdf`);

    try {
      await compressPDF(inputPath, outputPath);

      const fileName = `resumes/${userId}-resume.pdf`;
      const result = await cloudinary.uploader.upload(outputPath, {
        resource_type: "raw",
        public_id: fileName,
        folder: "resumes",
        overwrite: true,
        upload_preset: "resumes_unsigned",
      });

      const { error: updateError } = await supabase
        .from("users")
        .update({ resume_url: result.secure_url })
        .eq("uid", userId);

      if (updateError) {
        throw new Error(`Failed to update resume URL in database: ${updateError.message}`);
      }

      try {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      } catch (cleanupErr) {
        console.error("[cAPi] : Cleanup failed", cleanupErr.message);
      }

      console.log("[cAPi] : Resume uploaded successfully for user:", userId, "URL:", result.secure_url);
      res.json({ success: true, url: result.secure_url });
    } catch (error) {
      console.error("[cAPi] : Resume upload error", error.message);

      try {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      } catch (cleanupErr) {
        console.error("[cAPi] : Cleanup failed", cleanupErr.message);
      }

      res.status(500).json({ success: false, error: error.message });
    }
  }
);

app.options("/delete-resume", (req, res) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.sendStatus(204);
});

app.delete(
  "/delete-resume",
  [
    body('userId').notEmpty().withMessage('userId is required').isString().withMessage('userId must be a string'),
  ],
  async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { userId } = req.body;

    try {
      const publicId = `resumes/${userId}-resume.pdf`;
      console.log("[cAPi] : Attempting to delete resume with public_id:", publicId);

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "raw",
        invalidate: true,
      });

      console.log("[cAPi] : Cloudinary delete result:", result);

      if (result.result === "ok" || result.result === "not found") {
        const { error: updateError } = await supabase
          .from("users")
          .update({ resume_url: null })
          .eq("uid", userId);

        if (updateError) {
          console.error("[cAPi] : Supabase update error:", updateError.message);
          throw new Error(`Failed to update database: ${updateError.message}`);
        }

        console.log("[cAPi] : Resume deletion processed for user:", userId, "Cloudinary result:", result.result);
        res.json({
          success: true,
          message: result.result === "ok" ? "Resume deleted successfully" : "Resume not found in storage, database updated",
        });
      } else {
        throw new Error(`Cloudinary deletion failed: ${result.result}`);
      }
    } catch (error) {
      console.error("[cAPi] : Resume deletion error:", error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    csvLoaded: !!colleges,
    totalColleges: colleges ? colleges.length : 0
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("[cAPi] : Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error"
  });
});

// Start server
loadCSV()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[cAPi] : Server listening on port ${PORT}`);
      console.log(`[cAPi] : Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[cAPi] : CORS enabled for all origins`);
      console.log(`[cAPi] : API Base URL: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[cAPi] : Failed to start server", err.message);
    process.exit(1);
  });