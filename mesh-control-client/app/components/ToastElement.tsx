"use client";
import React, { useEffect } from 'react';
import useSWR from 'swr';
import { fetcherGET } from '../utils/fetcher';
import { Toast, ToastSettings } from '../../interfaces/global';
import { useToastQueue } from '../hooks/useToastQueue';
import { setEnqueueSnackbar } from '../utils/toast';

const ToastElement = () => {
  const { data, isLoading, error } = useSWR<{TOASTS:Toast[], TOAST_SETTINGS:ToastSettings}>("/server?query=TOASTS&query=TOAST_SETTINGS", fetcherGET, {
    refreshInterval: 1000,
  });

  const { enqueueSnackbar } = useToastQueue({
    toasts: data?.TOASTS || [],
    toastSettings: data?.TOAST_SETTINGS || {
      ENABLE_TOASTS: data?.TOAST_SETTINGS.ENABLE_TOASTS || false,
      TIMEOUT: data?.TOAST_SETTINGS.TIMEOUT || 3000,
      SHOW_DATA: data?.TOAST_SETTINGS.SHOW_DATA || {},
      POSITION: data?.TOAST_SETTINGS.POSITION || {
        VERTICAL: "bottom",
        HORIZONTAL: "right",
      },
    },
  });

  useEffect(() => {
    setEnqueueSnackbar(enqueueSnackbar);
  }, [enqueueSnackbar]);

  return null;
};

export default ToastElement;