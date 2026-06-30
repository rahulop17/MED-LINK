import React from "react"

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  children,
  loading = false,
  ...props
}) {
  const baseStyle =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"

  const variants = {
    primary:
      "bg-forest text-white shadow-[0_4px_12px_rgba(0,82,204,0.2)] hover:bg-forest-light focus:ring-forest-light",
    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-200",
    outline:
      "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-100",
    danger:
      "bg-red-600 text-white shadow-[0_4px_12px_rgba(220,38,38,0.2)] hover:bg-red-500 focus:ring-red-500",
    ghost:
      "text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-100",
  }

  const sizes = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  }

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
