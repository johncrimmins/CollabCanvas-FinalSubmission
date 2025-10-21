import type { Metadata } from "next";
import "./globals.css";
// Toaster is rendered inside ProtectedAppShell for authenticated routes

export const metadata: Metadata = {
  title: "CollabCanvas",
  description: "Real-time collaborative canvas for teams",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

