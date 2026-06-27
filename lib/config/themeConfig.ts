import type { ThemeConfig } from "../types";

/**
 * Theme konfiguracija - definiše semantičke boje i radius.
 * Ove vrednosti se mapiraju na CSS custom properties u globals.css.
 * 
 * ZA BUDUĆNOST: Kada se pravi runtime theme engine, ove vrednosti
 * će se koristiti za dinamičko menjanje teme.
 */
export const themeConfig: ThemeConfig = {
  colors: {
    primary: "#C9A87C", // Zlatna/bež - glavni brend kolor
    secondary: "#E8DCC4", // Svetlija bež - sekundarni kolor
    background: "#FAF7F2", // Vrlo svetla pozadina
    surface: "#FFFFFF", // Bela površina (kartice, modali)
    text: "#2B2B2B", // Tamno grafitna za tekst
    muted: "rgba(43, 43, 43, 0.6)", // Umanjen tekst
    border: "#E8DCC4", // Borderi
  },
  radius: {
    sm: "0.5rem", // 8px - mala dugmad, inputi
    md: "1rem", // 16px - kartice
    lg: "1.5rem", // 24px - veliki paneli, modali
  },
};

/**
 * CSS Custom Properties koje treba definisati u globals.css:
 * 
 * :root {
 *   --brand-primary: #C9A87C;
 *   --brand-secondary: #E8DCC4;
 *   --brand-background: #FAF7F2;
 *   --brand-surface: #FFFFFF;
 *   --brand-text: #2B2B2B;
 *   --brand-muted: rgba(43, 43, 43, 0.6);
 *   --brand-border: #E8DCC4;
 * }
 */