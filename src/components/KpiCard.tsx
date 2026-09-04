import { type ReactNode } from "react";

type Props = {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
  change?: string;
  positive?: boolean;
  size?: "lg" | "md";
  beneficio?: {
    value: number | null;
    currencySymbol: string;
  };
  onEditCostes?: () => void;
};

export default function KpiCard({
  label,
  value,
  sub,
  icon,
  change,
  positive,
  size = "lg",
  beneficio,
  onEditCostes,
}: Props) {
  const isLg = size === "lg";
  const iconSize = isLg ? "w-[62px] h-[62px] rounded-[19px]" : "w-[52px] h-[52px] rounded-[16px]";
  const iconShadow = isLg ? "0 16px 30px -14px rgba(123,77,255,0.7)" : "0 12px 24px -10px rgba(123,77,255,0.6)";
  const valueClass = isLg ? "text-[37px]" : "text-[28px]";
  const labelClass = isLg ? "font-bold text-[#1E1B39] text-[18px] leading-snug truncate" : "text-sm font-semibold text-[#1E1B39] truncate";
  const subClass = isLg ? "text-[14px] text-[#9290A4]" : "text-xs text-[#9290A4] mt-0.5";
  const changeClass = isLg ? "text-sm truncate" : "text-xs truncate";

  // ── Beneficio special case ──────────────────────────────────────────────────
  if (beneficio !== undefined) {
    const b = beneficio.value;
    const curr = beneficio.currencySymbol;
    return (
      <div className="bg-white rounded-[21px] p-5 shadow-[0_5px_22px_rgba(75,70,92,0.10)]">
        <div className="flex items-start gap-4">
          <div
            className={`${iconSize} flex items-center justify-center flex-shrink-0`}
            style={{
              backgroundImage: "linear-gradient(150deg, #7B4DFF 0%, #B07CFF 100%)",
              boxShadow: iconShadow,
            }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            {b !== null ? (
              <>
                <div className="flex items-center gap-1 mb-1">
                  <svg viewBox="0 0 15 8" className="w-3 h-2 flex-shrink-0" fill="none">
                    {b >= 0
                      ? <path d="M1 7L7.5 1L14 7" stroke="#04B215" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      : <path d="M1 1L7.5 7L14 1" stroke="#FF4F4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    }
                  </svg>
                  <span className={changeClass} style={{ color: b >= 0 ? "#04B215" : "#FF4F4F" }}>
                    {b >= 0 ? "Beneficio positivo" : "Pérdidas este mes"}
                  </span>
                </div>
                <div className={`font-bold leading-none mb-1 ${valueClass}`} style={{ color: b >= 0 ? "#1E1B39" : "#EF4444" }}>
                  {b.toLocaleString("es-ES")} {curr}
                </div>
              </>
            ) : (
              <>
                <div className="text-sm text-[#9290A4] mb-2 leading-relaxed">
                  Añade tus costes para calcular tu beneficio real
                </div>
                {onEditCostes && (
                  <button
                    onClick={onEditCostes}
                    className="text-sm font-semibold text-white bg-[#621CFF] hover:bg-[#4A12CC] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Añadir costes
                  </button>
                )}
              </>
            )}
            <div className={`${labelClass} mt-1`}>{label}</div>
            <div className="flex items-center justify-between">
              <span className={subClass}>{sub}</span>
              {b !== null && onEditCostes && (
                <button
                  onClick={onEditCostes}
                  className="text-sm text-[#621CFF] font-semibold hover:underline"
                >
                  Editar costes
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Standard KPI card ───────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-[21px] p-5 shadow-[0_5px_22px_rgba(75,70,92,0.10)]">
      <div className="flex items-start gap-4">
        <div
          className={`${iconSize} flex items-center justify-center flex-shrink-0`}
          style={{
            backgroundImage: "linear-gradient(150deg, #7B4DFF 0%, #B07CFF 100%)",
            boxShadow: iconShadow,
          }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          {change !== undefined && (
            <div className="flex items-center gap-1 mb-1">
              <svg viewBox="0 0 15 8" className="w-3 h-2 flex-shrink-0" fill="none">
                {positive
                  ? <path d="M1 7L7.5 1L14 7" stroke="#04B215" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  : <path d="M1 1L7.5 7L14 1" stroke="#FF4F4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                }
              </svg>
              <span className={changeClass} style={{ color: positive ? "#04B215" : "#FF4F4F" }}>
                {change}
              </span>
            </div>
          )}
          <div className={`font-bold text-[#1E1B39] leading-none mb-1 ${valueClass}`}>
            {value}
          </div>
          <div className={labelClass}>{label}</div>
          <div className={subClass}>{sub}</div>
        </div>
      </div>
    </div>
  );
}
