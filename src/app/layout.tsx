import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cut costs with Fauxdoo",
  description:
    "See how much you could save by replacing your apps with the Fauxdoo Suite. Fictional product for demonstration only.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
