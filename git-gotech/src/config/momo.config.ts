import { parsePhoneNumber } from "libphonenumber-js";

const PHONE_COUNTRY_TO_MOMO: Record<string, { currency: string; targetEnv: string }> = {
  UG: { currency: "UGX", targetEnv: "mtnuganda" },
  GH: { currency: "GHS", targetEnv: "mtnghana" },
  CM: { currency: "XAF", targetEnv: "mtncameroon" },
  CI: { currency: "XOF", targetEnv: "mtnivorycoast" },
  ZM: { currency: "ZMW", targetEnv: "mtnzambia" },
  RW: { currency: "RWF", targetEnv: "mtnrwanda" },
  BJ: { currency: "XOF", targetEnv: "mtnbenin" },
  LR: { currency: "LRD", targetEnv: "mtnliberia" },

  // ✅ Add Sweden for sandbox test numbers
  SE: { currency: "EUR", targetEnv: "sandbox" },
};

export const getMomoConfigFromPhone = (phone: string, isSandbox: boolean) => {
  try {
    // ✅ Ensure + prefix for international parsing
    const normalized = phone.startsWith("+") ? phone : `+${phone}`;
    const parsed = parsePhoneNumber(normalized);
    const countryCode = parsed.country; // "UG", "GH", "SE" etc.

    if (!countryCode || !PHONE_COUNTRY_TO_MOMO[countryCode]) {
      throw new Error(`MTN MoMo not supported for country: ${countryCode}`);
    }

    const config = PHONE_COUNTRY_TO_MOMO[countryCode];

    return {
      countryCode,
      // ✅ Sandbox always uses EUR and sandbox env regardless of country
      currency: isSandbox ? "EUR" : config.currency,
      targetEnv: isSandbox ? "sandbox" : config.targetEnv,
    };

  } catch (err) {
    throw new Error(`Invalid phone number or unsupported country: ${phone}`);
  }
};