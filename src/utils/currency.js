export const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(amount || 0);
};

export const formatVNDShort = (amount) => {
  const n = amount || 0;
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + ' tỷ';
  if (n >= 1000000) return (n / 1000000).toFixed(0) + ' tr';
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(n);
};