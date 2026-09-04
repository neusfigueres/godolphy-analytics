import type { TopClient } from "../engine";

type Props = {
  topClients: TopClient[];
  currencySymbol: string;
};

export default function TopClients({ topClients, currencySymbol: curr }: Props) {
  return (
    <div className="bg-white rounded-[18px] p-5 shadow-[0_5px_22px_rgba(75,70,92,0.10)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#4B465C] text-2xl" style={{ fontFamily: "var(--font-montserrat)" }}>Clientes más valiosos</h2>
        <span className="text-sm text-[#9290A4]">Por gasto total</span>
      </div>
      <div className="space-y-3">
        {topClients.slice(0, 10).map((c, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {c.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#1E1B39] truncate">{c.name}</div>
              <div className="text-sm text-[#9290A4]">{c.visits} visitas · {c.lastService}</div>
            </div>
            <div className="text-sm font-bold text-[#621CFF] flex-shrink-0">{curr}{c.total}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
