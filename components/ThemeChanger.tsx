import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "phosphor-react";

import Box from "./Box";

const ThemeChanger = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <Box
      onClick={() => {
        setTheme(theme && theme === "light" ? "dark" : "light");
      }}
      css={{
        display: "flex",
        marginLeft: "auto",
        cursor: "pointer",
        alignItems: "center",
        justifyContent: "center",
        color: "$muted",
      }}
    >
      {theme === "dark" ? (
        <Sun weight="bold" size="16px" />
      ) : (
        <Moon weight="bold" size="16px" />
      )}
    </Box>
  );
};

export default ThemeChanger;
