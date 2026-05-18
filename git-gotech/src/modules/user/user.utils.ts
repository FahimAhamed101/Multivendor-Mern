import { OTPModel, UserModel } from "./user.model";
import { Nodemailer_GMAIL, Nodemailer_GMAIL_PASSWORD, UPLOAD_FOLDER } from "../../config";

import nodemailer from "nodemailer";
import { IUser } from "./user.interface";

import argon2 from "argon2";
import ApiError from "../../errors/ApiError";
import path from "path";
import Setting from "../settings/settings.model";

export const getSupportInfo = async () => {
  const supportSetting = await Setting.findOne({ key: "support" });
  return supportSetting?.value || {
    details: "Our support team is here to help you.",
    phone: "N/A",
    email: "support@Sleeknit.com",
  };
};

const createEmailTemplate = (params: {
  subtitle: string;
  name?: string;
  message: string;
  otp?: string;
  otpTitle?: string;
  support: any;
}) => {
  const { subtitle, name, message, otp, otpTitle, support } = params;

  const otpSection = otp
    ? `
    <div style="text-align: center; margin: 30px 0; padding: 25px; background-color: #f8f9fa; border-radius: 12px; border: 1px solid #e9ecef;">
      <p style="color: #6c757d; font-size: 13px; margin-bottom: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">${otpTitle || "OTP CODE"}</p>
      <div style="font-size: 32px; font-weight: 700; color: #6100FF; letter-spacing: 5px;">${otp}</div>
      <p style="color: #e53e3e; font-size: 12px; margin-top: 15px;">This code will expire in 3 minutes.</p>
    </div>
  `
    : "";

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #333333; line-height: 1.6; border: 1px solid #eeeeee; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #0A0A2F; padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 4px; text-transform: uppercase; font-weight: 300;">${process.env.AppName || "Sleeknit"}</h1>
        <p style="color: #a0aec0; margin: 10px 0 0; font-size: 14px; letter-spacing: 1px;">${subtitle}</p>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="color: #0A0A2F; font-size: 24px; margin-top: 0; text-align: center;">Hello${name ? `, ${name}` : ""}!</h2>
        <p style="font-size: 16px; margin-bottom: 25px; text-align: center; color: #4a5568;">
          ${message}
        </p>

        ${otpSection}

        <div style="margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-radius: 12px; border: 1px solid #e9ecef;">
          <h3 style="color: #0A0A2F; font-size: 18px; margin-top: 0;">Need Help?</h3>
          <p style="font-size: 14px; color: #4a5568; margin-bottom: 15px;">${support.details}</p>
          <div style="">
            <p style="margin: 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${support.email}" style="color: #6100FF; text-decoration: none;">${support.email}</a></p>
            <p style="margin: 0; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${support.phone}" style="color: #6100FF; text-decoration: none;">${support.phone}</a></p>
          </div>
        </div>

        <div style="border-top: 1px solid #edf2f7; padding-top: 30px; margin-top: 40px; text-align: center;">
          <p style="font-size: 14px; color: #a0aec0; margin: 0;">Warmest regards,<br><strong style="color: #0A0A2F; font-size: 16px;">The ${process.env.AppName || "Sleeknit"} Team</strong></p>
        </div>
      </div>
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #a0aec0;">
        <p style="margin: 0;">This is an automated notification from ${process.env.AppName || "Sleeknit"}. Please do not reply directly to this email.</p>
      </div>
    </div>
  `;
};

export const sendOTPEmailRegister = async (
  name: string,
  email: string,
  otp: string
): Promise<void> => {
  const support = await getSupportInfo();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
      user: Nodemailer_GMAIL,
      pass: Nodemailer_GMAIL_PASSWORD,
    },
  });

  const emailContent = createEmailTemplate({
    subtitle: "ACCOUNT REGISTRATION",
    name,
    message: "Thank you for choosing us! You are receiving this email because we received a registration request for your account.",
    otp,
    otpTitle: "REGISTRATION OTP",
    support,
  });

  const mailOptions = {
    from: `"Sleeknit" <nodemailerapptest@gmail.com>`,
    to: email,
    subject: "Registration OTP",
    html: emailContent,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Unexpected error:", error);
    throw new ApiError(500, "Unexpected error occurred during email sending.");
  }
};

export const sendOTPEmailVerification = async (
  name: string,
  email: string,
  otp: string
): Promise<void> => {
  const support = await getSupportInfo();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
      user: Nodemailer_GMAIL,
      pass: Nodemailer_GMAIL_PASSWORD,
    },
  });

  const emailContent = createEmailTemplate({
    subtitle: "ACCOUNT VERIFICATION",
    name,
    message: "Your account is not yet verified. Please use the OTP below to complete your verification and secure your account.",
    otp,
    otpTitle: "VERIFICATION OTP",
    support,
  });

  const mailOptions = {
    from: `"Sleeknit" <nodemailerapptest@gmail.com>`,
    to: email,
    subject: "Verify Your Account - OTP",
    html: emailContent,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Unexpected error:", error);
    throw new ApiError(500, "Unexpected error occurred during email sending.");
  }
};

export const getStoredOTP = async (email: string): Promise<string | null> => {
  const otpRecord = await OTPModel.findOne({ email });
  return otpRecord ? otpRecord.otp : null;
};

export const sendOTPEmail = async (
  email: string,
  otp: string
): Promise<void> => {
  const support = await getSupportInfo();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
      user: Nodemailer_GMAIL,
      pass: Nodemailer_GMAIL_PASSWORD,
    },
  });

  const emailContent = createEmailTemplate({
    subtitle: "LOGIN VERIFICATION",
    message: "You are receiving this email because we received a login request for your account. Use the code below to proceed.",
    otp,
    otpTitle: "LOGIN OTP",
    support,
  });

  const mailOptions = {
    from: `"Sleeknit" <nodemailerapptest@gmail.com>`,
    to: email,
    subject: "Login Verification OTP",
    html: emailContent,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Unexpected error:", error);
    throw new ApiError(500, "Unexpected error occurred during email sending.");
  }
};

export const resendOTPEmail = async (
  email: string,
  otp: string
  // name: string,
): Promise<void> => {
  try {
    const support = await getSupportInfo();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: Nodemailer_GMAIL,
        pass: Nodemailer_GMAIL_PASSWORD,
      },
    });

    const emailContent = createEmailTemplate({
      subtitle: "RESEND OTP CODE",
      message: "We noticed you requested another OTP for verification. Use the code below to complete your process.",
      otp,
      otpTitle: "RESEND OTP",
      support,
    });

    const mailOptions = {
      from: `"Sleeknit" <nodemailerapptest@gmail.com>`,
      to: email,
      subject: "Resend OTP ",
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending OTP email to ${email}:`, error);
    throw new ApiError(500, "Unexpected error occurred during email sending.");
  }
};

export const sendResetOTPEmail = async (
  email: string,
  otp: string,
  name: string
): Promise<void> => {
  try {
    const support = await getSupportInfo();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: Nodemailer_GMAIL,
        pass: Nodemailer_GMAIL_PASSWORD,
      },
    });

    const emailContent = createEmailTemplate({
      subtitle: "PASSWORD RESET",
      name,
      message: "You are receiving this email because we received a password reset request for your account. If you did not request this, please ignore this email.",
      otp,
      otpTitle: "PASSWORD RESET OTP",
      support,
    });

    const mailOptions = {
      from: `"Sleeknit" <nodemailerapptest@gmail.com>`,
      to: email,
      subject: "Reset Password OTP",
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending OTP email to ${email}:`, error);
    throw new ApiError(500, "Unexpected error occurred during email sending.");
  }
};

export const sendManagerRequest = async (
  emails: string | string[],
  name: string,
  email: string
): Promise<void> => {
  try {
    const support = await getSupportInfo();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: Nodemailer_GMAIL,
        pass: Nodemailer_GMAIL_PASSWORD,
      },
    });

    const emailContent = createEmailTemplate({
      subtitle: "NEW MANAGER REQUEST",
      name: "Admin",
      message: `A new manager request has been submitted by <strong>${name}</strong> (<strong>${email}</strong>). Please review the request in the admin dashboard and take the appropriate action.`,
      support,
    });

    const mailOptions = {
      from: `"${process.env.AppName || "Sleeknit"}" <nodemailerapptest@gmail.com>`,
      to: emails,
      subject: "New Manager Request Notification",
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending manager request email to ${emails}:`, error);
    throw new ApiError(
      500,
      "Unexpected error occurred during sending manager request email."
    );
  }
};

export const sendManagerInvitationEmail = async (
  name: string,
  email: string
): Promise<void> => {
  try {
    const support = await getSupportInfo();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: Nodemailer_GMAIL,
        pass: Nodemailer_GMAIL_PASSWORD,
      },
    });

    const emailContent = createEmailTemplate({
      subtitle: "MANAGER INVITATION",
      name,
      message: `You are invited as a <strong>Manager</strong> to join the ${process.env.AppName || "Sleeknit"} platform. We are excited to have you on board! Please contact your administrator to receive your secure login credentials and any additional onboarding instructions.`,
      support,
    });

    const mailOptions = {
      from: `"${process.env.AppName || "Sleeknit"}" <nodemailerapptest@gmail.com>`,
      to: email,
      subject: "Manager Invitation",
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending manager invitation email to ${email}:`, error);
    throw new ApiError(500, "Unexpected error occurred during email sending.");
  }
};

export const sendSupportInvitationEmail = async (
  name: string,
  email: string
): Promise<void> => {
  try {
    const support = await getSupportInfo();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: Nodemailer_GMAIL,
        pass: Nodemailer_GMAIL_PASSWORD,
      },
    });

    const emailContent = createEmailTemplate({
      subtitle: "SUPPORT TEAM INVITATION",
      name,
      message: `You are invited as a <strong>Support Team Member</strong> to join the ${process.env.AppName || "Sleeknit"} platform. Your contribution will be vital in assisting our community! Please contact your administrator to receive your secure login credentials and any additional onboarding instructions.`,
      support,
    });

    const mailOptions = {
      from: `"${process.env.AppName || "Sleeknit"}" <nodemailerapptest@gmail.com>`,
      to: email,
      subject: "Support Team Invitation",
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending support invitation email to ${email}:`, error);
    throw new ApiError(500, "Unexpected error occurred during email sending.");
  }
};

// ─── Unified Request Approval / Decline Emails ───────────────────────────────

/**
 * Send an approval email to a vendor or driver.
 * Same template — content is conditional on role.
 */
export const sendRequestApprovalEmail = async (
  name: string,
  email: string,
  role: "vendor" | "driver"
): Promise<void> => {
  try {
    const support = await getSupportInfo();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: Nodemailer_GMAIL,
        pass: Nodemailer_GMAIL_PASSWORD,
      },
    });

    const isVendor = role === "vendor";

    const emailContent = createEmailTemplate({
      subtitle: isVendor ? "VENDOR REQUEST APPROVED" : "DRIVER REQUEST APPROVED",
      name,
      message: isVendor
        ? `
          🎉 Congratulations! Your vendor account on <strong>${process.env.AppName || "Sleeknit"}</strong> has been <strong style="color: #22c55e;">approved</strong>.<br/><br/>
          You can now log in to your account and start setting up your store. We look forward to seeing you thrive on our platform!
        `
        : `
          🎉 Congratulations! Your driver account on <strong>${process.env.AppName || "Sleeknit"}</strong> has been <strong style="color: #22c55e;">approved</strong>.<br/><br/>
          You can now log in and start accepting delivery and ride requests. Welcome to the team — we're thrilled to have you!
        `,
      support,
    });

    const mailOptions = {
      from: `"${process.env.AppName || "Sleeknit"}" <nodemailerapptest@gmail.com>`,
      to: email,
      subject: isVendor
        ? "Your Vendor Account Has Been Approved!"
        : "Your Driver Account Has Been Approved!",
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending request approval email to ${email}:`, error);
    throw new ApiError(500, "Unexpected error occurred during email sending.");
  }
};

/**
 * Send a decline email to a vendor or driver.
 * Same template — content is conditional on role. Reason is shown prominently.
 */
export const sendRequestDeclineEmail = async (
  name: string,
  email: string,
  role: "vendor" | "driver",
  reason: string
): Promise<void> => {
  try {
    const support = await getSupportInfo();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: Nodemailer_GMAIL,
        pass: Nodemailer_GMAIL_PASSWORD,
      },
    });

    const isVendor = role === "vendor";
    const roleLabel = isVendor ? "vendor" : "driver";

    const emailContent = createEmailTemplate({
      subtitle: isVendor ? "VENDOR REQUEST DECLINED" : "DRIVER REQUEST DECLINED",
      name,
      message: `
        We regret to inform you that your ${roleLabel} account request on <strong>${process.env.AppName || "Sleeknit"}</strong> has been <strong style="color: #ef4444;">declined</strong>.<br/><br/>
        <div style="background-color: #fff5f5; border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
          <p style="margin: 0; font-size: 14px; color: #6c757d; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Reason for Decline</p>
          <p style="margin: 8px 0 0; font-size: 15px; color: #333;">${reason}</p>
        </div>
        ${
          isVendor
            ? "If you believe this is a mistake or would like to re-apply, please contact our support team for assistance."
            : "If you believe this is a mistake or would like to re-apply after addressing the above, please contact our support team for guidance."
        }
      `,
      support,
    });

    const mailOptions = {
      from: `"${process.env.AppName || "Sleeknit"}" <nodemailerapptest@gmail.com>`,
      to: email,
      subject: isVendor
        ? "Your Vendor Account Request Has Been Declined"
        : "Your Driver Account Request Has Been Declined",
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending request decline email to ${email}:`, error);
    throw new ApiError(500, "Unexpected error occurred during email sending.");
  }
};

// Keep vendor-specific aliases for showroom controller compatibility
export const sendVendorApprovalEmail = (name: string, email: string) =>
  sendRequestApprovalEmail(name, email, "vendor");

export const sendVendorDeclineEmail = (name: string, email: string, reason: string) =>
  sendRequestDeclineEmail(name, email, "vendor", reason);

export const verifyPassword = async (
  inputPassword: string,
  storedPassword: string
): Promise<boolean> => {
  try {
    return await argon2.verify(storedPassword, inputPassword);
  } catch (error) {
    throw new Error("Password verification failed");
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  try {
    return await argon2.hash(password);
  } catch (error) {
    throw new Error("Password hashing failed");
  }
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const saveOTP = async (email: string, otp: string): Promise<void> => {
  await OTPModel.findOneAndUpdate(
    { email },
    { otp, expiresAt: new Date(Date.now() + 3 * 60 * 1000) },
    { upsert: true, new: true }
  );
};

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  return UserModel.findOne({ email });
};

export const findUserById = async (id: string): Promise<IUser | null> => {
  return UserModel.findById(id).select("-password");
};

export const sendEventInvitationEmail = async (params: {
  email: string;
  name: string;
  subject: string;
  type: "invitation" | "credentials";
  password?: string;
  inviteCardPath?: string;
}): Promise<void> => {
  const { email, name, subject, type, password, inviteCardPath } = params;
  const support = await getSupportInfo();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
      user: Nodemailer_GMAIL,
      pass: Nodemailer_GMAIL_PASSWORD,
    },
  });

  const getPreviewContent = (filePath: string) => {
    const ext = filePath.split(".").pop()?.toLowerCase() || "";
    const imageExts = ["png", "jpg", "jpeg", "gif", "webp"];

    if (imageExts.includes(ext)) {
      return `
      <div style="text-align: center; margin: 30px 0; padding: 10px; background-color: #f8f9fa; border-radius: 12px; border: 1px solid #e9ecef;">
        <p style="color: #6c757d; font-size: 13px; margin-bottom: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Invitation Card Preview</p>
        <img src="cid:inviteCard" alt="Invitation Card" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);" />
        <p style="color: #6c757d; font-size: 12px; margin-top: 15px;">A downloadable copy is also attached to this email for your convenience.</p>
      </div>
    `;
    } else if (ext === "pdf") {
      return `
      <div style="text-align: center; margin: 30px 0; padding: 10px; background-color: #f8f9fa; border-radius: 12px; border: 1px solid #e9ecef;">
        <p style="color: #6c757d; font-size: 13px; margin-bottom: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Invitation Card Preview</p>
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
          <p style="color: #0A0A2F; font-size: 16px; font-weight: 600; margin: 0;">PDF Document</p>
          <p style="color: #6c757d; font-size: 13px; margin: 5px 0 0;">${filePath.split("/").pop()}</p>
        </div>
        <p style="color: #6c757d; font-size: 12px; margin-top: 15px;">The PDF file is attached to this email for viewing and download.</p>
      </div>
    `;
    } else {
      return `
      <div style="text-align: center; margin: 30px 0; padding: 10px; background-color: #f8f9fa; border-radius: 12px; border: 1px solid #e9ecef;">
        <p style="color: #6c757d; font-size: 13px; margin-bottom: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Invitation Card</p>
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
          <p style="color: #0A0A2F; font-size: 16px; font-weight: 600; margin: 0;">File Attachment</p>
          <p style="color: #6c757d; font-size: 13px; margin: 5px 0 0;">${filePath.split("/").pop()}</p>
        </div>
        <p style="color: #6c757d; font-size: 12px; margin-top: 15px;">The file is attached to this email for your convenience.</p>
      </div>
    `;
    }
  };

  const inviteCardContent = inviteCardPath ? getPreviewContent(inviteCardPath) : "";

  let message = "";
  let subtitle = "";

  if (type === "invitation") {
    subtitle = "YOU ARE CORDIALLY INVITED";
    message =
      "We are delighted to inform you that you've been invited to join an exclusive event! This occasion promises to be truly memorable, and we would be honored by your presence.";
  } else {
    subtitle = "WELCOME TO OUR COMMUNITY";
    message = `
      You have been invited to an upcoming event, and we've prepared a new account for you to get started seamlessly.
      <div style="background-color: #f7fafc; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #e2e8f0; text-align: center;">
        <h3 style="margin-top: 0; color: #0A0A2F; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Your Secure Access</h3>
        <div style="margin: 20px 0;">
          <p style="margin: 5px 0; font-size: 15px; color: #4a5568;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0; font-size: 15px; color: #4a5568;"><strong>Password:</strong> <code style="background: #edf2f7; padding: 4px 8px; border-radius: 6px; color: #6100FF; font-weight: bold; font-family: monospace;">${password}</code></p>
        </div>
        <p style="font-size: 13px; color: #a0aec0; margin-bottom: 0;">For security, we recommend updating your password after your first login.</p>
      </div>
    `;
  }

  const emailContent = createEmailTemplate({
    subtitle,
    name,
    message: `
      ${message}
      ${inviteCardContent}
      <div style="text-align: center; margin: 40px 0;">
        <p style="font-size: 15px; color: #718096;">Please find the location and schedule details in the invitation card above.</p>
      </div>
    `,
    support,
  });

  const attachments: any[] = [];
  const imageExts = ["png", "jpg", "jpeg", "gif", "webp"];
  if (inviteCardPath) {
    const ext = inviteCardPath.split(".").pop()?.toLowerCase() || "";
    const localFsPath = path.join(
      process.cwd(),
      UPLOAD_FOLDER || "public/images",
      inviteCardPath
    );

    if (imageExts.includes(ext)) {
      attachments.push({
        filename: "preview." + ext,
        path: localFsPath,
        cid: "inviteCard",
        contentDisposition: "inline",
      });
    }

    attachments.push({
      filename: inviteCardPath.split("/").pop(),
      path: localFsPath,
      contentDisposition: "attachment",
    });
  }

  const mailOptions = {
    from: `"${process.env.AppName || "Sleeknit"}" <nodemailerapptest@gmail.com>`,
    to: email,
    subject: subject,
    html: emailContent,
    attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending event invitation email to ${email}:`, error);
    throw new ApiError(500, "Unexpected error occurred during email sending.");
  }
};

