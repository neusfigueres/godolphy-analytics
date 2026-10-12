import type { OpportunityItem } from "../engine";

type Props = {
  opportunities: OpportunityItem[];
  loading?: boolean;
  onSelectOpportunity?: (op: OpportunityItem) => void;
};

export default function Opportunities({ opportunities, loading, onSelectOpportunity }: Props) {
  return (
    <div className="bg-white rounded-[18px] p-5 shadow-[0_5px_22px_rgba(75,70,92,0.10)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#4B465C] text-2xl" style={{ fontFamily: "var(--font-montserrat)" }}>Oportunidades</h2>
        {loading ? (
          <span className="text-xs text-[#621CFF] font-medium animate-pulse">Generando con IA…</span>
        ) : (
          <span className="text-sm text-[#9290A4]">Top {opportunities.length} por impacto</span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {loading ? (
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl p-3 border border-gray-100 bg-gray-50 animate-pulse">
              <div className="h-4 bg-gray-200 rounded-full w-2/5 mb-2" />
              <div className="h-4 bg-gray-200 rounded-full w-1/5 mb-2" />
              <div className="h-3 bg-gray-200 rounded-full w-full mb-1.5" />
              <div className="h-3 bg-gray-200 rounded-full w-4/5" />
            </div>
          ))
        ) : (
          opportunities.map((o, i) => (
            <div key={i} className="rounded-xl p-3 border" style={{ borderColor: `${o.color}20`, backgroundColor: o.bg }}>
              {/* Amount sits under the title so long AI explanations keep the full card width */}
              <div className="text-sm font-semibold" style={{ color: o.color }}>{o.title}</div>
              <div
                className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1 mb-1.5"
                style={{ color: o.color, backgroundColor: `${o.color}20` }}
              >
                {o.potential}
              </div>
              <div className="text-sm text-gray-500 leading-relaxed">{o.desc}</div>
              {onSelectOpportunity && (
                <button
                  onClick={() => onSelectOpportunity(o)}
                  className="text-sm font-semibold mt-2 hover:underline"
                  style={{ color: o.color }}
                >
                  Ver acción recomendada →
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
