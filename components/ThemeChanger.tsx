import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "phosphor-react";

import Button from "./Button";

const ThemeChanger = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <Button
      outline
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
      {theme === "dark" ? <Sun size="15px" /> : <Moon size="15px" />}
    </Button>
  );
};

export default ThemeChanger;
