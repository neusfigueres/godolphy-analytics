import type { MonthPoint } from "../engine";

type Props = {
  revenueData: MonthPoint[];
  revenueGoal: { value: number; source: string } | null;
  changePercent: number | null;
  currencySymbol: string;
  onGoalClick?: () => void;
};

// ─── Revenue Chart (SVG) ────────────────────────────────────────────────────

function RevenueChart({ data, goal, currencySymbol: curr, onGoalClick }: {
  data: MonthPoint[];
  goal: number | null;
  currencySymbol: string;
  onGoalClick?: () => void;
}) {
  const rawMax = Math.max(...data.map((d) => d.value), goal ?? 0);
  // Add 15% headroom so the goal label never clips at the top
  const maxVal = rawMax * 1.15;
  const chartH = 130;
  const chartBottom = 155;
  const chartLeft = 44;
  const totalW = 430;
  const slotW = totalW / data.length;
  const barW = 38;
  const goalY = goal !== null ? chartBottom - (goal / maxVal) * chartH : 0;

  // Dynamic y-axis ticks: ~3-4 evenly spaced values
  const tickStep = Math.max(1000, Math.round(rawMax / 3 / 1000) * 1000);
  const yTicks: number[] = [0];
  for (let v = tickStep; v <= maxVal; v += tickStep) yTicks.push(v);

  const goalLabel = goal !== null
    ? goal >= 1000
      ? `Objetivo ${curr}${(goal / 1000).toFixed(goal % 1000 === 0 ? 0 : 1)}k`
      : `Objetivo ${curr}${goal}`
    : "";
  const goalBoxW = 90;
  const goalBoxH = 16;
  const goalBoxX = chartLeft + totalW - goalBoxW - 2;
  const goalBoxY = goalY - goalBoxH - 1;

  return (
    <div style={{ overflow: "hidden", width: "100%" }}>
      <svg viewBox="0 0 490 185" className="w-full">
        {yTicks.map((v) => {
          const y = chartBottom - (v / maxVal) * chartH;
          return (
            <g key={v}>
              {v > 0 && (
                <line x1={chartLeft} y1={y} x2={chartLeft + totalW} y2={y} stroke="#EDECFA" strokeWidth="1" />
              )}
              <text x={chartLeft - 6} y={y + 3.5} textAnchor="end" fontSize="9" fill="#9290A4">
                {v === 0 ? "0" : `${curr}${v / 1000}k`}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const bH = (d.value / maxVal) * chartH;
          const x = chartLeft + i * slotW + (slotW - barW) / 2;
          const y = chartBottom - bH;
          const isCurrent = i === data.length - 1;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bH} rx={5} fill={isCurrent ? "#621CFF" : "#C4B5FD"} />
              <text x={x + barW / 2} y={175} textAnchor="middle" fontSize="10" fill="#9290A4">{d.month}</text>
              {isCurrent && (
                <text x={x + barW / 2} y={y - 7} textAnchor="middle" fontSize="10" fill="#621CFF" fontWeight="700">
                  {curr}{(d.value / 1000).toFixed(1)}k
                </text>
              )}
            </g>
          );
        })}
        {goal !== null && (
          <>
            <line x1={chartLeft} y1={goalY} x2={chartLeft + totalW} y2={goalY} stroke="#F1C917" strokeWidth="1.5" strokeDasharray="5,4" />
            <g style={{ cursor: onGoalClick ? "pointer" : "default" }} onClick={onGoalClick}>
              <rect x={goalBoxX} y={goalBoxY} width={goalBoxW} height={goalBoxH} rx={3} fill="#FFFBEB" />
              <g transform={`translate(${goalBoxX + 6}, ${goalBoxY + 3})`}>
                <rect x="0.5" y="4" width="7" height="6" rx="1" fill="#D97706" />
                <path d="M2 4V2.8a2 2 0 014 0V4" stroke="#D97706" strokeWidth="1.1" fill="none" strokeLinecap="round" />
              </g>
              <text x={goalBoxX + 18} y={goalBoxY + 11} fontSize="9" fill="#D97706" fontWeight="600">
                {goalLabel}
              </text>
            </g>
          </>
        )}
      </svg>
    </div>
  );
}

// ─── Module ─────────────────────────────────────────────────────────────────

export default function RevenueModule({ revenueData, revenueGoal, changePercent, currencySymbol: curr, onGoalClick }: Props) {
  return (
    <div id="seccion-ingresos" className="col-span-full lg:col-span-3 bg-white rounded-[18px] p-5 shadow-[0_5px_22px_rgba(75,70,92,0.10)]">
      <div className="flex flex-wrap items-center justify-between mb-5 gap-2">
        <div>
          <h2 className="font-bold text-[#4B465C] text-2xl" style={{ fontFamily: "var(--font-montserrat)" }}>Ingresos mensuales</h2>
          <p className="text-sm text-[#9290A4] mt-0.5">
            Últimos 6 meses{revenueGoal !== null ? " · con objetivo" : ""}
            {revenueGoal !== null && (
              <span className="ml-2 inline-block text-[10px] uppercase tracking-wider font-semibold bg-purple-50 text-[#621CFF] px-2 py-0.5 rounded-full align-middle">
                Auto
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#9290A4]">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-[#C4B5FD] inline-block" /> Histórico
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-[#621CFF] inline-block" /> Actual
          </span>
          {revenueGoal !== null && (
            <span className="flex items-center gap-1">
              <span className="w-4 h-0.5 bg-[#F1C917] inline-block" style={{ borderTop: "2px dashed #F1C917", height: 0 }} /> Meta
            </span>
          )}
        </div>
      </div>
      <RevenueChart
        data={revenueData}
        goal={revenueGoal?.value ?? null}
        currencySymbol={curr}
        onGoalClick={onGoalClick}
      />
      {(() => {
        const len = revenueData.length;
        const cp = changePercent;
        let bg = "#F5F3FF";
        let iconColor = "#621CFF";
        let iconPath = "M2 12l4-5 3 3 5-7"; // upward trend
        let msg: string;
        if (cp === null && len >= 2) {
          const cur = revenueData[len - 1].value;
          const prev = revenueData[len - 2].value;
          const pct = prev > 0 ? Math.round(((cur - prev) / prev) * 100) : 0;
          if (pct > 0) msg = `Ingresos al alza. +${pct}% respecto al mes anterior.`;
          else if (pct < 0) { msg = `Descenso del ${Math.abs(pct)}% respecto al mes anterior. Vigila la tendencia.`; bg = "#FFFBEB"; iconColor = "#D97706"; iconPath = "M2 4l4 5 3-3 5 7"; }
          else msg = "Ingresos estables respecto al mes anterior. Sin cambios significativos.";
        } else if (cp === null) {
          return null;
        } else if (cp > 10) {
          msg = `Crecimiento fuerte. +${cp}% respecto al mes anterior. Buen momento para consolidar la agenda.`;
        } else if (cp > 0) {
          msg = `Tendencia positiva. +${cp}% respecto al mes anterior.`;
        } else if (cp === 0) {
          msg = "Ingresos estables respecto al mes anterior. Sin cambios significativos.";
        } else if (cp >= -10) {
          bg = "#FFFBEB"; iconColor = "#D97706"; iconPath = "M2 4l4 5 3-3 5 7";
          msg = `Ligero descenso del ${Math.abs(cp)}% respecto al mes anterior. Vigila la tendencia.`;
        } else {
          bg = "#FEF2F2"; iconColor = "#EF4444"; iconPath = "M2 4l4 5 3-3 5 7";
          msg = `Caída del ${Math.abs(cp)}% respecto al mes anterior. Revisa posibles causas.`;
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
