import { createApiRequest } from "./auth-api";

export type CatalogueVehicleCategory = {
  code: "BIKE" | "SALOON" | "SUV_PICKUP" | "TRUCK" | "BUS_MINI_TRUCK";
  name: string;
};

export type CatalogueVariant = {
  code: string;
  name: string;
  description: string | null;
};

export type CatalogueService = {
  code: string;
  name: string;
  slug: string;
  description: string | null;
  vehicleCategories: CatalogueVehicleCategory[];
  variants: CatalogueVariant[];
};

const categoryCodes = new Set<CatalogueVehicleCategory["code"]>([
  "BIKE",
  "SALOON",
  "SUV_PICKUP",
  "TRUCK",
  "BUS_MINI_TRUCK",
]);
const catalogueCode = /^[A-Z][A-Z0-9_]*$/;
const catalogueSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ServicesApiError extends Error {
  constructor(
    message: string,
    readonly status = 0,
  ) {
    super(message);
    this.name = "ServicesApiError";
  }
}

const unavailableMessage =
  "We couldn’t load the service catalogue. Please try again.";

function invalidResponse() {
  return new ServicesApiError(unavailableMessage);
}

function nullableText(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function requiredText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function variantFromResponse(value: unknown): CatalogueVariant {
  if (!value || typeof value !== "object") throw invalidResponse();
  const variant = value as Record<string, unknown>;
  if (
    !requiredText(variant.code) ||
    !catalogueCode.test(variant.code) ||
    !requiredText(variant.name) ||
    !nullableText(variant.description)
  )
    throw invalidResponse();
  return {
    code: variant.code,
    name: variant.name,
    description: variant.description,
  };
}

function categoryFromResponse(value: unknown): CatalogueVehicleCategory {
  if (!value || typeof value !== "object") throw invalidResponse();
  const category = value as Record<string, unknown>;
  if (
    typeof category.code !== "string" ||
    !categoryCodes.has(category.code as CatalogueVehicleCategory["code"]) ||
    !requiredText(category.name)
  )
    throw invalidResponse();
  return {
    code: category.code as CatalogueVehicleCategory["code"],
    name: category.name,
  };
}

function serviceFromResponse(value: unknown): CatalogueService {
  if (!value || typeof value !== "object") throw invalidResponse();
  const service = value as Record<string, unknown>;
  if (
    !requiredText(service.code) ||
    !catalogueCode.test(service.code) ||
    !requiredText(service.name) ||
    !requiredText(service.slug) ||
    !catalogueSlug.test(service.slug) ||
    !nullableText(service.description) ||
    !Array.isArray(service.vehicleCategories) ||
    !Array.isArray(service.variants)
  )
    throw invalidResponse();

  const vehicleCategories = service.vehicleCategories.map(categoryFromResponse);
  const variants = service.variants.map(variantFromResponse);
  if (
    new Set(vehicleCategories.map(({ code }) => code)).size !==
      vehicleCategories.length ||
    new Set(variants.map(({ code }) => code)).size !== variants.length
  )
    throw invalidResponse();

  // Project only the documented public catalogue fields into component state.
  return {
    code: service.code,
    name: service.name,
    slug: service.slug,
    description: service.description,
    vehicleCategories,
    variants,
  };
}

export function createServicesApi(
  baseUrl: () => string | undefined,
  fetcher: typeof fetch = (...args) => fetch(...args),
) {
  const fetchResponse = createApiRequest(baseUrl, fetcher);

  return {
    async list(signal?: AbortSignal): Promise<CatalogueService[]> {
      let response: Response;
      try {
        response = await fetchResponse("/services", { signal });
      } catch (error) {
        if (signal?.aborted) throw error;
        throw invalidResponse();
      }

      if (!response.ok) {
        throw new ServicesApiError(
          response.status >= 500
            ? "The service catalogue is temporarily unavailable. Please try again."
            : unavailableMessage,
          response.status,
        );
      }

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw invalidResponse();
      }
      if (!payload || typeof payload !== "object") throw invalidResponse();
      const items = (payload as Record<string, unknown>).items;
      if (!Array.isArray(items)) throw invalidResponse();
      const services = items.map(serviceFromResponse);
      if (
        new Set(services.map(({ code }) => code)).size !== services.length ||
        new Set(services.map(({ slug }) => slug)).size !== services.length
      )
        throw invalidResponse();
      return services;
    },
  };
}

export type ServicesApi = ReturnType<typeof createServicesApi>;
export const servicesApi = createServicesApi(
  () => process.env.NEXT_PUBLIC_API_BASE_URL,
);
