import React, { type ReactNode } from "react";
import { AppLayout, adminNavLinks } from "@/components/AppLayout";

export { adminNavLinks };

export function AdminLayout({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const layoutProps: { title?: string; subtitle?: string } = {};
  if (title !== undefined) layoutProps.title = title;
  if (subtitle !== undefined) layoutProps.subtitle = subtitle;

  return (
    <AppLayout {...layoutProps}>
      {children}
    </AppLayout>
  );
}

export default AdminLayout;
