import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Supabase client - reads from your .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("ERROR: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file");
    process.exit(1);
}

console.log("Supabase URL:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
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

// ============================================
// API ENDPOINTS
// ============================================

// Health check
app.get("/", (req, res) => {
    res.json({ status: "ok", message: "CodeSapiens Email API is running" });
});

// Legacy email endpoint (keep for backward compatibility)
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

// Get all students
app.get("/api/students", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("uid, display_name, email, college, role, avatar")
            .eq("role", "student")
            .order("display_name", { ascending: true });

        if (error) throw error;

        res.json({ success: true, students: data || [] });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all users (including non-students)
app.get("/api/users", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("uid, display_name, email, college, role, avatar")
            .order("display_name", { ascending: true });

        if (error) throw error;

        res.json({ success: true, users: data || [] });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Send blog email to selected recipients
app.post("/api/send-blog-email", async (req, res) => {
    try {
        const { emails, blog } = req.body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ success: false, error: "No recipients provided" });
        }

        if (!blog || !blog.title || !blog.content) {
            return res.status(400).json({ success: false, error: "Invalid blog data" });
        }

        const htmlContent = generateBlogEmailHTML(blog);
        let successCount = 0;
        let failedEmails = [];

        // Send emails with rate limiting (100ms delay between each)
        for (const email of emails) {
            try {
                await transporter.sendMail({
                    from: '"CodeSapiens Blog" <suryasunrise261@gmail.com>',
                    to: email,
                    subject: `📚 New Blog: ${blog.title}`,
                    html: htmlContent,
                });
                successCount++;

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (emailError) {
                console.error(`Failed to send to ${email}:`, emailError.message);
                failedEmails.push(email);
            }
        }

        res.json({
            success: true,
            message: `Email sent to ${successCount} of ${emails.length} recipients`,
            successCount,
            failedCount: failedEmails.length,
            failedEmails: failedEmails.length > 0 ? failedEmails : undefined
        });

    } catch (error) {
        console.error("Error sending blog email:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Send blog email to all students
app.post("/api/send-blog-email-all", async (req, res) => {
    try {
        const { blog } = req.body;

        if (!blog || !blog.title || !blog.content) {
            return res.status(400).json({ success: false, error: "Invalid blog data" });
        }

        // Fetch all student emails
        const { data: students, error: fetchError } = await supabase
            .from("users")
            .select("email")
            .eq("role", "student");

        if (fetchError) throw fetchError;

        if (!students || students.length === 0) {
            return res.status(400).json({ success: false, error: "No students found" });
        }

        const emails = students.map(s => s.email).filter(Boolean);
        const htmlContent = generateBlogEmailHTML(blog);
        let successCount = 0;
        let failedEmails = [];

        // Send emails with rate limiting
        for (const email of emails) {
            try {
                await transporter.sendMail({
                    from: '"CodeSapiens Blog" <suryasunrise261@gmail.com>',
                    to: email,
                    subject: `📚 New Blog: ${blog.title}`,
                    html: htmlContent,
                });
                successCount++;

                // Delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (emailError) {
                console.error(`Failed to send to ${email}:`, emailError.message);
                failedEmails.push(email);
            }
        }

        res.json({
            success: true,
            message: `Email sent to ${successCount} of ${emails.length} students`,
            successCount,
            totalStudents: emails.length,
            failedCount: failedEmails.length,
            failedEmails: failedEmails.length > 0 ? failedEmails : undefined
        });

    } catch (error) {
        console.error("Error sending blog email to all:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Test email endpoint
app.post("/api/test-email", async (req, res) => {
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

        res.json({ success: true, message: `Test email sent to ${email}` });
    } catch (error) {
        console.error("Test email error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
