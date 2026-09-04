import type { AlertItem } from "../engine";

type Props = {
  alerts: AlertItem[];
  onAlertAction?: (alert: AlertItem) => void;
};

export default function AlertsPanel({ alerts, onAlertAction }: Props) {
  return (
    <div className="col-span-full lg:col-span-2 bg-white rounded-[18px] p-5 shadow-[0_5px_22px_rgba(75,70,92,0.10)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#4B465C] text-2xl" style={{ fontFamily: "var(--font-montserrat)" }}>Alertas prioritarias</h2>
        <span className="text-xs bg-red-50 text-red-500 font-semibold px-2 py-1 rounded-full">
          {alerts.length} activas
        </span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className={`rounded-xl p-3.5 border ${
              alert.type === "danger" ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  alert.type === "danger" ? "bg-[#EF4444]" : "bg-[#F1C917]"
                }`}
              >
                <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
                  <path d="M6 4v3M6 8.5v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold mb-0.5 ${alert.type === "danger" ? "text-red-700" : "text-amber-700"}`}>
                  {alert.title}
                </div>
                <div className={`text-sm leading-relaxed ${alert.type === "danger" ? "text-red-500" : "text-amber-600"}`}>
                  {alert.desc}
                </div>
                {alert.action && onAlertAction && (
                  <button
                    onClick={() => onAlertAction(alert)}
                    className={`text-sm font-semibold mt-1.5 hover:underline transition-all ${alert.type === "danger" ? "text-red-600" : "text-amber-600"}`}
                  >
                    {alert.action} →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
