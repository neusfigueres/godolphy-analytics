import type { ProfessionalStat } from "../engine";

type Props = {
  professionals: ProfessionalStat[];
  currencySymbol: string;
  costeEquipo: number | null;
  professionalsInsight: { message: string; tone: "positive" | "negative" | "neutral" } | null;
  onEditCosteEquipo?: () => void;
};

export default function ProfessionalTable({ professionals, currencySymbol: curr, costeEquipo, professionalsInsight, onEditCosteEquipo }: Props) {
  return (
    <div id="seccion-profesionales" className="bg-white rounded-[18px] p-5 shadow-[0_5px_22px_rgba(75,70,92,0.10)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#4B465C] text-2xl" style={{ fontFamily: "var(--font-montserrat)" }}>Rendimiento por profesional</h2>
        <span className="text-sm text-[#9290A4]">{professionals.length} profesionales</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#9290A4] text-xs uppercase tracking-wider border-b border-gray-100">
              <th className="py-3 pr-4">Profesional</th>
              <th className="py-3 pr-4">Facturación</th>
              <th className="py-3 pr-4">Citas</th>
              <th className="py-3 pr-4">Precio medio</th>
              <th className="py-3 pr-4">Horas</th>
              <th className="py-3 pr-4">{curr}/hora</th>
              <th className="py-3 pr-4">Servicio principal</th>
              {costeEquipo !== null && <th className="py-3 pr-4">Margen est.</th>}
              {costeEquipo !== null && <th className="py-3">% margen</th>}
            </tr>
          </thead>
          <tbody>
            {professionals.map((p, i) => {
              const totalHours = professionals.reduce((s, pr) => s + pr.hoursWorked, 0);
              const costAssigned = costeEquipo !== null && totalHours > 0 && p.hoursWorked > 0
                ? costeEquipo * (p.hoursWorked / totalHours)
                : null;
              const margin = costAssigned !== null ? p.revenue - costAssigned : null;
              const marginPct = margin !== null && p.revenue > 0 ? Math.round((margin / p.revenue) * 100) : null;
              const inactive = p.hoursWorked === 0;
              return (
                <tr key={i} className={`border-b border-gray-50 ${inactive ? "opacity-50" : ""}`}>
                  <td className="py-3 pr-4 font-semibold text-[#1E1B39]">{p.name}</td>
                  {inactive ? (
                    <td colSpan={costeEquipo !== null ? 8 : 6} className="py-3 text-[#9290A4] italic">Sin actividad en el periodo</td>
                  ) : (
                    <>
                      <td className="py-3 pr-4 font-semibold text-[#621CFF]">{curr}{p.revenue.toLocaleString("es-ES")}</td>
                      <td className="py-3 pr-4 text-[#1E1B39]">{p.sessions}</td>
                      <td className="py-3 pr-4 text-[#1E1B39]">{curr}{p.avgPrice}</td>
                      <td className="py-3 pr-4 text-[#1E1B39]">{p.hoursWorked.toFixed(1)}h</td>
                      <td className="py-3 pr-4 text-[#1E1B39]">{p.euroPerHour !== null ? `${curr}${p.euroPerHour}` : "-"}</td>
                      <td className="py-3 pr-4 text-[#9290A4]">{p.topService}</td>
                      {costeEquipo !== null && (
                        <td className={`py-3 pr-4 font-semibold ${margin !== null && margin >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {margin !== null ? `${margin >= 0 ? "+" : ""}${curr}${Math.round(margin).toLocaleString("es-ES")}` : "-"}
                        </td>
                      )}
                      {costeEquipo !== null && (
                        <td className="py-3">
                          {marginPct !== null ? (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${marginPct >= 50 ? "bg-emerald-50 text-emerald-600" : marginPct >= 30 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500"}`}>
                              {marginPct}%
                            </span>
                          ) : "-"}
                        </td>
                      )}
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {onEditCosteEquipo && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={onEditCosteEquipo}
            className="text-sm font-semibold text-[#621CFF] bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors"
          >
            {costeEquipo !== null ? "Editar coste mensual del equipo" : "Añadir coste mensual del equipo"}
          </button>
          {costeEquipo !== null && (
            <p className="text-xs text-[#9290A4] max-w-md">
              Margen estimado basado en distribución proporcional por horas trabajadas. Puede variar según el modelo real de costes.
            </p>
          )}
        </div>
      )}
      {professionalsInsight && (() => {
        const { message, tone } = professionalsInsight;
        const bg = tone === "negative" ? "#FFFBEB" : tone === "neutral" ? "#F3F4F6" : "#F5F3FF";
        const iconColor = tone === "negative" ? "#D97706" : tone === "neutral" ? "#6B7280" : "#621CFF";
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
