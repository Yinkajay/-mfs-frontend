/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-static";

export const alt = "MFS Services vehicle registration in Lagos";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public", "mfs-logo-solid.png"));
  const logoSource = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#181818",
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "space-between",
          padding: 80,
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 720 }}>
          <img
            src={logoSource}
            alt="MFS Services"
            width="240"
            height="55"
            style={{ height: 55, objectFit: "contain", width: 240 }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.05,
              marginTop: 64,
            }}
          >
            Vehicle documents without losing your day.
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.62)",
              display: "flex",
              fontSize: 24,
              marginTop: 32,
            }}
          >
            Registration, renewals, insurance and permits in Lagos.
          </div>
        </div>

        <div
          style={{
            alignItems: "center",
            background: "#f7f3ea",
            borderRadius: 48,
            color: "#181818",
            display: "flex",
            flexDirection: "column",
            height: 390,
            justifyContent: "center",
            padding: 40,
            width: 300,
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "#ff4f3d",
              borderRadius: 999,
              color: "white",
              display: "flex",
              fontSize: 24,
              height: 132,
              justifyContent: "center",
              width: 132,
            }}
          >
            MFS
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, marginTop: 40 }}>
            MVAA authorized
          </div>
          <div style={{ color: "#6b706c", display: "flex", fontSize: 20, marginTop: 12 }}>
            Lagos, Nigeria
          </div>
        </div>
      </div>
    ),
    size,
  );
}
