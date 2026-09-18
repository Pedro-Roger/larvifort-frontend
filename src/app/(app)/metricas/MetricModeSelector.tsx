import { useRef, type KeyboardEvent } from "react";
import type { MetricMode } from "@/services/metrics";
import styles from "./metrics.module.css";

const modes: { id: MetricMode; title: string; description: string }[] = [
  {
    id: "guided",
    title: "Guiado",
    description: "Crie uma análise passo a passo.",
  },
  {
    id: "blocks",
    title: "Blocos",
    description: "Gerencie análises salvas rapidamente.",
  },
  {
    id: "advanced",
    title: "Avançado",
    description: "Combine fontes e operações.",
  },
];

export default function MetricModeSelector({
  value,
  onChange,
}: {
  value: MetricMode;
  onChange: (mode: MetricMode) => void;
}) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusMode = (index: number) => {
    const nextIndex = (index + modes.length) % modes.length;
    onChange(modes[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusMode(index - 1);
        break;
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusMode(index + 1);
        break;
      case "Home":
        event.preventDefault();
        focusMode(0);
        break;
      case "End":
        event.preventDefault();
        focusMode(modes.length - 1);
        break;
    }
  };

  return (
    <div className={styles.modeSelector} role="tablist" aria-label="Modo de criação da análise">
      {modes.map((mode, index) => (
        <button
          key={mode.id}
          ref={(element) => {
            tabRefs.current[index] = element;
          }}
          id={`metric-mode-${mode.id}`}
          type="button"
          role="tab"
          aria-selected={value === mode.id}
          aria-controls={`metric-builder-${mode.id}`}
          tabIndex={value === mode.id ? 0 : -1}
          className={value === mode.id ? styles.modeSelected : ""}
          onClick={() => onChange(mode.id)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          <strong>{mode.title}</strong>
          <small>{mode.description}</small>
        </button>
      ))}
    </div>
  );
}
