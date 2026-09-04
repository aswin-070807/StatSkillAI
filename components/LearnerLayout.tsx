import React, { type ReactNode } from "react";
import { AppLayout, learnerNavLinks } from "@/components/AppLayout";

export { learnerNavLinks };

export function LearnerLayout({
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

export default LearnerLayout;
