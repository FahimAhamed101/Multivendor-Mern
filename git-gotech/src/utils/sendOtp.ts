import { Twilio } from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

if (!accountSid || !authToken || !messagingServiceSid) {
  throw new Error("Missing required Twilio environment variables");
}

const client = new Twilio(accountSid, authToken);

export async function sendNumberOTP(
  number: string,
  message: string,
): Promise<string> {
  try {
    const messageResponse = await client.messages.create({
      body: message,
      //   messagingServiceSid,
      from: "+18559018475",
      to: number,
    });

    console.log(`OTP sent successfully. SID: ${messageResponse.sid}`);
    console.log("✅ Message created successfully");
    console.log("SID:", messageResponse.sid);
    console.log("Status:", messageResponse.status);
    console.log("To:", messageResponse.to);
    console.log("From:", messageResponse.from);
    console.log("Error Code:", messageResponse.errorCode);
    console.log("Error Message:", messageResponse.errorMessage);
    return messageResponse.sid;
  } catch (error) {
    console.error("Failed to send OTP:", error);
    throw error;
  }
}
