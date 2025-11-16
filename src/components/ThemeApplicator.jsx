import { useEffect } from "react";
import { useTheme } from "@mui/material/styles";

function ThemeApplicator() {
  const theme = useTheme();

  // This effect runs whenever the theme changes (light/dark)
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--calendar-bg",
      theme.palette.background.paper
    );
    document.documentElement.style.setProperty(
      "--calendar-text-color",
      theme.palette.text.primary
    );
    document.documentElement.style.setProperty(
      "--calendar-tile-hover-bg",
      theme.palette.action.hover
    );
    document.documentElement.style.setProperty(
      "--calendar-active-bg",
      theme.palette.primary.main
    );
    document.documentElement.style.setProperty(
      "--calendar-active-text-color",
      theme.palette.primary.contrastText
    );
    document.documentElement.style.setProperty(
      "--calendar-workday-bg",
      theme.palette.success.light
    );
  }, [theme]);

  // This component does not render any visible HTML
  return null;
}

export default ThemeApplicator;
