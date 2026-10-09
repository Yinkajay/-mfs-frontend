"use client";

import {
  CarProfile,
  PencilSimple,
  Plus,
  ArrowClockwise,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/components/auth-provider";
import {
  vehiclesApi,
  VehiclesApiError,
  type Vehicle,
  type VehicleList,
} from "@/app/lib/vehicles-api";
import {
  VEHICLE_CATEGORIES,
  VEHICLE_FIELDS,
} from "@/app/lib/vehicles-validation";
import { VehicleForm } from "./vehicle-form";
import styles from "./customer-shell.module.css";

const primary =
  "focus-ring button-motion inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#181818] px-4 py-3 text-sm font-semibold text-white hover:bg-[#313131] disabled:cursor-wait disabled:opacity-60";
const secondary =
  "focus-ring button-motion inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-50";

export function VehiclesGarage() {
  const { user, restore } = useAuth();
  // A different signed-in customer must never inherit the previous garage/draft.
  return user ? <Garage key={user.id} restore={restore} /> : null;
}

function Garage({ restore }: { restore: () => Promise<void> }) {
  const [data, setData] = useState<VehicleList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [notice, setNotice] = useState("");
  const [editor, setEditor] = useState<{ vehicle?: Vehicle } | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const listController = useRef<AbortController | null>(null);
  const readController = useRef<AbortController | null>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const mounted = useRef(false);

  const unauthorized = useCallback(() => {
    listController.current?.abort();
    readController.current?.abort();
    setData(null);
    setEditor(null);
    setOpening(null);
    setLoading(false);
    setBlocked(true);
    setNotice("");
    setError("Please log in again to see your vehicles.");
    void restore();
  }, [restore]);

  const fetchPage = useCallback(
    (offset = 0) => {
      listController.current?.abort();
      const active = new AbortController();
      listController.current = active;
      return vehiclesApi
        .list(offset, active.signal)
        .then((result) => {
          if (!active.signal.aborted && mounted.current) setData(result);
        })
        .catch((failure: unknown) => {
          if (active.signal.aborted || !mounted.current) return;
          if (failure instanceof VehiclesApiError && failure.status === 401) {
            unauthorized();
            return;
          }
          setError(
            failure instanceof VehiclesApiError
              ? failure.message
              : "We couldn’t load your vehicles. Please try again.",
          );
        })
        .finally(() => {
          if (!active.signal.aborted && mounted.current) setLoading(false);
        });
    },
    [unauthorized],
  );

  function load(offset = 0) {
    setLoading(true);
    setError("");
    setBlocked(false);
    return fetchPage(offset);
  }

  useEffect(() => {
    mounted.current = true;
    void fetchPage(0);
    return () => {
      mounted.current = false;
      listController.current?.abort();
      readController.current?.abort();
    };
  }, [fetchPage]);

  function closeEditor() {
    const vehicleId = editor?.vehicle?.id;
    setEditor(null);
    requestAnimationFrame(() => {
      if (!mounted.current) return;
      // Cards are remounted after the form closes, so the original DOM button
      // may no longer exist. Restore its replacement rather than a stale node.
      const editButton = vehicleId
        ? (document.getElementById(
            `vehicle-edit-${vehicleId}`,
          ) as HTMLButtonElement | null)
        : null;
      (editButton && !editButton.disabled
        ? editButton
        : returnFocus.current?.isConnected
          ? returnFocus.current
          : addButton.current
      )?.focus();
    });
  }
  async function edit(vehicle: Vehicle, trigger: HTMLElement) {
    readController.current?.abort();
    const active = new AbortController();
    readController.current = active;
    returnFocus.current = trigger;
    setOpening(vehicle.id);
    setError("");
    setNotice("");
    try {
      const fresh = await vehiclesApi.read(vehicle.id, active.signal);
      if (!active.signal.aborted && mounted.current)
        setEditor({ vehicle: fresh });
    } catch (failure) {
      if (active.signal.aborted || !mounted.current) return;
      if (failure instanceof VehiclesApiError && failure.status === 401) {
        unauthorized();
        return;
      }
      setError(
        failure instanceof VehiclesApiError
          ? failure.message
          : "We couldn’t open your vehicle. Please try again.",
      );
    } finally {
      if (!active.signal.aborted && mounted.current) setOpening(null);
    }
  }
  function saved(vehicle: Vehicle, added: boolean) {
    setNotice(added ? "Vehicle added." : "Vehicle details saved.");
    setData((previous) =>
      previous
        ? {
            ...previous,
            total: previous.total + (added ? 1 : 0),
            items: added
              ? previous.offset === 0
                ? [vehicle, ...previous.items].slice(0, previous.limit)
                : previous.items
              : previous.items.map((item) =>
                  item.id === vehicle.id ? vehicle : item,
                ),
          }
        : null,
    );
    closeEditor();
    void load(added ? 0 : (data?.offset ?? 0));
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Vehicles
          </h1>
          <p className="mt-4 text-pretty text-base text-[#686d69]">
            Keep your vehicle details close at hand.
          </p>
        </div>
        {!editor && (
          <button
            ref={addButton}
            type="button"
            className={primary}
            disabled={blocked || !!opening || (loading && !data)}
            onClick={(event) => {
              returnFocus.current = event.currentTarget;
              setNotice("");
              setError("");
              setEditor({});
            }}
          >
            <Plus aria-hidden="true" size={20} />
            Add vehicle
          </button>
        )}
      </div>
      {notice && (
        <p
          role="status"
          className="mb-6 rounded-lg bg-white p-4 text-sm font-semibold"
        >
          {notice}
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg bg-[#fff0eb] p-4 text-sm text-[#9b281e]"
        >
          <p>{error}</p>
          {data && (
            <p className="mt-2">
              The details below are from your last successful load.
            </p>
          )}
          {blocked ? (
            <Link
              href="/auth/login"
              className="focus-ring mt-2 inline-flex min-h-12 items-center font-semibold underline"
            >
              Log in
            </Link>
          ) : (
            <button
              type="button"
              disabled={loading}
              className="focus-ring mt-2 inline-flex min-h-12 items-center font-semibold underline disabled:opacity-50"
              onClick={() => {
                setNotice("");
                void load(data?.offset ?? 0);
              }}
            >
              Try again
            </button>
          )}
        </div>
      )}
      {editor ? (
        <VehicleForm
          key={editor.vehicle?.id ?? "new"}
          vehicle={editor.vehicle}
          onCancel={closeEditor}
          onSaved={saved}
          onUnauthorized={unauthorized}
        />
      ) : (
        <>
          {loading && !data && !blocked && (
            <div
              role="status"
              aria-label="Loading your vehicles"
              className="grid gap-6 md:grid-cols-2"
            >
              <span className="sr-only">Loading your vehicles…</span>
              {[0, 1].map((key) => (
                <div
                  key={key}
                  aria-hidden="true"
                  className="rounded-xl bg-white p-6 sm:p-8"
                >
                  <div
                    className={`${styles.skeleton} h-12 w-12 rounded-lg bg-[#e8eae6]`}
                  />
                  <div
                    className={`${styles.skeleton} mt-6 h-8 w-2/3 rounded bg-[#e8eae6]`}
                  />
                  <div
                    className={`${styles.skeleton} mt-4 h-4 w-1/2 rounded bg-[#e8eae6]`}
                  />
                </div>
              ))}
            </div>
          )}
          {data && !blocked && (
            <section aria-label="Your vehicles" aria-busy={loading}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <p role="status" className="text-sm text-[#686d69]">
                  {loading
                    ? "Refreshing your vehicles…"
                    : `${data.total} ${data.total === 1 ? "vehicle" : "vehicles"}`}
                </p>
                <button
                  type="button"
                  disabled={loading || !!opening}
                  onClick={() => {
                    setNotice("");
                    void load(data.offset);
                  }}
                  className={secondary}
                >
                  <ArrowClockwise aria-hidden="true" size={16} />
                  Refresh
                </button>
              </div>
              {data.total === 0 ? (
                <div className="rounded-xl bg-white p-6 sm:p-8">
                  <CarProfile
                    aria-hidden="true"
                    size={48}
                    weight="light"
                    className="text-[#9b281e]"
                  />
                  <h2 className="mt-6 text-2xl font-semibold tracking-tight">
                    No vehicles yet.
                  </h2>
                  <p className="mt-4 max-w-lg text-pretty text-base text-[#686d69]">
                    Add your first vehicle to keep its registration and other
                    details in one place.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 xl:grid-cols-2">
                  {data.items.map((vehicle) => {
                    const makeModel = [vehicle.make, vehicle.model]
                      .filter(Boolean)
                      .join(" ");
                    const title =
                      vehicle.name ||
                      makeModel ||
                      VEHICLE_CATEGORIES[vehicle.category];
                    return (
                      <article
                        key={vehicle.id}
                        className="min-w-0 rounded-xl bg-white p-6 sm:p-8"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <CarProfile
                            aria-hidden="true"
                            size={32}
                            weight="light"
                            className="text-[#9b281e]"
                          />
                          <button
                            type="button"
                            disabled={loading || !!opening}
                            onClick={(event) =>
                              void edit(vehicle, event.currentTarget)
                            }
                            className={`${secondary} bg-[#f7f7f5]`}
                            aria-label={`Edit ${title}`}
                            id={`vehicle-edit-${vehicle.id}`}
                          >
                            <PencilSimple aria-hidden="true" size={16} />
                            {opening === vehicle.id ? "Opening…" : "Edit"}
                          </button>
                        </div>
                        <h2 className="mt-4 text-xl font-semibold tracking-tight [overflow-wrap:anywhere]">
                          {title}
                        </h2>
                        {vehicle.name && makeModel && (
                          <p className="mt-2 text-sm text-[#686d69] [overflow-wrap:anywhere]">
                            {makeModel}
                          </p>
                        )}
                        <p className="mt-2 whitespace-pre-wrap text-base font-semibold [overflow-wrap:anywhere]">
                          {vehicle.registrationNumber ??
                            "Registration not added"}
                        </p>
                        <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                          <div>
                            <dt className="text-[#686d69]">Category</dt>
                            <dd className="mt-1 font-medium">
                              {VEHICLE_CATEGORIES[vehicle.category]}
                            </dd>
                          </div>
                          {(
                            ["year", "colour", "stateOfRegistration"] as const
                          ).map(
                            (field) =>
                              vehicle[field] !== null && (
                                <div key={field}>
                                  <dt className="text-[#686d69]">
                                    {VEHICLE_FIELDS[field].label}
                                  </dt>
                                  <dd className="mt-1 font-medium [overflow-wrap:anywhere]">
                                    {vehicle[field]}
                                  </dd>
                                </div>
                              ),
                          )}
                        </dl>
                        <details className="mt-6">
                          <summary className="focus-ring min-h-12 cursor-pointer rounded-lg py-3 text-sm font-semibold">
                            More details
                          </summary>
                          <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                            {(
                              [
                                "chassisNumber",
                                "engineNumber",
                                "engineCapacity",
                                "usageType",
                              ] as const
                            ).map((field) => (
                              <div key={field}>
                                <dt className="text-[#686d69]">
                                  {VEHICLE_FIELDS[field].label}
                                </dt>
                                <dd className="mt-1 font-medium [overflow-wrap:anywhere]">
                                  {vehicle[field] ?? "Not added"}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </details>
                      </article>
                    );
                  })}
                  {data.items.length === 0 && (
                    <p className="rounded-xl bg-white p-6 text-sm text-[#686d69]">
                      No vehicles on this page. Go back to the previous page or
                      refresh.
                    </p>
                  )}
                </div>
              )}
              {(data.offset > 0 || data.total > data.limit) && (
                <nav
                  aria-label="Vehicle pages"
                  className="mt-6 flex flex-wrap items-center justify-between gap-4"
                >
                  <button
                    type="button"
                    className={secondary}
                    disabled={loading || !!opening || data.offset === 0}
                    onClick={() =>
                      void load(Math.max(0, data.offset - data.limit))
                    }
                  >
                    Previous
                  </button>
                  <span className="text-sm text-[#686d69]">
                    Page {Math.floor(data.offset / data.limit) + 1}
                  </span>
                  <button
                    type="button"
                    className={secondary}
                    disabled={
                      loading ||
                      !!opening ||
                      data.offset + data.limit >= data.total ||
                      data.offset + data.limit > 100000
                    }
                    onClick={() => void load(data.offset + data.limit)}
                  >
                    Next
                  </button>
                </nav>
              )}
            </section>
          )}
        </>
      )}
    </>
  );
}
