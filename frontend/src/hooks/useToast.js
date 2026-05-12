import { useMemo } from 'react';
import { toast } from 'react-hot-toast';

export const useToast = () => {
  return useMemo(
    () => ({
      showSuccess: (message) => toast.success(message),
      showError: (message) => toast.error(message),
      showInfo: (message) => toast(message),
    }),
    []
  );
};
