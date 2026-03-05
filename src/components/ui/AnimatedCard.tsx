import React from "react";
import { motion } from "framer-motion";

export default function AnimatedCard({
  title,
  subtitle,
  right,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={`card ${className ?? ""}`}
      initial={{ opacity: 0, y: 14, rotateX: 6 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>
          {subtitle ? <div className="muted" style={{ marginTop: 2 }}>{subtitle}</div> : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      {children}
    </motion.div>
  );
}