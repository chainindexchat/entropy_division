"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useThemeStyle } from "@/hooks/use-theme-style";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
export const ThemeStyleProvider = React.memo(function ({
  children,
}: {
  children: React.ReactNode;
}) {
  const { themeStyle } = useThemeStyle();
  const [mounted, setMounted] = React.useState(false);

  React.useLayoutEffect(() => {
    if (document.body.getAttribute("data-theme") !== themeStyle) {
      document.body.setAttribute("data-theme", themeStyle);
    }
    setMounted(true);
  }, [themeStyle]);

  if (!mounted) {
    return null;
  }

  return children;
});

ThemeStyleProvider.displayName = "ThemeStyleProvider";
