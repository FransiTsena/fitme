import { generateToken } from "../utils/jwtAuth.js";
import { User } from "../models/userModel.js";
import { Gym } from "../models/gymModel.js";
import { sendEmail } from "../utils/email.js";
import { ObjectId } from "mongodb";
import bcrypt from 'bcrypt';

export const userService = {
  /**
   * Sign up a new user
   */
  signup: async (userData: any) => {
    // Extract user data
    const { email, password, name, phone, fatherName, registrationRole, city, area } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Determine role based on registrationRole
    const role = registrationRole === 'owner' ? 'owner' : 'member';

    // Hash password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      fatherName,
      role,
      city,
      area,
      documentStatus: role === 'owner' ? 'not_submitted' : 'not_submitted', // Both owners and members have document status, but members don't need verification
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id.toString(), newUser.role);

    // Return user data and token
    return {
      user: newUser.toObject(),
      token,
    };
  },

  /**
   * Login user and return session data including token
   */
  login: async (email: string, password: string) => {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.role);

    return {
      user: user.toObject(),
      token,
    };
  },

  /**
   * Get session by token
   */
  getSession: async (token: string) => {
    // This function is likely not needed with JWT since the token contains user info
    // But we'll keep it for compatibility
    // In JWT, the token itself contains user info, so we just verify it
    return null; // Return null since JWT tokens are self-contained
  },

  /**
   * Logout user (client-side operation with JWT - just remove token)
   */
  logout: async (token: string) => {
    // With JWT, logout is typically handled on the client side by removing the token
    // No server-side session to revoke
    // This function can be a no-op or implement token blacklisting if needed
    return { message: 'Logged out successfully' };
  },

  /**
   * Standard forgot password flow
   */
  forgotPassword: async (email: string) => {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'If an account exists with this email, a reset link has been sent.' };
    }

    // In a real app, generate a password reset token and send email
    // For now, just return a success message
    console.log(`Password reset requested for ${email}`);
    return { message: 'If an account exists with this email, a reset link has been sent.' };
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string) => {
    // In a real app, verify the reset token and update the password
    // For now, we'll just log the attempt
    console.log(`Password reset attempted with token: ${token}`);
    // This would involve finding the user by reset token and updating their password
    return { message: 'Password reset successfully' };
  },









  /**
   * Update user role (admin only)
   */
  updateRole: async (adminToken: string, userId: string, newRole: string) => {
    // In a real app, this would validate the admin token and update the user role
    // For now, we'll just update the role directly
    await User.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role: newRole } }
    );

    return { message: 'Role updated successfully' };
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
