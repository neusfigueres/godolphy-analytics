import type { MonthPoint } from "../engine";

type Props = {
  clientData: MonthPoint[];
};

// ─── Client Chart (SVG) ─────────────────────────────────────────────────────

function ClientChart({ data }: { data: MonthPoint[] }) {
  const minVal = Math.min(...data.map((d) => d.value));
  const maxVal = Math.max(...data.map((d) => d.value));
  const W = 290;
  const H = 130;
  const lPad = 30;
  const bPad = 25;
  const tPad = 14;
  const innerW = W - lPad - 10;
  const innerH = H - tPad - bPad;

  const pts = data.map((d, i) => ({
    x: lPad + (i / (data.length - 1)) * innerW,
    y: tPad + (1 - (d.value - minVal) / (maxVal - minVal)) * innerH,
    ...d,
  }));

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = [
    `M ${pts[0].x},${H - bPad}`,
    ...pts.map((p) => `L ${p.x},${p.y}`),
    `L ${pts[pts.length - 1].x},${H - bPad}`,
    "Z",
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="clientGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#621CFF" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#621CFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[minVal, Math.round((minVal + maxVal) / 2), maxVal].map((v) => {
        const y = tPad + (1 - (v - minVal) / (maxVal - minVal)) * innerH;
        return (
          <g key={v}>
            <line x1={lPad} y1={y} x2={W - 10} y2={y} stroke="#EDECFA" strokeWidth="1" />
            <text x={lPad - 4} y={y + 3.5} textAnchor="end" fontSize="9" fill="#9290A4">{v}</text>
          </g>
        );
      })}
      <path d={areaPath} fill="url(#clientGrad)" />
      <polyline points={polyline} fill="none" stroke="#621CFF" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3.5} fill="white" stroke="#621CFF" strokeWidth="2" />
          <text x={p.x} y={H - 8} textAnchor="middle" fontSize="9" fill="#9290A4">{p.month}</text>
        </g>
      ))}
      {pts[pts.length - 1] && (
        <g>
          <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={5} fill="#621CFF" />
          <text
            x={pts[pts.length - 1].x}
            y={pts[pts.length - 1].y - 9}
            textAnchor="middle"
            fontSize="10"
            fill="#621CFF"
            fontWeight="700"
          >
            {pts[pts.length - 1].value}
          </text>
        </g>
      )}
    </svg>
  );
}

// ─── Module ─────────────────────────────────────────────────────────────────

export default function NewClientsModule({ clientData }: Props) {
  return (
    <div className="col-span-full lg:col-span-2 bg-white rounded-[18px] p-5 shadow-[0_5px_22px_rgba(75,70,92,0.10)]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-bold text-[#4B465C] text-2xl" style={{ fontFamily: "var(--font-montserrat)" }}>Nuevos clientes</h2>
          <p className="text-sm text-[#9290A4] mt-0.5">Captación mensual</p>
        </div>
        {(() => {
          const len = clientData.length;
          if (len >= 2) {
            const cur2 = clientData[len - 1].value;
            const prev2 = clientData[len - 2].value;
            const pct = prev2 > 0 ? Math.round(((cur2 - prev2) / prev2) * 100) : null;
            if (pct !== null) {
              return (
                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${pct >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                  {pct >= 0 ? "↑" : "↓"} {pct >= 0 ? "+" : ""}{pct}% vs {clientData[len - 2].month}
                </span>
              );
            }
          }
          return null;
        })()}
      </div>
      <ClientChart data={clientData} />
      {(() => {
        const len = clientData.length;
        if (len === 0) return null;
        const cur = clientData[len - 1].value;
        const prev = len >= 2 ? clientData[len - 2].value : null;
        let bg = "#F5F3FF";
        let iconColor = "#621CFF";
        let iconPath = "M2 12l4-5 3 3 5-7";
        let msg: string;
        if (cur === 0) {
          msg = "No se detectan clientes nuevos este mes.";
          bg = "#F3F4F6"; iconColor = "#9CA3AF"; iconPath = "M8 4v4M8 10v.5";
        } else if (prev === null || prev === 0) {
          msg = `${cur} clientes nuevos este mes.`;
        } else {
          const diff = cur - prev;
          const pct = Math.round(((cur - prev) / prev) * 100);
          if (diff > 0) {
            msg = `Tu captación está creciendo. +${diff} clientes nuevos este mes respecto al anterior.`;
          } else if (diff === 0) {
            msg = "La captación se mantiene estable. Sin cambios significativos.";
            bg = "#F3F4F6"; iconColor = "#6B7280";
          } else if (pct >= -30) {
            bg = "#FFFBEB"; iconColor = "#D97706"; iconPath = "M2 4l4 5 3-3 5 7";
            msg = "Menos clientes nuevos que el mes anterior. Puede que necesites reforzar tu visibilidad.";
          } else {
            bg = "#FEF2F2"; iconColor = "#EF4444"; iconPath = "M2 4l4 5 3-3 5 7";
            msg = "Caída notable en captación. Revisa si hay algo que esté frenando las nuevas reservas.";
          }
        }
        return (
          <div className="mt-4 rounded-xl px-3.5 py-3 flex items-start gap-2.5" style={{ backgroundColor: bg }}>
            <svg viewBox="0 0 16 16" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none">
              <path d={iconPath} stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm text-[#4B465C] leading-relaxed">{msg}</p>
          </div>
        );
      })()}
    </div>
  );
}
