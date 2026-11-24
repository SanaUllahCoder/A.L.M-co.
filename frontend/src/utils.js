export const money = (value) => new Intl.NumberFormat('en-PK', {
  style: 'currency', currency: 'PKR', maximumFractionDigits: 2
}).format(Number(value) || 0);

export const dateLabel = (value) => new Intl.DateTimeFormat('en-PK', {
  day: '2-digit', month: 'short', year: 'numeric'
}).format(new Date(value));
