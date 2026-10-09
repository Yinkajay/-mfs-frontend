"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  vehiclesApi,
  VehiclesApiError,
  type Vehicle,
} from "@/app/lib/vehicles-api";
import {
  VEHICLE_CATEGORIES,
  VEHICLE_FIELDS,
  validateVehicle,
  vehicleChanges,
  vehicleDraft,
  type VehicleDraft,
  type VehicleField,
  type VehicleFieldErrors,
} from "@/app/lib/vehicles-validation";

const inputClass =
  "focus-ring mt-2 h-12 w-full min-w-0 rounded-lg border border-black/10 bg-[#f7f7f5] px-3 text-sm text-[#181818] disabled:cursor-not-allowed aria-invalid:border-[#b52d21]";

export function VehicleForm({
  vehicle,
  onCancel,
  onSaved,
  onUnauthorized,
}: {
  vehicle?: Vehicle;
  onCancel: () => void;
  onSaved: (vehicle: Vehicle, added: boolean) => void;
  onUnauthorized: () => void;
}) {
  const [draft, setDraft] = useState<VehicleDraft>(() => vehicleDraft(vehicle));
  const [errors, setErrors] = useState<VehicleFieldErrors>({});
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const controller = useRef<AbortController | null>(null);
  const submitting = useRef(false);
  useEffect(() => {
    (
      form.current?.elements.namedItem("category") as HTMLElement | null
    )?.focus();
    return () => controller.current?.abort();
  }, []);

  function focusInvalid(fields: VehicleFieldErrors) {
    const field = (
      ["category", ...Object.keys(VEHICLE_FIELDS)] as VehicleField[]
    ).find((key) => fields[key]);
    requestAnimationFrame(() => {
      (
        form.current?.elements.namedItem(
          field ?? "category",
        ) as HTMLElement | null
      )?.focus();
    });
  }
  function change(field: VehicleField, value: string) {
    setDraft((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setError("");
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const result = validateVehicle(draft);
    setErrors(result.errors);
    setError("");
    if (Object.keys(result.errors).length) {
      focusInvalid(result.errors);
      return;
    }
    const changes = vehicle
      ? vehicleChanges(result.input, vehicle)
      : result.input;
    if (!Object.keys(changes).length) {
      setError("Your vehicle details haven’t changed.");
      return;
    }
    submitting.current = true;
    setPending(true);
    const active = new AbortController();
    controller.current = active;
    try {
      const saved = vehicle
        ? await vehiclesApi.update(vehicle.id, changes, active.signal)
        : await vehiclesApi.create(result.input, active.signal);
      if (!active.signal.aborted) onSaved(saved, !vehicle);
    } catch (failure) {
      if (active.signal.aborted) return;
      if (failure instanceof VehiclesApiError && failure.status === 401) {
        onUnauthorized();
        return;
      }
      setError(
        failure instanceof VehiclesApiError
          ? failure.message
          : "We couldn’t save your vehicle. Please try again.",
      );
      if (
        failure instanceof VehiclesApiError &&
        Object.keys(failure.fields).length
      ) {
        setErrors(failure.fields);
        focusInvalid(failure.fields);
      }
    } finally {
      submitting.current = false;
      if (!active.signal.aborted) setPending(false);
    }
  }

  return (
    <section
      aria-labelledby="vehicle-form-title"
      className="rounded-xl bg-white p-6 sm:p-8"
    >
      <h2
        id="vehicle-form-title"
        className="text-2xl font-semibold tracking-tight"
      >
        {vehicle ? "Edit vehicle" : "Add a vehicle"}
      </h2>
      <p className="mt-4 text-sm text-[#686d69]">
        Only the category is required. Add any other details you have.
      </p>
      <form ref={form} onSubmit={submit} noValidate className="mt-8">
        {error && (
          <p
            role="alert"
            className="mb-6 rounded-lg bg-[#fff0eb] p-4 text-sm text-[#9b281e]"
          >
            {error}
          </p>
        )}
        <fieldset disabled={pending} className="min-w-0">
          <legend className="sr-only">Vehicle details</legend>
          <div className="grid min-w-0 gap-6 sm:grid-cols-2">
            <div className="min-w-0">
              <label
                htmlFor="vehicle-category"
                className="text-sm font-semibold"
              >
                Category{" "}
                <span className="font-normal text-[#686d69]">(required)</span>
              </label>
              <select
                id="vehicle-category"
                name="category"
                required
                value={draft.category}
                onChange={(event) => change("category", event.target.value)}
                className={inputClass}
                aria-invalid={!!errors.category}
                aria-describedby={
                  errors.category ? "vehicle-category-error" : undefined
                }
              >
                <option value="">Choose a category</option>
                {Object.entries(VEHICLE_CATEGORIES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p
                  id="vehicle-category-error"
                  className="mt-2 text-sm text-[#9b281e]"
                >
                  {errors.category}
                </p>
              )}
            </div>
            {Object.entries(VEHICLE_FIELDS).map(([key, config]) => {
              const field = key as keyof typeof VEHICLE_FIELDS;
              const help =
                field === "name"
                  ? "For example, Family car or Work van."
                  : field === "engineCapacity"
                    ? "Include the unit, for example 2.5 L."
                    : field === "usageType"
                      ? "For example, private or commercial."
                      : null;
              const described =
                [
                  errors[field] && `vehicle-${field}-error`,
                  help && `vehicle-${field}-help`,
                ]
                  .filter(Boolean)
                  .join(" ") || undefined;
              return (
                <div key={field} className="min-w-0">
                  <label
                    htmlFor={`vehicle-${field}`}
                    className="text-sm font-semibold"
                  >
                    {config.label}
                  </label>
                  <input
                    id={`vehicle-${field}`}
                    name={field}
                    type="text"
                    inputMode={field === "year" ? "numeric" : undefined}
                    autoComplete="off"
                    maxLength={config.max}
                    value={draft[field]}
                    onChange={(event) => change(field, event.target.value)}
                    className={inputClass}
                    aria-invalid={!!errors[field]}
                    aria-describedby={described}
                  />
                  {help && (
                    <p
                      id={`vehicle-${field}-help`}
                      className="mt-2 text-sm text-[#686d69]"
                    >
                      {help}
                    </p>
                  )}
                  {errors[field] && (
                    <p
                      id={`vehicle-${field}-error`}
                      className="mt-2 text-sm text-[#9b281e]"
                    >
                      {errors[field]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={pending}
            className="focus-ring button-motion inline-flex min-h-12 items-center justify-center rounded-lg bg-[#181818] px-6 py-3 text-sm font-semibold text-white hover:bg-[#313131] disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Saving…" : vehicle ? "Save changes" : "Add vehicle"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="focus-ring button-motion min-h-12 rounded-lg bg-[#f7f7f5] px-6 py-3 text-sm font-semibold hover:bg-black/10 disabled:cursor-wait disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
