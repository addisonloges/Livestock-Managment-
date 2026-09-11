import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clarkson’s Flock",
  description: "Lifetime animal records, weights and pedigree screening for sheep and goats.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
