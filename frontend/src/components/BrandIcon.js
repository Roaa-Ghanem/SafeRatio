import React from 'react';

// Reusable brand icon component. Accepts `variant`, `size`, and `color` props.
export default function BrandIcon({ variant = 'shield', size = 28, color = '#4f46e5' }) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    style: { display: 'block' },
  };

  if (variant === 'shield') {
    return (
      <svg {...commonProps} aria-hidden>
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill={color} opacity="0.95" />
        <path d="M12 7L2 7v5c0 5 10 9 10 9s10-4 10-9V7l-10 0z" fill={color} opacity="0.15" />
      </svg>
    );
  }

  if (variant === 'user') {
    return (
      <svg {...commonProps} aria-hidden>
        <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5z" fill={color} />
        <path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4v1H4v-1z" fill={color} opacity="0.15" />
      </svg>
    );
  }

  // default generic icon
  return (
    <svg {...commonProps} aria-hidden>
      <circle cx="12" cy="8" r="3" fill={color} />
      <path d="M4 20c0-3.5 7-6 8-6s8 2.5 8 6v1H4v-1z" fill={color} opacity="0.15" />
    </svg>
  );
}
