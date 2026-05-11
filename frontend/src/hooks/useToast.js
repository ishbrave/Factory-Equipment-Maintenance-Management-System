import { toast } from 'react-hot-toast';

export const useToast = () => ({
  showSuccess: (message) => toast.success(message),
  showError: (message) => toast.error(message),
  showInfo: (message) => toast(message, { icon: 'ℹ️' }),
});
