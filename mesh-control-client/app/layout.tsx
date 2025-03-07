
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SideBar from "./components/SideBar";
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
          <SideBar>
            {children}
          </SideBar>
      </body>
    </html>
  );
}
