import React from 'react';
import '../styles/dashboard.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`
      dashboard-card
      ${className}
    `}>
      {children}
    </div>
  );
} 