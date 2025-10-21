"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface ErrorNoticeProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function ErrorNotice({ icon, title, description, children }: ErrorNoticeProps) {
  return (
    <Card className="border-red-200/70 dark:border-red-900/60 shadow-xl">
      <CardHeader className="flex flex-col items-center gap-3 text-center">
        {icon}
        <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </CardTitle>
        {description ? (
          <CardDescription className="text-base text-slate-600 dark:text-slate-400">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      {children && <CardContent className="space-y-3 text-sm text-left">{children}</CardContent>}
    </Card>
  );
}

