import type { AtRiskClient } from "../engine";

type Props = {
  atRiskClients: AtRiskClient[];
  currencySymbol: string;
  highlightClients?: boolean;
  onLaunchCampaign?: (client: AtRiskClient) => void;
};

export default function AtRiskClients({ atRiskClients, currencySymbol: curr, highlightClients, onLaunchCampaign }: Props) {
  return (
    <div id="seccion-clientes-riesgo" className="bg-white rounded-[18px] p-5 shadow-[0_5px_22px_rgba(75,70,92,0.10)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#4B465C] text-2xl" style={{ fontFamily: "var(--font-montserrat)" }}>Clientes en riesgo</h2>
        <span className="text-xs bg-red-50 text-red-500 font-semibold px-2 py-0.5 rounded-full">{atRiskClients.length} clientes</span>
      </div>
      <div className="space-y-3">
        {atRiskClients.slice(0, 8).map((c, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-xl px-2 py-1.5 -mx-2 transition-all duration-300 ${
              highlightClients ? "bg-purple-50 ring-1 ring-[#621CFF]" : ""
            }`}
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.risk === "alto" ? "bg-[#EF4444]" : "bg-[#F1C917]"}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#1E1B39] truncate">{c.name}</div>
              <div className="text-sm text-[#9290A4]">Última visita: {c.days} días · LTV {curr}{c.ltv}</div>
            </div>
            {onLaunchCampaign && (
              <button
                onClick={() => onLaunchCampaign(c)}
                className="flex-shrink-0 text-sm font-semibold text-[#621CFF] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Lanzar campaña
              </button>
            )}
          </div>
        ))}
      </div>
      {onLaunchCampaign && atRiskClients.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <a
            href="https://www.godolphy.com/darme-de-alta/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#1E1B39] hover:bg-[#2d2960] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
              <path d="M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L10 14.4l-4.8 2.5.9-5.4L2.2 7.7l5.4-.8L10 2z" />
            </svg>
            Lanzar campaña para todas
          </a>
        </div>
      )}
    </div>
  );
}
