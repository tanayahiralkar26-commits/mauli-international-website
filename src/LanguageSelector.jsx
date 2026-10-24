
import { useLanguage } from "./LanguageContext";

const languageOptions = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <label className="language-selector">
      <span aria-hidden="true">◎</span>
      <span className="language-label">Language</span>

      <select
        aria-label="Select website language"
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        {languageOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
