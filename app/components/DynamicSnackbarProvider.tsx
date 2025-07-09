"use client";
import React from 'react';
import { SnackbarProvider } from 'notistack';
import useSWR from 'swr';
import { fetcherGET } from '../utils/fetcher';
import { Toast, ToastSettings } from '../../interfaces/global';

interface DynamicSnackbarProviderProps {
  children: React.ReactNode;
}

export default function DynamicSnackbarProvider({ children }: DynamicSnackbarProviderProps) {
  const { data } = useSWR<{TOAST_SETTINGS:ToastSettings,TOASTS:Toast[]}>("/server?query=TOAST_SETTINGS&query=TOASTS", fetcherGET, {
    refreshInterval: 3000,
  });

  const anchorOrigin = {
    vertical: (data?.TOAST_SETTINGS.POSITION.VERTICAL || 'bottom') as 'top' | 'bottom',
    horizontal: (data?.TOAST_SETTINGS.POSITION.HORIZONTAL || 'right') as 'left' | 'center' | 'right',
  };

  const autoHideDuration = data?.TOAST_SETTINGS.TIMEOUT === 0 
    ? null 
    : (data?.TOAST_SETTINGS.TIMEOUT || 3000);

  return (
    <SnackbarProvider
      maxSnack={5}
      anchorOrigin={anchorOrigin}
      autoHideDuration={autoHideDuration}
      dense
      preventDuplicate
    >
      {children}
    </SnackbarProvider>
  );
} 