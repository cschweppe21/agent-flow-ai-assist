import React from 'react';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

export function RatingStars({ label, value, onChange }: Props) {
  return (
    <div className="cn-rating-item">
      <div className="cn-field-label">{label}</div>
      <div className="cn-stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`cn-star ${n <= value ? 'filled' : ''}`}
            onClick={() => onChange(n === value ? 0 : n)}
            title={`${n} / 5`}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
}
