import React from "react";
import './button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const btnClass = variant === "secondary" ? "btn-secondary" : "btn-primary";
  return (
    <button className={`${btnClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
