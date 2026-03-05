import React from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";
import { FaMale, FaFemale } from "react-icons/fa";

export default function FamilyMemberNode({ data }: NodeProps<any>) {
  const gender = data.gender as "male" | "female";
  const Icon = gender === "male" ? FaMale : FaFemale;

  return (
    <div
      style={{
        padding: 10,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.06)",
        minWidth: 180,
        boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
      }}
      dir="rtl"
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0.6 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            background: "rgba(124,58,237,0.25)",
            border: "1px solid rgba(124,58,237,0.30)",
          }}
        >
          <Icon />
        </div>
        <div>
          <div style={{ fontWeight: 900 }}>{data.full_name}</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            {data.is_deceased ? "متوفى" : "حي"} • {data.gender === "male" ? "ذكر" : "أنثى"}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.6 }} />
    </div>
  );
}