import { Sparkles } from "lucide-react";
import type { ServiceStat, AtRiskClient } from "../engine";

type Props = {
  facturacion: number;
  changePercent: number | null;
  topService: ServiceStat | undefined;
  atRiskClients: AtRiskClient[];
  precioMedio: number;
  currencySymbol: string;
  aiInsight?: string | null;
  aiInsightLoading?: boolean;
};

export default function InsightBanner({
  facturacion,
  changePercent,
  topService,
  atRiskClients,
  precioMedio,
  currencySymbol: curr,
  aiInsight,
  aiInsightLoading,
}: Props) {
  return (
    <div className="rounded-[18px] p-5 text-white" style={{ background: 'linear-gradient(to right, #621CFF, #9B1CCC)' }}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-purple-200 text-sm font-semibold uppercase tracking-wide">Insight del mes</span>
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">IA</span>
          </div>
          {aiInsightLoading ? (
            <div className="space-y-2 py-1">
              <div className="h-4 bg-white/20 rounded-full animate-pulse w-full" />
              <div className="h-4 bg-white/20 rounded-full animate-pulse w-5/6" />
              <p className="text-white/60 text-xs mt-2 italic">Godolphy está analizando tu negocio...</p>
            </div>
          ) : aiInsight ? (
            <p className="text-white font-medium leading-relaxed text-sm">{aiInsight}</p>
          ) : (() => {
            const riskAlto = atRiskClients.filter((c) => c.risk === "alto").length;
            const riskPotential = riskAlto * precioMedio * 2;
            const changeText = changePercent !== null
              ? <>, un <span className="font-bold text-yellow-300">{changePercent >= 0 ? "+" : ""}{changePercent}%</span> {changePercent >= 0 ? "más" : "menos"} que el mes anterior</>
              : null;
            return (
              <p className="text-white font-medium leading-relaxed text-sm">
                Este mes has generado <span className="font-bold">{facturacion.toLocaleString("es-ES")} {curr}</span>{changeText}.
                {topService && <> Tu servicio estrella es el <span className="font-bold">{topService.name}</span> con {topService.sessions} sesiones.</>}
                {atRiskClients.length > 0 && <> Tienes <span className="font-bold text-red-300">{atRiskClients.length} clientes en riesgo de abandono</span> que no han vuelto en 45+ días — una campaña de reactivación podría recuperar hasta {riskPotential.toLocaleString("es-ES")} {curr}.</>}
              </p>
            );
          })()}
        </div>
        <button className="text-white/50 hover:text-white/80 transition-colors flex-shrink-0">
          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
