import React from "react"

export function Badge({ className = "", variant = "info", children, ...props }) {
  const baseStyle = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide"

  const variants = {
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    warning: "bg-amber-50 text-amber-800 border border-amber-100",
    danger: "bg-rose-50 text-rose-700 border border-rose-100",
    info: "bg-blue-50 text-blue-700 border border-blue-100",
    neutral: "bg-slate-50 text-slate-600 border border-slate-100",
    forest: "bg-blue-50 text-forest border border-blue-100/50",
  }

  return (
    <span className={`${baseStyle} ${variants[variant] || variants.info} ${className}`} {...props}>
      {children}
    </span>
  )
}
