import React from "react"

const getGender = (name = "") => {
  if (!name) return "men"
  return name.charCodeAt(0) % 2 === 0 ? "men" : "women"
}

const getPhotoId = (name = "") => {
  if (!name) return 1
  return (name.charCodeAt(0) + (name?.charCodeAt(1) || 0)) % 70
}

export function Avatar({ src, name = "", size = "md", className = "", ...props }) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl",
  }

  const imageSrc = src || null


  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden border border-slate-200/50 bg-blue-50 text-forest font-bold font-display ${sizes[size]} ${className}`}
      {...props}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={name}
          className="w-full h-full object-cover object-top"
          onError={(e) => {
            // If image fails, hide image and show initials
            e.target.style.display = "none"
          }}
        />
      ) : (
        <span>{name ? name.charAt(0).toUpperCase() : ""}</span>
      )}
    </div>
  )
}
