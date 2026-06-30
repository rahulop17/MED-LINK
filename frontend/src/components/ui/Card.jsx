import React from "react"

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,82,204,0.05)] hover:shadow-[0_8px_30px_rgb(0,82,204,0.08)] transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={`p-5 pb-3 flex flex-col gap-1.5 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className = "", children, ...props }) {
  return (
    <h3
      className={`text-lg font-bold text-slate-900 leading-snug tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ className = "", children, ...props }) {
  return (
    <p className={`text-sm text-slate-500/90 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={`p-5 pt-0 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className = "", children, ...props }) {
  return (
    <div
      className={`p-5 pt-0 flex items-center justify-between border-t border-slate-100/80 mt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
