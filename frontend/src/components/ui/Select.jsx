import { FiChevronDown } from "react-icons/fi";

export function Select({ className = "", children, ...props }) {
  return (
    <div className="relative">
      <select className={`input w-full appearance-none pr-9 ${className}`} {...props}>
        {children}
      </select>
      <FiChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint"
      />
    </div>
  );
}
