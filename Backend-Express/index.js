import express from "express";
import nodemailer from "nodemailer";
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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


dotenv.config({ debug: true });

const app = express();
const PORT = process.env.PORT || 3001;

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
  timeout: 60000, // 60 seconds
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

// CORS Configuration
const allowedOrigins = [
  "https://codesapiens.in",
  "https://www.codesapiens.in",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://codesapiens-site.vercel.app",
  "https://colleges-name-api.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "DELETE", "OPTIONS", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization", "x-client-source", "keyword", "state", "district", "offset"],
  credentials: true
}));

// Client Source Verification Middleware
const verifyClientSource = (req, res, next) => {
  const clientSource = req.headers['x-client-source'];
  // Allow requests without source if they are simple GETs to root/health
  if (req.path === '/' || req.path === '/health') return next();

  if (clientSource !== 'codesapiens-web') {
    console.warn(`[Security] Blocked request from invalid source: ${clientSource} Path: ${req.path}`);
    return res.status(403).json({ success: false, error: 'Unauthorized Client Source' });
  }
  next();
};

// Authentication Verification Middleware
const verifyAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Missing authentication token' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Invalid authentication format' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("[Security] Invalid token:", error?.message);
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("[Security] Auth verification error:", err);
    return res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};

app.use(verifyClientSource);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Supabase Configuration
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
);

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true, // Use pooled connections
  maxConnections: 5,
  maxMessages: 100,
  auth: {
    user: "suryasunrise261@gmail.com",
    pass: "bgbd rdmx psjl rbfg ",
  },
});



// Generate HTML email template for blog
const generateBlogEmailHTML = (blog, unsubscribeLink = "#") => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${blog.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">CodeSapiens Blog</h1>
            </td>
          </tr>
          
          <!-- Cover Image -->
          ${blog.cover_image ? `
          <tr>
            <td style="padding: 0;">
              <img src="${blog.cover_image}" alt="${blog.title}" style="width: 100%; height: auto; display: block;">
            </td>
          </tr>
          ` : ''}
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 28px; font-weight: 700; line-height: 1.3;">
                ${blog.title}
              </h2>
              
              ${blog.excerpt ? `
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6; font-style: italic;">
                ${blog.excerpt}
              </p>
              ` : ''}
              
              <div style="color: #374151; font-size: 16px; line-height: 1.8;">
                ${blog.content}
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="margin: 32px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 8px;">
                    <a href="https://codesapiens.in/blog/${blog.slug || ''}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Read Full Article →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                You're receiving this because you're a member of CodeSapiens.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} CodeSapiens. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

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

app.post("/colleges/total", verifyAuth, (req, res) => {
  if (!colleges) return res.status(500).json({ error: "Data not loaded" });
  res.json({ total: colleges.length });
});

app.post(
  "/colleges/search",
  verifyAuth,
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
  verifyAuth,
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
  verifyAuth,
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

app.post("/allstates", verifyAuth, (req, res) => {
  if (!colleges) return res.status(500).json({ error: "Data not loaded" });
  const result = [...new Set(colleges.slice(1).map((row) => row[4]))];
  res.json(result);
});

app.post(
  "/districts",
  verifyAuth,
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
  verifyAuth,
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
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-source",
  });
  res.sendStatus(204);
});

app.delete(
  "/delete-resume",
  verifyAuth,
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

// ============================================
// HALL OF FAME IMAGE UPLOAD
// ============================================

// Configure multer for image uploads
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `halloffame-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, GIF, and WEBP images are allowed'), false);
    }
    cb(null, true);
  },
});

app.post(
  "/upload-hall-of-fame",
  verifyAuth,
  uploadLimiter,
  imageUpload.single("image"),
  [
    body('studentName').optional().isString().trim(),
    body('description').optional().isString().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const inputPath = req.file?.path;
    if (!inputPath) {
      return res.status(400).json({ success: false, error: "No image file uploaded" });
    }

    const { studentName, description } = req.body;

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(inputPath, {
        resource_type: "image",
        folder: "hall-of-fame",
        transformation: [
          { width: 800, height: 800, crop: "limit" }, // Resize to max 800x800
          { quality: "auto:good" }, // Auto optimize quality
        ],
      });

      // Insert into Supabase
      const { data: insertedEntry, error: insertError } = await supabase
        .from("hall_of_fame")
        .insert({
          image_url: result.secure_url,
          student_name: studentName || null,
          description: description || null,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to insert entry into database: ${insertError.message}`);
      }

      // Cleanup temp file
      try {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      } catch (cleanupErr) {
        console.error("[cAPi] : Cleanup failed", cleanupErr.message);
      }

      console.log("[cAPi] : Hall of Fame image uploaded successfully:", result.secure_url);
      res.json({
        success: true,
        url: result.secure_url,
        entry: insertedEntry,
      });
    } catch (error) {
      console.error("[cAPi] : Hall of Fame upload error", error.message);

      // Cleanup temp file on error
      try {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      } catch (cleanupErr) {
        console.error("[cAPi] : Cleanup failed", cleanupErr.message);
      }

      res.status(500).json({ success: false, error: error.message });
    }
  }
);
// ============================================

// ============================================
// COMMUNITY PHOTOS UPLOAD
// ============================================

app.post(
  "/upload-community-photo",
  verifyAuth,
  uploadLimiter,
  imageUpload.single("image"),
  [
    body('title').notEmpty().withMessage('Title is required').isString().trim(),
    body('date').optional().isString().trim(),
    body('description').optional().isString().trim(),
    body('participants').optional().isInt({ min: 0 }).withMessage('Participants must be a non-negative integer'),
    body('orderNumber').optional().isInt({ min: 0 }).withMessage('Order number must be a non-negative integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const inputPath = req.file?.path;
    if (!inputPath) {
      return res.status(400).json({ success: false, error: "No image file uploaded" });
    }

    const { title, date, description, participants, orderNumber } = req.body;

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(inputPath, {
        resource_type: "image",
        folder: "community-photos",

        transformation: [
          { width: 1200, height: 800, crop: "limit" },
          { quality: "auto:good" },
        ],
      });

      // Insert into Supabase
      const { data: insertedEntry, error: insertError } = await supabase
        .from("community_photos")
        .insert({
          title: title,
          image_url: result.secure_url,
          date: date || null,
          description: description || null,
          participants: parseInt(participants) || 0,
          order_number: parseInt(orderNumber) || 0,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to insert entry into database: ${insertError.message}`);
      }

      // Cleanup temp file
      try {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      } catch (cleanupErr) {
        console.error("[cAPi] : Cleanup failed", cleanupErr.message);
      }

      console.log("[cAPi] : Community photo uploaded successfully:", result.secure_url);
      res.json({
        success: true,
        url: result.secure_url,
        entry: insertedEntry,
      });
    } catch (error) {
      console.error("[cAPi] : Community photo upload error", error.message);

      // Cleanup temp file on error
      try {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      } catch (cleanupErr) {
        console.error("[cAPi] : Cleanup failed", cleanupErr.message);
      }

      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Update community photo order (bulk update)
app.put("/update-community-photo-order", verifyAuth, async (req, res) => {
  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ success: false, error: "Updates array is required" });
    }

    // Update each photo's order number
    for (const update of updates) {
      const { id, order_number } = update;
      if (!id || typeof order_number !== 'number') continue;

      const { error } = await supabase
        .from("community_photos")
        .update({ order_number })
        .eq("id", id);

      if (error) {
        console.error(`[cAPi] : Failed to update order for ${id}:`, error.message);
      }
    }

    console.log(`[cAPi] : Updated order for ${updates.length} community photos`);
    res.json({ success: true, message: `Updated ${updates.length} entries` });
  } catch (error) {
    console.error("[cAPi] : Community photo order update error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
// ============================================

// Get all students
app.get("/api/students", verifyAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("uid, display_name, email, college, role, avatar")
      .eq("role", "student")
      .order("display_name", { ascending: true });

    if (error) throw error;

    res.json({ success: true, students: data || [] });
  } catch (error) {
    console.error("[cAPi] : Error fetching students:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all users (including non-students)
app.get("/api/users", verifyAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("uid, display_name, email, college, role, avatar")
      .order("display_name", { ascending: true });

    if (error) throw error;

    res.json({ success: true, users: data || [] });
  } catch (error) {
    console.error("[cAPi] : Error fetching users:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send blog email to selected recipients
app.post("/api/send-blog-email", verifyAuth, async (req, res) => {
  try {
    const { emails, blog } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ success: false, error: "No recipients provided" });
    }

    if (!blog || !blog.title || !blog.content) {
      return res.status(400).json({ success: false, error: "Invalid blog data" });
    }

    const htmlContent = generateBlogEmailHTML(blog);

    // Send email with BCC
    await transporter.sendMail({
      from: '"CodeSapiens Blog" <suryasunrise261@gmail.com>',
      to: "suryasunrise261@gmail.com", // Send to self/admin as primary recipient
      bcc: emails, // All recipients in BCC
      subject: `📚 New Blog: ${blog.title}`,
      html: htmlContent,
    });

    console.log(`[cAPi] : ✅ Email sent to ${emails.length} recipients via BCC`);

    res.json({
      success: true,
      message: `Email sent to ${emails.length} recipients`,
      count: emails.length,
    });

  } catch (error) {
    console.error("[cAPi] : Error sending blog emails:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send blog email to all users
app.post("/api/send-blog-email-all", verifyAuth, async (req, res) => {
  try {
    const { blog } = req.body;

    if (!blog || !blog.title || !blog.content) {
      return res.status(400).json({ success: false, error: "Invalid blog data" });
    }

    // Fetch all users (students and others)
    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("email");

    if (fetchError) throw fetchError;

    if (!users || users.length === 0) {
      return res.status(400).json({ success: false, error: "No users found" });
    }

    const emails = users.map(u => u.email).filter(Boolean);

    if (emails.length === 0) {
      return res.status(400).json({ success: false, error: "No valid email addresses found" });
    }

    const htmlContent = generateBlogEmailHTML(blog);

    // Send email with BCC
    await transporter.sendMail({
      from: '"CodeSapiens Blog" <suryasunrise261@gmail.com>',
      to: "suryasunrise261@gmail.com", // Send to self/admin as primary recipient
      bcc: emails, // All recipients in BCC
      subject: `📚 New Blog: ${blog.title}`,
      html: htmlContent,
    });

    console.log(`[cAPi] : ✅ Email sent to ${emails.length} users via BCC`);

    res.json({
      success: true,
      message: `Email sent to ${emails.length} users`,
      count: emails.length,
    });

  } catch (error) {
    console.error("[cAPi] : Error sending blog email to all:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test email endpoint
app.post("/api/test-email", verifyAuth, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    await transporter.sendMail({
      from: '"CodeSapiens" <suryasunrise261@gmail.com>',
      to: email,
      subject: "Test Email from CodeSapiens",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🎉 Email Configuration Working!</h2>
          <p>This is a test email from the CodeSapiens Blog Email System.</p>
          <p>If you received this, the email system is configured correctly.</p>
        </div>
      `,
    });

    console.log(`[cAPi] : ✅ Test email sent to ${email}`);
    res.json({ success: true, message: `Test email sent to ${email}` });
  } catch (error) {
    console.error("[cAPi] : Test email error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Legacy email endpoint (for backward compatibility)
app.get("/send-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: "suryasunrise261@gmail.com",
      to: "suryasuperman261@gmail.com",
      subject: "Hello!",
      text: "This is a test message.",
    });
    res.send("Email sent!");
  } catch (error) {
    res.send("Error: " + error.message);
  }
});



// Public Stats Endpoint
app.get("/api/public-stats", async (req, res) => {
  try {
    // 1. Total Users
    const { count: userCount, error: userError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (userError) throw userError;

    // 2. Colleges Stats (Top 5)
    // Fetch all users (service key allows this) to aggregate in memory
    const { data: users, error: dataError } = await supabase
      .from("users")
      .select("college");

    if (dataError) throw dataError;

    const collegeMap = {};
    users.forEach(u => {
      // Normalize college name (trim, etc) if needed
      const c = u.college ? u.college.trim() : "Others";
      if (c !== "Others" && c !== "Codesapiens Univ") {
        collegeMap[c] = (collegeMap[c] || 0) + 1;
      }
    });

    const uniqueColleges = Object.keys(collegeMap).length;

    const topColleges = Object.entries(collegeMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      success: true,
      stats: {
        totalUsers: userCount,
        totalColleges: uniqueColleges,
        topColleges
      }
    });

  } catch (error) {
    console.error("[cAPi] : Stats error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Gemini Wrapper Endpoint
app.post("/api/analyze-resume", async (req, res) => {
  try {
    const { resumeText, jobDescription, analysisMode } = req.body;

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return res.status(500).json({ error: "Server configuration error: Gemini API key missing" });
    }

    if (!resumeText) {
      return res.status(400).json({ error: "Missing resume text" });
    }

    let prompt = '';

    if (analysisMode === 'jd') {
      prompt = `
            You are an expert ATS (Applicant Tracking System) and Career Coach.
            Compare the following Resume text against the Job Description (JD).
            
            Resume Text:
            ${resumeText}
            
            Job Description:
            ${jobDescription}
            
            Provide a detailed analysis in strictly raw JSON format (no markdown code blocks, no explanation text).
            Ensure all strings are properly escaped.
            The JSON structure must be:
            {
              "matchPercentage": number (0-100),
              "summary": "string (brief overview of fit)",
              "strengths": "markdown string (bullet points)",
              "weaknesses": "markdown string (missing skills/experience)",
              "improvements": "markdown string (concrete suggestions to improve the resume for this JD)"
            }
        `;
    } else {
      prompt = `
            You are an expert Career Coach and Resume Reviewer.
            Analyze the following Resume text to provide general feedback on how to improve it for a professional career.
            
            Resume Text:
            ${resumeText}
            
            Provide a detailed analysis in strictly raw JSON format (no markdown code blocks, no explanation text).
            Ensure all strings are properly escaped.
            The JSON structure must be:
            {
              "matchPercentage": number (0-100, representing overall resume quality score),
              "summary": "string (brief summary of the candidate's profile)",
              "strengths": "markdown string (strong points of the resume)",
              "weaknesses": "markdown string (formatting issues, missing sections, unclear descriptions)",
              "improvements": "markdown string (actionable tips to make the resume stand out generally)"
            }
        `;
    }

    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) {
      throw new Error(`AI Analysis failed: ${response.statusText}`);
    }

    const result = await response.json();
    return res.json(result);

  } catch (error) {
    console.error("Error in /api/analyze-resume:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

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