import React from "react";
import { Handle, Position } from "reactflow";

export default function FamilyMemberNode({ data }: any) {
  return (
    <div
      style={{
        minWidth: 220,
        borderRadius: 20,
        padding: 14,
        background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
        border: "1px solid rgba(200,164,77,0.35)",
        color: "#F8F7F2",
        boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        textAlign: "center",
        backdropFilter: "blur(10px)",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: "#C8A44D" }} />

      <div style={{ fontSize: 18, fontWeight: 900, color: "#E7D39A" }}>
        {data.label}
      </div>

      {data.fatherName ? (
        <div style={{ marginTop: 8, fontSize: 12, color: "rgba(248,247,242,0.72)" }}>
          الأب: {data.fatherName}
        </div>
      ) : null}

      {data.grandfatherName ? (
        <div style={{ marginTop: 4, fontSize: 12, color: "rgba(248,247,242,0.62)" }}>
          الجد: {data.grandfatherName}
        </div>
      ) : null}

      {data.generation ? (
        <div style={{ marginTop: 8, fontSize: 11, color: "#C8A44D" }}>
          الجيل / الترتيب: {data.generation}
        </div>
      ) : null}

      <Handle type="source" position={Position.Bottom} style={{ background: "#C8A44D" }} />
    </div>
  );
}