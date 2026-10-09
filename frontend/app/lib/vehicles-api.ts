import { createApiRequest } from "./auth-api";
import {
  VEHICLE_CATEGORIES,
  VEHICLE_FIELDS,
  fieldMessage,
  type VehicleInput,
  type VehicleField,
  type VehicleFieldErrors,
} from "./vehicles-validation";

export type Vehicle = VehicleInput & {
  id: string;
  registrationNumberNormalized: string | null;
  createdAt: string;
  updatedAt: string;
};
export type VehicleList = {
  items: Vehicle[];
  total: number;
  limit: number;
  offset: number;
};
export const VEHICLE_PAGE_SIZE = 20;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fieldNames = [
  "category",
  ...Object.keys(VEHICLE_FIELDS),
] as VehicleField[];

export class VehiclesApiError extends Error {
  constructor(
    message: string,
    readonly status = 0,
    readonly fields: VehicleFieldErrors = {},
  ) {
    super(message);
    this.name = "VehiclesApiError";
  }
}
const invalidResponse = () =>
  new VehiclesApiError(
    "We couldn’t load your vehicle details. Please try again.",
  );

function vehicleFromResponse(value: unknown): Vehicle {
  if (!value || typeof value !== "object") throw invalidResponse();
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    !uuid.test(record.id) ||
    typeof record.category !== "string" ||
    !Object.hasOwn(VEHICLE_CATEGORIES, record.category) ||
    !["createdAt", "updatedAt"].every(
      (field) =>
        typeof record[field] === "string" &&
        Number.isFinite(Date.parse(record[field] as string)),
    ) ||
    ![
      ...Object.keys(VEHICLE_FIELDS).filter((field) => field !== "year"),
      "registrationNumberNormalized",
    ].every(
      (field) => record[field] === null || typeof record[field] === "string",
    ) ||
    !(
      record.year === null ||
      (typeof record.year === "number" &&
        Number.isInteger(record.year) &&
        record.year >= 1000 &&
        record.year <= 9999)
    )
  )
    throw invalidResponse();
  // Only the public garage contract enters component state.
  return Object.fromEntries(
    [
      "id",
      ...fieldNames,
      "registrationNumberNormalized",
      "createdAt",
      "updatedAt",
    ].map((field) => [field, record[field]]),
  ) as Vehicle;
}

export function createVehiclesApi(
  baseUrl: () => string | undefined,
  fetcher: typeof fetch = (...args) => fetch(...args),
) {
  const fetchResponse = createApiRequest(baseUrl, fetcher);
  async function request(
    path: string,
    method: "GET" | "POST" | "PATCH",
    body?: object,
    signal?: AbortSignal,
  ) {
    let response: Response;
    try {
      response = await fetchResponse(path, { method, body, signal });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new VehiclesApiError(
        method === "GET"
          ? "We couldn’t load your vehicles. Please try again."
          : "We couldn’t confirm your changes. Return to your vehicles and refresh before trying again.",
      );
    }
    if (!response.ok) {
      const fields: VehicleFieldErrors = {};
      if (response.status === 400) {
        const payload = await response.json().catch(() => null);
        if (Array.isArray(payload?.errors))
          for (const issue of payload.errors) {
            if (issue && fieldNames.includes(issue.field))
              fields[issue.field as VehicleField] = fieldMessage(issue.field);
          }
      }
      const message =
        response.status === 400
          ? "Check your vehicle details and try again."
          : response.status === 401
            ? "Please log in again to see your vehicles."
            : response.status === 404
              ? "That vehicle is no longer available. Refresh your vehicles and try again."
              : response.status === 429
                ? "Please wait a moment before trying again."
                : response.status >= 500
                  ? "Your vehicles are temporarily unavailable. Please try again."
                  : "We couldn’t complete the request. Please try again.";
      throw new VehiclesApiError(message, response.status, fields);
    }
    try {
      return await response.json();
    } catch {
      throw invalidResponse();
    }
  }
  function pathFor(id: string) {
    if (!uuid.test(id)) throw invalidResponse();
    return `/vehicles/${id}`;
  }
  function publicInput(input: Partial<VehicleInput>) {
    return Object.fromEntries(
      fieldNames
        .filter((field) => Object.hasOwn(input, field))
        .map((field) => [field, input[field]]),
    );
  }
  async function write(
    path: string,
    method: "POST" | "PATCH",
    input: Partial<VehicleInput>,
    signal?: AbortSignal,
    id?: string,
  ) {
    try {
      const vehicle = vehicleFromResponse(
        await request(path, method, publicInput(input), signal),
      );
      if (id && vehicle.id !== id) throw invalidResponse();
      return vehicle;
    } catch (error) {
      if (signal?.aborted) throw error;
      if (error instanceof VehiclesApiError && error.status !== 0) throw error;
      // A missing/malformed success response does not prove a write failed.
      throw new VehiclesApiError(
        "We couldn’t confirm your changes. Return to your vehicles and refresh before trying again.",
      );
    }
  }
  return {
    async list(offset = 0, signal?: AbortSignal): Promise<VehicleList> {
      if (!Number.isInteger(offset) || offset < 0 || offset > 100000)
        throw invalidResponse();
      const result = await request(
        `/vehicles?limit=${VEHICLE_PAGE_SIZE}&offset=${offset}`,
        "GET",
        undefined,
        signal,
      );
      if (
        !result ||
        !Array.isArray(result.items) ||
        result.items.length > VEHICLE_PAGE_SIZE ||
        !Number.isInteger(result.total) ||
        result.total < 0 ||
        result.limit !== VEHICLE_PAGE_SIZE ||
        result.offset !== offset ||
        result.items.length > result.total
      )
        throw invalidResponse();
      return {
        items: result.items.map(vehicleFromResponse),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      };
    },
    async read(id: string, signal?: AbortSignal): Promise<Vehicle> {
      const vehicle = vehicleFromResponse(
        await request(pathFor(id), "GET", undefined, signal),
      );
      if (vehicle.id !== id) throw invalidResponse();
      return vehicle;
    },
    async create(input: VehicleInput, signal?: AbortSignal): Promise<Vehicle> {
      return write("/vehicles", "POST", input, signal);
    },
    async update(
      id: string,
      input: Partial<VehicleInput>,
      signal?: AbortSignal,
    ): Promise<Vehicle> {
      return write(pathFor(id), "PATCH", input, signal, id);
    },
  };
}
export const vehiclesApi = createVehiclesApi(
  () => process.env.NEXT_PUBLIC_API_BASE_URL,
);
