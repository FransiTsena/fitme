import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt, admin } from "better-auth/plugins";
import { db } from "../models/authDb.js";
import { sendEmail } from "./email.js";

export const auth = betterAuth({
  database: mongodbAdapter(db),

  // JWT Secret for signing tokens (better-auth uses BETTER_AUTH_SECRET by default)
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
  },

  // Session configuration - using JWT instead of database sessions
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes cache
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,

    sendVerificationEmail: async ({ user, url }) => {
      const isOwner = (user as any).registrationRole === "owner" || (user as any).role === "owner";
      const uploadUrl = `${process.env.FRONTEND_URL}/owner/upload-documents`;

      const subject = "Verify your email - FitMe App";

      // Different email content for owners vs regular members
      const html = isOwner
        ? `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to FitMe, Gym Owner!</h2>
            <p>Thank you for registering your gym on FitMe. To get started, please complete these steps:</p>
            
            <h3 style="color: #007bff;">Step 1: Verify Your Email</h3>
            <p>Click the button below to verify your email address:</p>
            <a
              href="${url}"
              style="display:inline-block;padding:12px 24px;
                     background:#007bff;color:#fff;
                     text-decoration:none;border-radius:5px;
                     font-weight:bold;">
              Verify Email Address
            </a>
            
            <h3 style="color: #007bff; margin-top: 30px;">Step 2: Upload Verification Documents</h3>
            <p>After verifying your email, please upload the following documents for account verification:</p>
            <ul>
              <li>Business registration certificate</li>
              <li>Gym ownership proof or lease agreement</li>
              <li>Valid government-issued ID</li>
            </ul>
            <a
              href="${uploadUrl}"
              style="display:inline-block;padding:12px 24px;
                     background:#28a745;color:#fff;
                     text-decoration:none;border-radius:5px;
                     font-weight:bold;">
              Upload Documents
            </a>
            
            <p style="margin-top:20px;font-size:14px;color:#666;">
              Your gym owner account will be activated after document verification (usually within 24-48 hours).
            </p>
            <p style="margin-top:20px;font-size:14px;color:#666;">
              If the buttons don't work, copy and paste these links:
            </p>
            <p style="word-break:break-all;font-size:12px;color:#007bff;">
              Verify Email: ${url}
            </p>
            <p style="word-break:break-all;font-size:12px;color:#28a745;">
              Upload Documents: ${uploadUrl}
            </p>
          </div>
        `
        : `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to FitMe!</h2>
            <p>Click the button below to verify your email address and get started.</p>
            <a
              href="${url}"
              style="display:inline-block;padding:12px 24px;
                     background:#007bff;color:#fff;
                     text-decoration:none;border-radius:5px;
                     font-weight:bold;">
              Verify Email Address
            </a>
            <p style="margin-top:20px;font-size:14px;color:#666;">
              If the button doesn't work, copy and paste this link:
            </p>
            <p style="word-break:break-all;font-size:12px;color:#007bff;">
              ${url}
            </p>
          </div>
        `;

      // Only send email if SMTP is enabled
      if (process.env.SMTP_ENABLED !== 'false' && process.env.SMTP_ENABLED !== '0') {
        await sendEmail({
          to: user.email,
          subject,
          html,
        });
      } else {
        console.log(`📧 Verification email would have been sent to ${user.email} (SMTP disabled)`);
      }
    },
  },

  plugins: [
    jwt({
      jwt: {
        expirationTime: "7d", // Token expires in 7 days
        // Custom JWT claims can be added here
      },
    }),
    admin(),
  ],

  user: {
    additionalFields: {
      fatherName: { type: "string", required: false },
      phone: { type: "string", required: false },
      registrationRole: {
        type: "string",
        required: false,
        input: true,
      },
      status: {
        type: "string",
        defaultValue: "active",
      },
      city: { type: "string", required: false },
      area: { type: "string", required: false },
      profileImage: { type: "string", required: false },
      // Owner document verification fields
      ownerDocuments: { type: "string[]", required: false },
      documentStatus: {
        type: "string",
        defaultValue: "not_submitted",
        required: false,
      },
      documentSubmittedAt: { type: "date", required: false },
      documentReviewedAt: { type: "date", required: false },
      documentReviewedBy: { type: "string", required: false },
      documentReviewNotes: { type: "string", required: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const registrationRole = (user as any).registrationRole;
          const allowedRoles = ["member", "owner"];

          return {
            data: {
              ...user,
              role: allowedRoles.includes(registrationRole)
                ? registrationRole
                : "member",
            },
          };
        },
      },
    },
  },
});
