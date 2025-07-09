import { VariantType } from 'notistack';

let enqueueSnackbarRef: ((message: string, options?: { variant?: VariantType }) => void) | null = null;

export const setEnqueueSnackbar = (enqueueSnackbar: (message: string, options?: { variant?: VariantType }) => void) => {
  enqueueSnackbarRef = enqueueSnackbar;
};

export const showToast = (message: string, variant: VariantType = 'default') => {
  if (enqueueSnackbarRef) {
    enqueueSnackbarRef(message, { variant });
  } else {
    console.warn('Toast system not initialized. Make sure SnackbarProvider is set up.');
  }
};

export const showSuccessToast = (message: string) => showToast(message, 'success');
export const showErrorToast = (message: string) => showToast(message, 'error');
export const showWarningToast = (message: string) => showToast(message, 'warning');
export const showInfoToast = (message: string) => showToast(message, 'info'); 