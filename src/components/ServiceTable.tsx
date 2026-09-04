import type { ServiceStat } from "../engine";

type Props = {
  services: ServiceStat[];
  servicesInsight: { message: string; tone: "negative" | "positive" | "neutral" } | null;
  currencySymbol: string;
  highlightedService?: string | null;
};

export default function ServiceTable({ services, servicesInsight, currencySymbol: curr, highlightedService }: Props) {
  return (
    <div id="seccion-rentabilidad" className="col-span-full lg:col-span-3 bg-white rounded-[18px] p-5 shadow-[0_5px_22px_rgba(75,70,92,0.10)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#4B465C] text-2xl" style={{ fontFamily: "var(--font-montserrat)" }}>Rendimiento por servicio</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Servicio", "Sesiones", "Ingreso medio", "Ingresos totales", "€/hora"].map((h) => (
                <th key={h} className="text-left py-2 pr-4 text-[#9290A4] font-semibold uppercase tracking-wide text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map((s, i) => (
              <tr
                key={i}
                className={`border-b last:border-0 hover:bg-gray-50/50 transition-all duration-300 ${
                  highlightedService === s.name
                    ? "border-[#621CFF] bg-purple-50/60"
                    : "border-gray-50"
                }`}
              >
                <td className="py-3 pr-4"><span className="font-medium text-[#1E1B39]">{s.name}</span></td>
                <td className="py-3 pr-4 text-[#615E82]">{s.sessions}</td>
                <td className="py-3 pr-4 font-semibold text-[#1E1B39]">{curr}{s.avg}</td>
                <td className="py-3 pr-4"><span className="font-semibold text-[#621CFF]">{curr}{s.revenue.toLocaleString()}</span></td>
                <td className="py-3">
                  {s.efficiency === "unknown" ? (
                    <span className="text-gray-300 text-sm">—</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[60px]">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: s.efficiency === "high" ? "100%" : s.efficiency === "medium" ? "65%" : "35%",
                            backgroundColor: s.efficiency === "high" ? "#10B981" : s.efficiency === "medium" ? "#F1C917" : "#EF4444",
                          }}
                        />
                      </div>
                      <span className={`font-semibold text-xs ${s.efficiency === "high" ? "text-emerald-600" : s.efficiency === "medium" ? "text-amber-600" : "text-red-500"}`}>
                        {s.euroPerHour}{curr}/h
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {servicesInsight && (() => {
        const { message, tone } = servicesInsight;
        const bg = tone === "negative" ? "#FEF2F2" : tone === "positive" ? "#F5F3FF" : "#F3F4F6";
        const iconColor = tone === "negative" ? "#EF4444" : tone === "positive" ? "#621CFF" : "#9CA3AF";
        const iconPath = tone === "negative" ? "M2 4l4 5 3-3 5 7" : tone === "positive" ? "M2 12l4-5 3 3 5-7" : "M8 4v4M8 10v.5";
        return (
          <div className="mt-4 rounded-xl px-3.5 py-3 flex items-start gap-2.5" style={{ backgroundColor: bg }}>
            <svg viewBox="0 0 16 16" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none">
              <path d={iconPath} stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm text-[#4B465C] leading-relaxed">{message}</p>
          </div>
        );
      })()}
    </div>
  );
}
