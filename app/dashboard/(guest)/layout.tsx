import React from "react";

export const runtime = 'edge'

export default function GuestLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
