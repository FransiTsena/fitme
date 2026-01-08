import { auth } from "../utils/auth.js";
import { User } from "../models/userModel.js";
import { Gym } from "../models/gymModel.js";
import { sendEmail } from "../utils/email.js";
import { ObjectId } from "mongodb";

export const userService = {
  /**
   * Sign up a new user using Better Auth
   */
  signup: async (userData: any) => {
    return await auth.api.signUpEmail({
      body: userData,
    });
  },

  /**
   * Login user and return session data including token
   */
  login: async (email: string, password: string) => {
    const headers = new Headers();
    headers.set("content-type", "application/json");

    const internalReq = new Request(`${process.env.BACKEND_URL || 'http://localhost:3005'}/api/auth/sign-in/email`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, password }),
    });

    const internalRes = await auth.handler(internalReq);
    const data = await internalRes.json();

    if (!data.user) {
      console.error("❌ Login failed: No user in response", data);
      throw new Error("Invalid credentials");
    }

    // Better-auth 1.x usually returns the token in data.token or data.session.token
    let sessionToken = data.token || data.session?.token;

    // Fallback: Extract the full signed session token from Set-Cookie header if not in data
    const setCookie = internalRes.headers.get("set-cookie");
    if (!sessionToken && setCookie) {
      const match = setCookie.match(/better-auth\.session_token=([^;]+)/);
      if (match) {
        sessionToken = decodeURIComponent(match[1] ?? "");
      }
    }

    if (!sessionToken) {
      console.warn("⚠️ Warning: No session token found in login response or cookies");
    }

    return {
      user: data.user,
      token: sessionToken,
    };
  },

  /**
   * Get session by token
   */
  getSession: async (token: string) => {
    return await auth.api.getSession({
      headers: new Headers({
        cookie: `better-auth.session_token=${encodeURIComponent(token ?? "")}`,
      }),
    });
  },

  /**
   * Logout user by revoking session
   */
  logout: async (token: string) => {
    await auth.api.signOut({
      headers: new Headers({
        authorization: `Bearer ${token}`,
      }),
    });
  },

  /**
   * Standard forgot password flow
   */
  forgotPassword: async (email: string) => {
    const authApi = auth.api as any;
    if (authApi.forgetPassword) {
      await authApi.forgetPassword({
        body: {
          email,
          redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
        },
      });
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string) => {
    await auth.api.resetPassword({
      body: {
        token,
        newPassword,
      },
    });
  },








  
  /**
   * Update user role (admin only)
   */
  updateRole: async (adminToken: string, userId: string, newRole: string) => {
    await auth.api.setRole({
      headers: new Headers({
        authorization: adminToken,
      }),
      body: {
        userId,
        role: newRole,
      },
    });
  },

  /**
   * Upload owner verification document and update Gym record
   */
  uploadDocuments: async (userId: string, documentUrl: string) => {
    // 1. Update the Gym record with the document URL
    const gymUpdateResult = await Gym.updateOne(
      { ownerId: new ObjectId(userId) },
      { 
        $set: { 
          verificationDocument: documentUrl,
          verificationStatus: 'pending',
          updatedAt: new Date()
        } 
      }
    );

    if (gymUpdateResult.matchedCount === 0) {
      throw new Error("No gym found for this owner. Please create a gym profile first.");
    }

    // 2. Update the User record status
    await User.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          documentStatus: "pending",
          documentSubmittedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return documentUrl;
  },

  /**
   * Get document verification status for a user
   */
  getDocumentStatus: async (userId: string) => {
    const user = await User.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      documentStatus: user.documentStatus || "not_submitted",
      documents: user.ownerDocuments || [],
      submittedAt: user.documentSubmittedAt,
      reviewedAt: user.documentReviewedAt,
      reviewNotes: user.documentReviewNotes,
    };
  },

  /**
   * Get all users with pending verifications
   */
  getPendingVerifications: async () => {
    return await User
      .find({ documentStatus: "pending" })
      .select({
        _id: 1,
        name: 1,
        email: 1,
        phone: 1,
        city: 1,
        area: 1,
        ownerDocuments: 1,
        documentSubmittedAt: 1,
      })
      .lean();
  },

  /**
   * Review and approve/reject owner documents
   */
  reviewOwnerDocuments: async (adminId: string, userId: string, status: string, notes: string) => {
    const user = await User.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      throw new Error("User not found");
    }

    await User.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          documentStatus: status,
          documentReviewedAt: new Date(),
          documentReviewedBy: adminId,
          documentReviewNotes: notes || "",
          ...(status === "approved" && { status: "active" }),
          updatedAt: new Date(),
        },
      }
    );

    // Also update Gym status if applicable
    if (status === 'approved' || status === 'rejected') {
        await Gym.updateOne(
            { ownerId: new ObjectId(userId) },
            { 
                $set: { 
                    verificationStatus: status === 'approved' ? 'approved' : 'rejected',
                    isActive: status === 'approved',
                    updatedAt: new Date()
                } 
            }
        );
    }

    // Email notification logic
    if (process.env.SMTP_ENABLED !== 'false' && process.env.SMTP_ENABLED !== '0') {
      const emailSubject = status === "approved"
        ? "Your Gym Owner Account is Verified! - FitMe"
        : "Document Verification Update - FitMe";

      const emailHtml = status === "approved"
        ? `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Congratulations! 🎉</h2>
            <p>Hi ${user.name},</p>
            <p>Your gym owner documents have been verified and approved.</p>
          </div>`
        : `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">Document Review Update</h2>
            <p>Hi ${user.name},</p>
            <p>Unfortunately, we could not verify your documents.</p>
            ${notes ? `<p><strong>Reason:</strong> ${notes}</p>` : ""}
          </div>`;

      await sendEmail({
        to: user.email,
        subject: emailSubject,
        html: emailHtml,
      });
    }

    return { userId, status };
  },

  /**
   * Get unverified gyms
   */
  getUnverifiedGyms: async () => {
    const unverifiedOwners = await User
      .find({
        role: "owner",
        documentStatus: "pending"
      })
      .select({
        _id: 1,
        name: 1,
        email: 1,
        phone: 1,
        city: 1,
        area: 1,
        ownerDocuments: 1,
        documentSubmittedAt: 1,
        createdAt: 1,
      })
      .sort({ documentSubmittedAt: -1 })
      .lean();

    return unverifiedOwners.map((owner: any) => ({
      ownerId: owner._id,
      ownerName: owner.name,
      ownerEmail: owner.email,
      ownerPhone: owner.phone,
      city: owner.city,
      area: owner.area,
      documents: owner.ownerDocuments || [],
      submittedAt: owner.documentSubmittedAt,
      registeredAt: owner.createdAt,
    }));
  },

  /**
   * Validate a gym owner and create a gym record (Admin Manual Verification)
   */
  validateGym: async (adminId: string, ownerId: string, gymName: string, notes: string) => {
    const owner = await User.findOne({ _id: new ObjectId(ownerId) });
    if (!owner) throw new Error("Owner not found");
    if (owner.role !== "owner") throw new Error("User is not a gym owner");
    if (owner.documentStatus !== "pending") throw new Error(`Cannot validate: document status is '${owner.documentStatus}'`);

    const existingGym = await Gym.findOne({ ownerId: new ObjectId(ownerId) });
    
    let gymId;
    if (existingGym) {
        // Update existing gym
        await Gym.updateOne(
            { ownerId: new ObjectId(ownerId) },
            { 
                $set: { 
                    verificationStatus: "approved",
                    isActive: true,
                    updatedAt: new Date()
                } 
            }
        );
        gymId = existingGym._id;
    } else {
        // Create new gym record (if one wasn't created during registration phase)
        const gymRecord = {
          ownerId: new ObjectId(ownerId),
          name: gymName || `${owner.name}'s Gym`,
          location: { type: "Point", coordinates: [0, 0] }, // Default or needs to be provided
          address: {
            city: owner.city || "Unknown",
            area: owner.area || "Unknown"
          },
          verificationStatus: "approved",
          isActive: true,
          verificationDocument: owner.ownerDocuments?.[0] || "",
          rating: { average: 0, count: 0 },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const result = await Gym.create(gymRecord);
        gymId = result._id;
    }

    await User.updateOne(
      { _id: new ObjectId(ownerId) },
      {
        $set: {
          documentStatus: "approved",
          documentReviewedAt: new Date(),
          documentReviewedBy: adminId,
          documentReviewNotes: notes || "Gym verified and approved",
          status: "active",
          updatedAt: new Date(),
        },
      }
    );

    // Email notification
    if (process.env.SMTP_ENABLED !== 'false' && process.env.SMTP_ENABLED !== '0') {
      await sendEmail({
        to: owner.email,
        subject: "Your Gym is Now Verified! 🎉 - FitMe",
        html: `<h2>Congratulations! Your Gym is Verified!</h2>`,
      });
    }

    return {
      gymId,
      ownerId: ownerId,
      status: "approved",
    };
  },

  /**
   * Get all verified gyms with filters
   */
  getVerifiedGyms: async (filters: any) => {
    const filter: any = { isActive: true };
    if (filters.city) filter['address.city'] = filters.city;
    if (filters.area) filter['address.area'] = filters.area;

    return await Gym
      .find(filter)
      .select({
        _id: 1,
        ownerId: 1,
        name: 1,
        location: 1,
        rating: 1,
        address: 1,
        description: 1,
        operatingHours: 1,
        amenities: 1,
        photos: 1,
        isActive: 1,
        verificationStatus: 1,
      })
      .sort({ updatedAt: -1 })
      .lean();
  }

};
