import type { Metadata } from "next";
import "./globals.css";

// Fonts are defined via local @font-face in globals.css to avoid network fetches during build.

export const metadata: Metadata = {
  title: "Loomis Chaffee Course Planner",
  description: "Plan your four-year course schedule at Loomis Chaffee",
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
