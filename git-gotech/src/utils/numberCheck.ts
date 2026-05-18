export const validateE164 = (phone: string) => {
  const regex = /^\+[1-9]\d{1,14}$/;
  return regex.test(phone);
};
