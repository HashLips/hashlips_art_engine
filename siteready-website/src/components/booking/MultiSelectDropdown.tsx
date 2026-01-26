import React from "react";
import styles from "./BookLabourNowForm.module.css";

type Option = string;

interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  error?: string;
  className?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
  error,
  className = "",
}) => {
  const toggle = (value: string, checked: boolean) => {
    if (checked) {
      onChange(selected.includes(value) ? selected : [...selected, value]);
    } else {
      onChange(selected.filter((v) => v !== value));
    }
  };

  return (
    <div className={`${styles.field} ${className}`}>
      <span className={styles.label}>{label}</span>
      <details className={styles.detailsList}>
        <summary className={`${styles.input} ${!selected.length ? styles.selectPrompt : ""}`}>
          {selected.length ? `${selected.length} selected` : <strong>SELECT</strong>}
        </summary>
        <div>
          {options.map((opt) => (
            <label key={opt} className={styles.inline}>
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={(e) => toggle(opt, e.target.checked)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </details>
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
};

export default MultiSelectDropdown;
