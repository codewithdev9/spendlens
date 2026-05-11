import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SpendLens AI Spend Audit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { id: string } }) {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0f",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui",
          color: "#e8e8f0",
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 900, color: "#00d4aa", marginBottom: 24 }}>
          $ SpendLens
        </div>
        <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-3px", marginBottom: 16 }}>
          AI Spend Audit
        </div>
        <div style={{ fontSize: 22, color: "#8888aa" }}>
          Free tool by Credex · credex.rocks
        </div>
      </div>
    ),
    size
  );
}
