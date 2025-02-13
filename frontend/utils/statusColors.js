const STATUS_STYLES = {
  approved: {
    text: 'text-green-700',
    background: 'bg-green-100',
    border: 'border-green-500',
  },
  rejected: {
    text: 'text-red-700',
    background: 'bg-red-100',
    border: 'border-red-500',
  },
  correction: {
    text: 'text-yellow-700',
    background: 'bg-yellow-100',
    border: 'border-yellow-500',
  },
  pending: {
    text: 'text-blue-700',
    background: 'bg-blue-100',
    border: 'border-blue-500',
  },
  default: {
    text: 'text-gray-700',
    background: 'bg-gray-100',
    border: 'border-gray-400',
    weight: 'font-medium',
  },
};

export const getStatusColor = (status) => {
  const statusKey = status?.toLowerCase() || 'default';
  const styles = STATUS_STYLES[statusKey] || STATUS_STYLES.default;
  
  return `${styles.text} ${styles.background} border ${styles.border} px-2 py-1 rounded-md ${styles.weight || 'font-semibold'}`;
};

// Additional status-related utilities can be added here
export const isValidStatus = (status) => {
  return Object.keys(STATUS_STYLES).includes(status?.toLowerCase());
};