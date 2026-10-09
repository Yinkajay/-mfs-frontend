export const VEHICLE_CATEGORIES = {
  BIKE: "Bike",
  SALOON: "Saloon",
  SUV_PICKUP: "SUV or pickup",
  TRUCK: "Truck",
  BUS_MINI_TRUCK: "Bus or mini truck",
} as const;
export type VehicleCategory = keyof typeof VEHICLE_CATEGORIES;

export const VEHICLE_FIELDS = {
  name: { label: "Vehicle name", max: 80 },
  registrationNumber: { label: "Registration number", max: 80 },
  make: { label: "Make", max: 80 },
  model: { label: "Model", max: 80 },
  year: { label: "Year", max: 4 },
  colour: { label: "Colour", max: 80 },
  stateOfRegistration: { label: "State of registration", max: 80 },
  chassisNumber: { label: "Chassis number", max: 80 },
  engineNumber: { label: "Engine number", max: 80 },
  engineCapacity: { label: "Engine capacity", max: 40 },
  usageType: { label: "Usage type", max: 40 },
} as const;
export type VehicleField = "category" | keyof typeof VEHICLE_FIELDS;
export type VehicleDraft = Record<VehicleField, string>;
export type VehicleInput = {
  category: VehicleCategory;
  year: number | null;
} & Record<Exclude<keyof typeof VEHICLE_FIELDS, "year">, string | null>;
export type VehicleFieldErrors = Partial<Record<VehicleField, string>>;

export function fieldMessage(field: VehicleField): string {
  if (field === "category") return "Choose a vehicle category.";
  if (field === "year") return "Enter a four digit year, or leave it blank.";
  return `Enter a valid ${VEHICLE_FIELDS[field].label.toLowerCase()}, up to ${VEHICLE_FIELDS[field].max} characters.`;
}

export function vehicleDraft(vehicle?: VehicleInput): VehicleDraft {
  const draft = { category: vehicle?.category ?? "" } as VehicleDraft;
  for (const field of Object.keys(
    VEHICLE_FIELDS,
  ) as (keyof typeof VEHICLE_FIELDS)[])
    draft[field] = vehicle?.[field] == null ? "" : String(vehicle[field]);
  return draft;
}

export function validateVehicle(draft: VehicleDraft): {
  input: VehicleInput;
  errors: VehicleFieldErrors;
} {
  const errors: VehicleFieldErrors = {};
  const input = { category: draft.category } as VehicleInput;
  if (!Object.hasOwn(VEHICLE_CATEGORIES, draft.category))
    errors.category = fieldMessage("category");
  for (const field of Object.keys(
    VEHICLE_FIELDS,
  ) as (keyof typeof VEHICLE_FIELDS)[]) {
    const raw = draft[field];
    if (field === "year") {
      input.year = raw.trim() === "" ? null : Number(raw.trim());
      if (input.year !== null && !/^[1-9]\d{3}$/.test(raw.trim()))
        errors.year = fieldMessage(field);
      continue;
    }
    // Registration is a display value: never trim or normalize a entered plate.
    const value = field === "registrationNumber" ? raw : raw.trim();
    input[field] = raw.trim() === "" ? null : value.normalize("NFC");
    if (field === "registrationNumber" && input[field] !== null)
      input[field] = raw;
    if (
      value.length > VEHICLE_FIELDS[field].max ||
      (field === "name" &&
        (input.name?.length ?? 0) > VEHICLE_FIELDS.name.max) ||
      /[\p{Cc}\p{Cf}]/u.test(value)
    )
      errors[field] = fieldMessage(field);
  }
  return { input, errors };
}

export function vehicleChanges(
  input: VehicleInput,
  previous: VehicleInput,
): Partial<VehicleInput> {
  const changes: Partial<VehicleInput> = {};
  for (const field of [
    "category",
    ...Object.keys(VEHICLE_FIELDS),
  ] as VehicleField[]) {
    if (input[field] !== previous[field])
      Object.assign(changes, { [field]: input[field] });
  }
  return changes;
}
