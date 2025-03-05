import React from 'react';
import '../styles/dashboard.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}: ButtonProps) {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-300";
  
  const variantClasses = {
    primary: "dashboard-button",
    secondary: "dashboard-button dashboard-button-secondary",
    outline: "dashboard-button-outline"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
} 