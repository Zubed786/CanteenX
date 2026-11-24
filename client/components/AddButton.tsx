import { useEffect, useRef, useState } from "react";

interface Props {
  label: string;
  name: string;
  disabled?: boolean;
  variant?: "hero-btn" | "compact";
  onAdd: () => boolean;
}

export default function AddButton({ label, name, disabled, variant, onAdd }: Props) {
  const [confirmation, setConfirmation] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      aria-label={name}
      disabled={disabled}
      className={["add-button", variant, confirmation && "is-added"].filter(Boolean).join(" ")}
      onClick={() => {
        if (!onAdd()) return;
        window.clearTimeout(timer.current);
        setConfirmation(n => n + 1);
        timer.current = window.setTimeout(() => setConfirmation(0), 1100);
      }}
    >
      <span className="add-label">{label}</span>
      <span key={confirmation} className="add-confirmation" aria-hidden="true">
        {variant === "compact" ? "✓" : "✓ Added"}
      </span>
    </button>
  );
}
