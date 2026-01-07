import nodemailer, { type TransportOptions } from "nodemailer";

/**
 * Validate required environment variables
 */
const requiredEnvVars = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
];

// Check if SMTP is enabled
const isSmtpEnabled = process.env.SMTP_ENABLED !== 'false' && process.env.SMTP_ENABLED !== '0';

if (isSmtpEnabled) {
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      throw new Error(`❌ Missing environment variable: ${key}`);
    }
  }
}

/**
 * Create SMTP Transporter
 */
let transporter;
if (isSmtpEnabled) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  } as TransportOptions);
}

/**
 * Verify SMTP connection on startup
 */
if (isSmtpEnabled) {
  console.log(`📡 Attempting to connect to SMTP server: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}...`);
  transporter.verify()
    .then(() => console.log("✅ SMTP server is ready to send emails"))
    .catch((err) => {
      console.error(`❌ SMTP configuration error (Host: ${process.env.SMTP_HOST}, Port: ${process.env.SMTP_PORT}):`);
      console.error(err);
      // In dev, we might not want to exit if email is not critical for all features
      // but Better Auth might fail if it tries to send verification emails.
      // process.exit(1); 
    });
} else {
  console.log("📧 SMTP is disabled. Email sending is turned off.");
}

/**
 * Email payload interface
 */
interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email function
 */
export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailParams) => {
  // If SMTP is not enabled, log the email instead of sending it
  if (!isSmtpEnabled) {
    console.log(`📧 Email would have been sent (SMTP disabled):\nTo: ${to}\nSubject: ${subject}\nHTML: ${html}`);
    return { messageId: 'smtp-disabled', response: 'SMTP disabled - email not sent' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"FitMe App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📨 Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Email delivery failed");
  }
};
