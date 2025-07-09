import React, { useEffect, useRef } from 'react';
import { useSnackbar, VariantType } from 'notistack';
import { ToastSettings, Toast } from '../../interfaces/global';

export const useToastQueue = ({ toasts, toastSettings }: { toasts: Toast[], toastSettings: ToastSettings }) => {
  const { enqueueSnackbar } = useSnackbar();
  const processedToasts = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!toastSettings.ENABLE_TOASTS || !toasts) return;

    toasts.forEach((toast) => {
      const toastId = toast.ADD_TIME;
      
      if (processedToasts.current.has(toastId)) return;
      
      if (!toastSettings.SHOW_DATA[toast.TYPE]) return;

      const getVariant = (type: string): VariantType => {
        switch (type.toLowerCase()) {
          case 'error':
            return 'error';
          case 'warning':
            return 'warning';
          case 'info':
            return 'info';
          case 'success':
            return 'success';
          default:
            return 'default';
        }
      };

      enqueueSnackbar(toast.TEXT, {
        variant: getVariant(toast.TYPE),
        autoHideDuration: toastSettings.TIMEOUT === 0 ? null : toastSettings.TIMEOUT,
        preventDuplicate: true,
        anchorOrigin: {
          vertical: toastSettings.POSITION.VERTICAL as "top" | "bottom",
          horizontal: toastSettings.POSITION.HORIZONTAL as "left" | "center" | "right",
        },
      });

      processedToasts.current.add(toastId);
    });

    if (processedToasts.current.size > 100) {
      const toastIds = Array.from(processedToasts.current);
      const toKeep = toastIds.slice(-50);
      processedToasts.current = new Set(toKeep);
    }
  }, [toasts, toastSettings, enqueueSnackbar]);

  return { enqueueSnackbar };
}; 