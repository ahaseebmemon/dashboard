import { Moon, Sun } from "lucide-react"
import { Button } from "./ui/button"
import { useTheme } from "./ThemeProvider"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      // Added rounded-full, glass hover effect, and removed borders
      className="rounded-full text-white hover:bg-white/20 hover:text-white border-0 transition-all focus-visible:ring-0 focus-visible:ring-offset-0"
    >
      {/* Slowed down the spin animation to duration-500 for a more premium feel */}
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform duration-500 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform duration-500 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
