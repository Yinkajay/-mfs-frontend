import type { FieldErrors, LoginInput, RegisterInput } from "./auth-api";

export function validateAuthInput(
  mode: "login" | "signup",
  input: LoginInput | RegisterInput,
  agreed = false,
): FieldErrors {
  const errors: FieldErrors = {};
  const email = input.email.trim();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  const length = [...input.password].length;
  if (!length) errors.password = "Enter your password.";
  else if (
    length > 128 ||
    new TextEncoder().encode(input.password).length > 1024
  ) {
    errors.password = "Use no more than 128 characters.";
  } else if (mode === "signup" && length < 8) {
    errors.password = "Use at least 8 characters.";
  }
  if (mode === "signup") {
    const registration = input as RegisterInput;
    for (const field of ["firstName", "lastName"] as const) {
      const name = registration[field].trim();
      if (!name || name.length > 80 || /[\p{Cc}\p{Cf}]/u.test(name)) {
        errors[field] =
          `Enter a valid ${field === "firstName" ? "first" : "last"} name, up to 80 characters.`;
      }
    }
    const phone = registration.phone.trim();
    // Phone length checks and E.164 normalization remain server-side.
    if (
      phone.length < 5 ||
      phone.length > 40 ||
      !/^\+?[\d\s().-]+$/.test(phone)
    ) {
      errors.phone = "Enter a phone number with the correct number of digits.";
    }
    if (!agreed) errors.agree = "Please agree to the terms and privacy policy.";
  }
  return errors;
}
