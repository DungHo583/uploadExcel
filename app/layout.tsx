import type { Metadata } from "next";
// import { fontSans } from "../lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Check Serial Tool",
  description: "Check Serial Tool By DungHo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // className={`${fontSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
