import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SideBar from "./components/SideBar";
import ThemeRegistry from "./components/ThemeRegistry";
import DynamicSnackbarProvider from "./components/DynamicSnackbarProvider";
import ToastElement from "./components/ToastElement";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bluetooth Mesh Control",
  description: "Bluetooth Mesh Control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeRegistry>
          <DynamicSnackbarProvider>
            <SideBar>
              {children}
            </SideBar>
            <ToastElement />
          </DynamicSnackbarProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
