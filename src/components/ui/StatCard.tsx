import React from "react";
import AnimatedCard from "./AnimatedCard";

export default function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <AnimatedCard
      title={label}
      right={<div style={{ fontSize: 22, opacity: 0.9 }}>{icon}</div>}
    >
      <div style={{ fontSize: 28, fontWeight: 800 }}>{value}</div>
    </AnimatedCard>
  );
}