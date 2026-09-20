import type { Metadata } from "next";
import "../app/globals.css";
import ClientLayout from "../app/ClientLayout";

export const metadata: Metadata = {
  title: "CIC — Confidential Insurance Claims | Midnight Network",
  description: "Privacy-preserving zero-knowledge insurance claim verification dApp on Midnight Network.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
