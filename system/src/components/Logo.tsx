import { useTheme } from "../context/ThemeContext";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  const { theme } = useTheme();
  const src = theme === "dark" ? "/assets/logos/prismma_logo_dark.png" : "/assets/logos/prismma_main_logo.png";
  return <img src={src} alt="Prismma Express" className={className} />;
}
