import { X } from "lucide-react";
import { useEffect } from "react";

const Modal = ({ open, title, subtitle, onClose, children }) => {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/65 p-4 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-brand-200/80 bg-white/98 p-6 shadow-2xl md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Subtle top brand glow */}
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-[32px] bg-gradient-to-r from-brand-500 via-amber-500 to-brand-600" />
        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-brand-100/50 blur-3xl" />

        <div className="relative mb-6 flex items-start justify-between gap-4 border-b border-brand-100/60 pb-5">
          <div>
            <h3 className="font-display text-3xl font-bold leading-tight text-stone-900 md:text-4xl">
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-200/80 bg-stone-50/80 text-stone-500 transition hover:bg-brand-50 hover:text-brand-600 hover:rotate-90 hover:scale-105"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
