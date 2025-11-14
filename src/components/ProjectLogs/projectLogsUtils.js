export const isLogEligibleForChildEntry = (log) => {
  if (!log) {
    return false;
  }

  const { para_no, spec_section, id } = log;
  return Boolean(para_no && spec_section && id);
};

