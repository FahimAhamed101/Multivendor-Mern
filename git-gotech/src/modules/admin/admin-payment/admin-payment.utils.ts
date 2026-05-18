
import nodemailer from "nodemailer";
import { Nodemailer_GMAIL, Nodemailer_GMAIL_PASSWORD } from "../../../config";
import { getSupportInfo } from "../../user/user.utils";
import ApiError from "../../../errors/ApiError";

const createEmailTemplate = (params: {
    subtitle: string;
    name?: string;
    message: string;
    support: any;
}) => {
    const { subtitle, name, message, support } = params;

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

/**
 * Send withdraw approval email to user
 * @param name - Customer name
 * @param email - Customer email
 * @param amount - Withdrawal amount
 * @param adminNote - Optional note from admin
 */
export const sendWithdrawApprovalEmail = async (
    name: string,
    email: string,
    amount: number,
    adminNote?: string
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

        const formattedAmount = Number(amount).toFixed(2);
        const noteSection = adminNote
            ? `
            <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
                <p style="margin: 0; font-size: 14px; color: #6c757d; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Admin Note</p>
                <p style="margin: 8px 0 0; font-size: 15px; color: #333;">${adminNote}</p>
            </div>
            `
            : "";

        const emailContent = createEmailTemplate({
            subtitle: "WITHDRAWAL REQUEST APPROVED",
            name,
            message: `
                Great news! Your withdrawal request of <strong>₵${formattedAmount}</strong> has been <strong style="color: #22c55e;">approved</strong>.<br/><br/>
                The funds will be transferred to your designated account. Please allow 2-3 business days for the transaction to reflect.
                ${noteSection}
            `,
            support,
        });

        const mailOptions = {
            from: `"${process.env.AppName || "Sleeknit"}" <nodemailerapptest@gmail.com>`,
            to: email,
            subject: `Withdrawal Request Approved - ₵${formattedAmount}`,
            html: emailContent,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Error sending withdraw approval email to ${email}:`, error);
        throw new ApiError(500, "Unexpected error occurred during email sending.");
    }
};

/**
 * Send withdraw rejection email to user
 * @param name - Customer name
 * @param email - Customer email
 * @param amount - Withdrawal amount
 * @param rejectionReason - Reason for rejection
 * @param adminNote - Optional note from admin
 */
export const sendWithdrawRejectionEmail = async (
    name: string,
    email: string,
    amount: number,
    rejectionReason: string,
    adminNote?: string
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

        const formattedAmount = Number(amount).toFixed(2);
        const noteSection = adminNote
            ? `
            <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
                <p style="margin: 0; font-size: 14px; color: #6c757d; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Admin Note</p>
                <p style="margin: 8px 0 0; font-size: 15px; color: #333;">${adminNote}</p>
            </div>
            `
            : "";

        const emailContent = createEmailTemplate({
            subtitle: "WITHDRAWAL REQUEST DECLINED",
            name,
            message: `
                We regret to inform you that your withdrawal request of <strong>₵${formattedAmount}</strong> has been <strong style="color: #ef4444;">declined</strong>.<br/><br/>
                <div style="background-color: #fff5f5; border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
                    <p style="margin: 0; font-size: 14px; color: #6c757d; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Reason for Decline</p>
                    <p style="margin: 8px 0 0; font-size: 15px; color: #333;">${rejectionReason}</p>
                </div>
                <p style="margin-top: 15px; font-size: 15px; color: #4a5568;">
                    If you have any questions or believe this is a mistake, please contact our support team for assistance.
                </p>
                ${noteSection}
            `,
            support,
        });

        const mailOptions = {
            from: `"${process.env.AppName || "Sleeknit"}" <nodemailerapptest@gmail.com>`,
            to: email,
            subject: `Withdrawal Request Declined - ₵${formattedAmount}`,
            html: emailContent,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Error sending withdraw rejection email to ${email}:`, error);
        throw new ApiError(500, "Unexpected error occurred during email sending.");
    }
};