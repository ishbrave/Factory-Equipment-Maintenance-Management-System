const calculateDurationHours = (entryTime, exitTime) => {
  const start = new Date(entryTime);
  const end = new Date(exitTime);

  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) {
    return null;
  }

  const diffHours = diffMs / (1000 * 60 * 60);
  const rounded = Math.ceil(diffHours);

  return Math.max(1, rounded);
};

const calculateAmountPaid = (duration) => {
  const normalizedDuration = Number(duration) || 0;
  return Math.max(500, normalizedDuration * 500);
};

module.exports = {
  calculateDurationHours,
  calculateAmountPaid,
};
