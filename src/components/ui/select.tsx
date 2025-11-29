import * as React from "react";

type Option = { value: string; label: React.ReactNode };

type SelectContextValue = {
  value: string;
  setValue: (v: string) => void;
  options: Option[];
  registerOption: (opt: Option) => void;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [internal, setInternal] = React.useState<string>(value ?? "");
  const [options, setOptions] = React.useState<Option[]>([]);

  // Keep internal state in sync when parent passes a new value
  React.useEffect(() => {
    if (value !== undefined) {
      setInternal(value);
    }
  }, [value]);

  const registerOption = React.useCallback((opt: Option) => {
    setOptions((prev) => {
      if (prev.some((o) => o.value === opt.value)) return prev;
      return [...prev, opt];
    });
  }, []);

  const setValue = React.useCallback(
    (v: string) => {
      setInternal(v);
      onValueChange?.(v);
    },
    [onValueChange]
  );

  return (
    <SelectContext.Provider value={{ value: internal, setValue, options, registerOption }}>
      {children}
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SelectTrigger({ className }: SelectTriggerProps) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) {
    console.warn("SelectTrigger must be used inside <Select>");
    return null;
  }

  const base =
    "relative inline-flex w-full items-center text-sm";

  const box =
    "block w-full appearance-none rounded-md border border-gray-300 " +
    "bg-white px-3 py-2 leading-tight shadow-sm " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className={`${base} ${className ?? ""}`}>
      <select
        className={box}
        value={ctx.value}
        onChange={(e) => ctx.setValue(e.target.value)}
      >
        {ctx.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* chevron */}
      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

// We don't need to render anything special here – options come from <SelectItem>.
export interface SelectContentProps {
  children?: React.ReactNode;
  // align, etc. are accepted but ignored (for API compatibility)
  align?: "start" | "end" | "center";
}
export function SelectContent({ children }: SelectContentProps) {
  return <>{children}</>;
}

// Placeholder is handled by the native <select>; this component just keeps the API.
export interface SelectValueProps {
  placeholder?: string;
}
export function SelectValue(_props: SelectValueProps) {
  return null;
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export function SelectItem({ value, children }: SelectItemProps) {
  const ctx = React.useContext(SelectContext);

  React.useEffect(() => {
    if (!ctx) return;
    ctx.registerOption({ value, label: children });
  }, [ctx, value, children]);

  // We don't render a separate menu item; the native <select> handles display.
  return null;
}
