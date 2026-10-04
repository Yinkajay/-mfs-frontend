export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
  updatedAt: string;
};

export type LoginInput = { email: string; password: string };
export type RegisterInput = LoginInput & {
  firstName: string;
  lastName: string;
  phone: string;
};
export type AuthField = keyof RegisterInput | "agree";
export type FieldErrors = Partial<Record<AuthField, string>>;

const fieldMessages: Record<keyof RegisterInput, string> = {
  firstName: "Enter a valid first name, up to 80 characters.",
  lastName: "Enter a valid last name, up to 80 characters.",
  email: "Enter a valid email address.",
  phone: "Enter a valid phone number without an extension.",
  password: "Check your password length and try again.",
};

export class AuthApiError extends Error {
  constructor(
    message: string,
    readonly status = 0,
    readonly fields: FieldErrors = {},
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

export function authErrorMessage(error: unknown): string {
  return error instanceof AuthApiError
    ? error.message
    : "Could not connect. Please try again.";
}

export function resolveApiBaseUrl(value: string | undefined): string {
  try {
    const url = new URL(value?.trim() ?? "");
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (
      (url.protocol !== "https:" && !(url.protocol === "http:" && local)) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname.replace(/\/$/, "") !== "/v1"
    )
      throw new Error();
    return url.href.replace(/\/$/, "");
  } catch {
    // Configuration details belong in developer docs, not the customer UI.
    throw new AuthApiError("Could not connect. Please try again.");
  }
}

function customerFromResponse(value: unknown): Customer {
  if (!value || typeof value !== "object")
    throw new AuthApiError("Please try again.");
  const user = value as Record<string, unknown>;
  const strings = [
    "id",
    "firstName",
    "lastName",
    "email",
    "phone",
    "createdAt",
    "updatedAt",
  ];
  if (
    strings.some((field) => typeof user[field] !== "string") ||
    !["ACTIVE", "DISABLED"].includes(String(user.status)) ||
    !["emailVerifiedAt", "phoneVerifiedAt"].every(
      (field) => user[field] === null || typeof user[field] === "string",
    )
  )
    throw new AuthApiError("Please try again.");
  // Keep only the public contract, even if a future API accidentally adds fields.
  return {
    id: user.id as string,
    firstName: user.firstName as string,
    lastName: user.lastName as string,
    email: user.email as string,
    phone: user.phone as string,
    status: user.status as Customer["status"],
    emailVerifiedAt: user.emailVerifiedAt as string | null,
    phoneVerifiedAt: user.phoneVerifiedAt as string | null,
    createdAt: user.createdAt as string,
    updatedAt: user.updatedAt as string,
  };
}

export function createAuthApi(
  baseUrl: () => string | undefined,
  fetcher: typeof fetch = (...args) => fetch(...args),
) {
  async function request(path: string, body?: object, signal?: AbortSignal) {
    let response: Response;
    try {
      response = await fetcher(`${resolveApiBaseUrl(baseUrl())}${path}`, {
        method: body === undefined ? "GET" : "POST",
        credentials: "include",
        cache: "no-store",
        // Do not forward passwords to redirects or downgrade destinations.
        redirect: "error",
        headers:
          body === undefined
            ? { Accept: "application/json" }
            : {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-MFS-CSRF": "1",
              },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: signal
          ? AbortSignal.any([signal, AbortSignal.timeout(20000)])
          : AbortSignal.timeout(20000),
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new AuthApiError("Could not connect. Please try again.");
    }

    if (!response.ok) {
      const fields: FieldErrors = {};
      if (response.status === 400) {
        const payload = await response.json().catch(() => null);
        if (Array.isArray(payload?.errors)) {
          for (const issue of payload.errors) {
            if (
              issue &&
              typeof issue.field === "string" &&
              Object.hasOwn(fieldMessages, issue.field)
            ) {
              const field = issue.field as keyof RegisterInput;
              fields[field] = fieldMessages[field];
            }
          }
        }
      }
      const message =
        response.status === 401
          ? path === "/auth/login"
            ? "Invalid email or password."
            : "Please log in again."
          : response.status === 400
            ? "Check your details and try again."
            : response.status === 429
              ? "Too many attempts. Please wait before trying again."
              : response.status === 403
                ? "Could not complete the request. Please try again."
                : response.status >= 500
                  ? "Account access is temporarily unavailable. Please try again."
                  : "Could not complete the request. Please try again.";
      throw new AuthApiError(message, response.status, fields);
    }
    if (response.status === 204) return null;
    try {
      return await response.json();
    } catch {
      throw new AuthApiError(
        "Could not complete the request. Please try again.",
      );
    }
  }

  return {
    async register(input: RegisterInput): Promise<void> {
      // Consent stays in the UI; the backend contract does not accept it.
      await request("/auth/register", {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        password: input.password,
      });
    },
    async login(input: LoginInput): Promise<Customer> {
      return customerFromResponse(
        await request("/auth/login", {
          email: input.email,
          password: input.password,
        }),
      );
    },
    async me(signal?: AbortSignal): Promise<Customer | null> {
      try {
        return customerFromResponse(await request("/me", undefined, signal));
      } catch (error) {
        if (error instanceof AuthApiError && error.status === 401) return null;
        throw error;
      }
    },
    async logout(): Promise<void> {
      await request("/auth/logout", {});
    },
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
export const authApi = createAuthApi(
  () => process.env.NEXT_PUBLIC_API_BASE_URL,
);
