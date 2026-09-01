// ─── Currency ──────────────────────────────────────────────────────────────────

export function getCurrencySymbol(pais: string): string {
  const currencies: Record<string, string> = {
    "España": "€",
    "Reino Unido": "£",
    "Estados Unidos": "$",
    "México": "MX$",
    "Colombia": "COP$",
    "Argentina": "AR$",
    "Chile": "CLP$",
    "Perú": "S/",
    "Ecuador": "$",
    "Uruguay": "$U",
    "Venezuela": "Bs.",
    "Bolivia": "Bs.",
    "Paraguay": "₲",
    "Guatemala": "Q",
    "Costa Rica": "₡",
    "República Dominicana": "RD$",
  };
  return currencies[pais] ?? "€";
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export type RawRow = Record<string, string>;

export type ServiceStat = {
  name: string;
  sessions: number;
  avg: number;
  revenue: number;
  duration: number; // avg minutes per session
  euroPerHour: number | null;
  efficiency: "high" | "medium" | "low" | "unknown";
};

export type AtRiskClient = {
  name: string;
  email: string | null;
  phone: string | null;
  days: number;
  ltv: number;
  risk: "alto" | "medio";
  lastService: string;
  avatar: string;
  descuentoFrecuente: boolean;
};

export type DashMetrics = {
  ocupacion: number;
  ocupacionFranja: number;
  retencion: number;
  cancelacionesSemana: number;
  precioMedio: number;
  facturacion: number;
  walkInPercent: number; // % of non-cancelled current-month appointments that are walk-ins
};

export type MonthPoint = { month: string; value: number };

export type TopClient = {
  name: string;
  email: string | null;
  phone: string | null;
  visits: number;
  total: number;
  lastService: string;
  avatar: string;
};

export type ProfessionalStat = {
  name: string;
  revenue: number;
  sessions: number;
  avgPrice: number;
  hoursWorked: number;
  euroPerHour: number | null;
  topService: string;
};

export type OpportunityItem = {
  id: string;
  title: string;
  desc: string;
  potential: string;
  impact: number;
  color: string;
  bg: string;
  actionText: string;
  actionButton: string;
  whyText: string;
};

export type DashData = {
  hasRealData: true;
  period: string;
  platform: string | null;
  kpis: {
    facturacion: number;
    facturacionAnterior: number | null;
    changePercent: number | null;
    precioMedioHora: number | null;
    ocupacion: number;
    totalRegistros: number;
    clientesUnicos: number;
    retencion: number;
    tasaCancelacion: number;
    numServiciosTotal: number;
    numOportunidadesTotal: number;
  };
  services: ServiceStat[];
  servicesInsight: { message: string; tone: "negative" | "positive" | "neutral" } | null;
  atRiskClients: AtRiskClient[];
  topClients: TopClient[];
  monthlyRevenue: MonthPoint[];
  revenueGoal: { value: number; source: "auto-best-historical" | "auto-single-month" } | null;
  newClientsPerMonth: MonthPoint[];
  opportunities: OpportunityItem[];
  professionalStats: ProfessionalStat[];
  metrics: DashMetrics;
};

// ─── Value parsers ──────────────────────────────────────────────────────────────

function parsePrice(val: string): number {
  const clean = val.replace(/[^0-9.,\-]/g, "").replace(",", ".");
  const n = parseFloat(clean);
  return isNaN(n) || n < 0 ? 0 : n;
}

function parseDuration(val: string): number {
  const s = String(val).trim();
  const hm = s.match(/(\d+)\s*h[^0-9]*(\d+)?\s*m?/i);
  if (hm) return parseInt(hm[1], 10) * 60 + (hm[2] ? parseInt(hm[2], 10) : 0);
  const minOnly = s.match(/(\d+)\s*m/i);
  if (minOnly) return parseInt(minOnly[1], 10);
  const num = s.match(/(\d+(?:[.,]\d+)?)/);
  if (!num) return 0;
  const n = parseFloat(num[1].replace(",", "."));
  return n <= 8 ? Math.round(n * 60) : Math.round(n);
}

// Returns minutes-since-midnight from a time value (Date, "HH:MM", number serial)
function parseTimeMinutes(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return val.getUTCHours() * 60 + val.getUTCMinutes();
  }

  if (typeof val === "number") {
    const frac = val % 1;
    if (frac < 0 || frac > 1) return null;
    return Math.round(frac * 1440);
  }

  const str = String(val).trim();
  const m = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?(?:\s*(am|pm))?$/i);
  if (m) {
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (m[3]) {
      if (m[3].toLowerCase() === "pm" && h < 12) h += 12;
      if (m[3].toLowerCase() === "am" && h === 12) h = 0;
    }
    return h * 60 + min;
  }

  return null;
}

// Minutos desde medianoche a partir de un valor fecha-hora (Date, serial Excel o texto "HH:MM")
function parseClock(val: unknown): number | null {
  if (val instanceof Date && !isNaN(val.getTime())) return val.getHours() * 60 + val.getMinutes();
  if (typeof val === "number" && isFinite(val)) {
    const frac = val % 1;
    return frac > 0 ? Math.round(frac * 1440) : null;
  }
  const m = String(val).match(/(\d{1,2}):(\d{2})/);
  return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null;
}

function parseExcelDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
  }

  if (typeof value === "number") {
    if (!isFinite(value) || value < 1) return null;
    const utc = new Date(Math.round((value - 25569) * 86400 * 1000));
    if (isNaN(utc.getTime())) return null;
    return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
  }

  const str = String(value).trim();
  if (!str) return null;

  // DD/MM/YYYY or D/M/YYYY (Spanish/European, 4-digit year)
  const dmySlash4 = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmySlash4) {
    const [, d, m, y] = dmySlash4;
    const date = new Date(+y, +m - 1, +d);
    return isNaN(date.getTime()) ? null : date;
  }

  // D/M/YY or DD/MM/YY (2-digit year — Booksy exports use this format)
  // Convention: YY < 50 → 2000+YY, YY >= 50 → 1900+YY
  const dmySlash2 = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})(?:\s|$)/);
  if (dmySlash2) {
    const [, d, m, yy] = dmySlash2;
    const fullYear = +yy < 50 ? 2000 + +yy : 1900 + +yy;
    const date = new Date(fullYear, +m - 1, +d);
    return isNaN(date.getTime()) ? null : date;
  }

  // DD-MM-YYYY
  const dmyDash = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (dmyDash) {
    const [, d, m, y] = dmyDash;
    const date = new Date(+y, +m - 1, +d);
    return isNaN(date.getTime()) ? null : date;
  }

  // YYYY-MM-DD (ISO)
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const [, y, m, d] = iso;
    return new Date(+y, +m - 1, +d);
  }

  return null;
}

// ─── Client field extraction ────────────────────────────────────────────────────

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const PHONE_REGEX = /(\+?\d[\d\s.\-]{7,}\d)/;

function extractEmail(text: string): string | null {
  const match = text.match(EMAIL_REGEX);
  return match ? match[0].trim() : null;
}

function extractPhone(text: string): string | null {
  const match = text.match(PHONE_REGEX);
  if (!match) return null;
  const raw = match[0].trim();
  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length < 8) return null;
  return hasPlus ? `+${digits}` : digits;
}

function cleanClientName(rawString: string): string {
  let cleaned = rawString;
  cleaned = cleaned.replace(EMAIL_REGEX, "");
  cleaned = cleaned.replace(PHONE_REGEX, "");
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned || rawString.trim();
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ─── Normalised row ─────────────────────────────────────────────────────────────

export type NRow = {
  fecha: Date;
  cliente: { name: string; email: string | null; phone: string | null };
  servicio: string;
  precio: number;
  duracion: number;
  cancelada: boolean;
  tieneDescuento: boolean;
  profesional: string;
  categoria: string | null; // Booksy: "Categoría principal"; captured but not yet used in KPIs
  isWalkIn: boolean;        // true when client is "Cliente sin ficha"
  startMin: number | null;
};

// ─── Opportunity engine ──────────────────────────────────────────────────────

function computeOpportunities(
  normalized: NRow[],
  fieldMap: Record<string, string>,
  precioMedio: number,
  now: Date,
  currencySymbol: string,
): OpportunityItem[] {
  const curr = currencySymbol;
  const ops: OpportunityItem[] = [];
  const nc = normalized.filter((r) => !r.cancelada);

  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  const ninetyDaysAgo  = new Date(now.getTime() - 90  * 86400000);
  const fortyTwoDaysAgo   = new Date(now.getTime() - 42  * 86400000);
  const twentyOneDaysAgo  = new Date(now.getTime() - 21  * 86400000);

  type CR = {
    firstDate: Date; lastDate: Date; visits: number; spent: number;
    visitsLast3m: number; services: Set<string>; lastService: string;
    discountVisits: number;
  };
  const cm = new Map<string, CR>();
  for (const r of nc) {
    const k = r.cliente.name.toLowerCase();
    const e = cm.get(k);
    const inLast3m = r.fecha >= threeMonthsAgo;
    cm.set(k, {
      firstDate:  !e || r.fecha < e.firstDate ? r.fecha : e.firstDate,
      lastDate:   !e || r.fecha > e.lastDate  ? r.fecha : e.lastDate,
      visits:     (e?.visits     ?? 0) + 1,
      spent:      (e?.spent      ?? 0) + r.precio,
      visitsLast3m: (e?.visitsLast3m ?? 0) + (inLast3m ? 1 : 0),
      services:   e ? new Set([...e.services, r.servicio]) : new Set([r.servicio]),
      lastService: !e || r.fecha > e.lastDate ? r.servicio : e.lastService,
      discountVisits: (e?.discountVisits ?? 0) + (r.tieneDescuento ? 1 : 0),
    });
  }
  const clients = [...cm.values()];

  // ── OP-01: Paquetes de fidelización ──────────────────────────────────────
  const eligible01 = clients.filter((c) => c.visitsLast3m >= 4).length;
  if (eligible01 > 0) {
    const impact = eligible01 * precioMedio;
    ops.push({
      id: "OP-01", title: "Paquetes de fidelización",
      desc: `${eligible01} clientes son candidatos a un bono mensual`,
      potential: `${curr}${Math.round(impact).toLocaleString("es-ES")}/mes`,
      impact: Math.round(impact), color: "#631CFF", bg: "#F5F3FF",
      whyText: `${eligible01} clientes han venido 4 o más veces en los últimos 3 meses. Son tus más fieles y las más fáciles de convertir a un bono mensual de ingresos recurrentes.`,
      actionText: "Crea un bono mensual para tus clientes más frecuentes. Garantiza ingresos recurrentes y premia su fidelidad con un precio preferencial.",
      actionButton: "Crear bono",
    });
  }

  // ── OP-02: Reactivación ex-clientes ──────────────────────────────────────
  const inactive90 = clients.filter((c) => c.lastDate < ninetyDaysAgo && c.visits >= 2);
  if (inactive90.length > 0) {
    const impact = Math.round(inactive90.length * precioMedio * 0.6);
    ops.push({
      id: "OP-02", title: "Reactivación de ex-clientes",
      desc: `${inactive90.length} clientes no vuelven desde hace más de 3 meses`,
      potential: `${curr}${impact.toLocaleString("es-ES")} potencial`,
      impact, color: "#0EA5E9", bg: "#F0F9FF",
      whyText: `${inactive90.length} clientes que venían con regularidad llevan más de 90 días sin visitar el salón. Recuperando el 30% habitual con una campaña dirigida, podrías generar ~${curr}${impact.toLocaleString("es-ES")} en visitas recuperadas.`,
      actionText: "Envía un mensaje personalizado a estos clientes con una oferta de reactivación. Un 20% de descuento en su próxima visita suele ser suficiente para recuperarlas.",
      actionButton: "Enviar campaña",
    });
  }

  // ── OP-03: Clientes en riesgo de fuga ────────────────────────────────────
  {
    let fuga = 0;
    for (const c of clients) {
      if (c.visits < 3) continue;
      const totalMonths = Math.max(1, (c.lastDate.getTime() - c.firstDate.getTime()) / (30 * 86400000));
      const histRate   = c.visits / totalMonths;
      const recentRate = c.visitsLast3m / 3;
      if (histRate >= 0.5 && recentRate < histRate * 0.5 && c.lastDate >= ninetyDaysAgo) fuga++;
    }
    if (fuga > 0) {
      const impact = Math.round(fuga * precioMedio * 0.5);
      ops.push({
        id: "OP-03", title: "Clientes en riesgo de fuga",
        desc: `${fuga} clientes vienen cada vez con menos frecuencia`,
        potential: `${curr}${impact.toLocaleString("es-ES")} en riesgo`,
        impact, color: "#EF4444", bg: "#FEF2F2",
        whyText: `${fuga} clientes han reducido su frecuencia de visitas más de un 50% respecto a su histórico. Sin acción, es probable que dejen de venir. Una reactivación temprana es más efectiva y tiene menor coste.`,
        actionText: "Contacta a estos clientes antes de que dejen de venir del todo. Un mensaje recordándoles su último servicio favorito, con un pequeño incentivo, suele frenar la fuga.",
        actionButton: "Contactar ahora",
      });
    }
  }

  // ── OP-04: Clientes sin próxima cita ─────────────────────────────────────
  {
    const n = clients.filter((c) => c.lastDate >= fortyTwoDaysAgo && c.lastDate < twentyOneDaysAgo).length;
    if (n > 0) {
      const impact = Math.round(n * precioMedio);
      ops.push({
        id: "OP-04", title: "Clientes sin próxima cita",
        desc: `${n} clientes terminaron su servicio y no han reservado`,
        potential: `${curr}${impact.toLocaleString("es-ES")} potencial`,
        impact, color: "#0EA5E9", bg: "#F0F9FF",
        whyText: `${n} clientes vinieron hace entre 3 y 6 semanas pero no tienen nueva reserva. Es la ventana natural de necesitar el servicio de nuevo — el momento ideal para un recordatorio.`,
        actionText: "Envía un recordatorio a estos clientes para que reserven su próxima cita. Un mensaje tipo '¿Cuándo vienes a renovar?' con un enlace de reserva convierte muy bien en esta ventana.",
        actionButton: "Enviar recordatorio",
      });
    }
  }

  // ── OP-05: Extras de masaje no ofrecidos ─────────────────────────────────
  if (fieldMap["servicio"]) {
    const handFoot = nc.filter((r) => /manicura|pedicura|gel|nail|mano|pie|uñ/i.test(r.servicio));
    if (handFoot.length > 0) {
      const impact = Math.round(handFoot.length * 7 * 0.3);
      ops.push({
        id: "OP-05", title: "Extras de masaje no ofrecidos",
        desc: "Ninguna cliente tiene extras de masaje en sus citas",
        potential: `+${curr}${impact.toLocaleString("es-ES")}/mes estimado`,
        impact, color: "#10B981", bg: "#ECFDF5",
        whyText: `Tienes ${handFoot.length} sesiones de manos/pies al mes sin ningún extra de masaje registrado. Con un 30% de adopción y 7${curr} de precio medio, podrías generar +${curr}${impact.toLocaleString("es-ES")}/mes sin captar nuevos clientes.`,
        actionText: "Añade masaje de manos o pies como extra en tus servicios. 10–15 minutos a 5–10${curr}. Es el extra más fácil de ofrecer porque el cliente ya está en el sillón — y pocas lo rechazan.",
        actionButton: "Añadir extra",
      });
    }
  }

  // ── OP-06: Extras dentro del servicio ────────────────────────────────────
  if (fieldMap["servicio"] && fieldMap["cliente"]) {
    const n = clients.filter((c) => c.visits >= 2).length;
    if (n > 0) {
      const impact = Math.round(n * 5 * 0.3 * 4);
      ops.push({
        id: "OP-06", title: "Extras dentro del servicio",
        desc: `${n} clientes nunca han añadido ningún extra a sus servicios`,
        potential: `+${curr}${impact.toLocaleString("es-ES")}/mes estimado`,
        impact, color: "#10B981", bg: "#ECFDF5",
        whyText: `${n} clientes recurrentes no tienen ningún extra registrado en sus citas. Los extras son ingresos de muy bajo esfuerzo: solo hay que proponerlos en el momento adecuado.`,
        actionText: "Introduce '¿Le añadimos algo más hoy?' como parte del proceso estándar de cada cita. Un extra de 5–10${curr} por cliente frecuente puede aumentar tu facturación mensual notablemente.",
        actionButton: "Activar extras",
      });
    }
  }

  // ── OP-07: Upsell de servicio relacionado ────────────────────────────────
  if (fieldMap["servicio"] && fieldMap["cliente"]) {
    const pairs: Array<[RegExp, RegExp, string, string]> = [
      [/gel|manicura gel/i,  /nail art/i,  "Gel",      "Nail Art"],
      [/corte/i,             /tinte/i,     "Corte",    "Tinte"],
      [/\bmanicura\b/i,      /pedicura/i,  "Manicura", "Pedicura"],
      [/facial/i,            /masaje/i,    "Facial",   "Masaje"],
    ];
    let best = { count: 0, a: "", b: "", impact: 0 };
    for (const [pA, pB, lA, lB] of pairs) {
      const hasA   = clients.filter((c) => [...c.services].some((s) => pA.test(s)));
      const onlyA  = hasA.filter((c) => ![...c.services].some((s) => pB.test(s)));
      const impact = Math.round(onlyA.length * precioMedio * 0.3);
      if (onlyA.length > best.count) best = { count: onlyA.length, a: lA, b: lB, impact };
    }
    if (best.count > 0) {
      ops.push({
        id: "OP-07", title: "Upsell de servicio relacionado",
        desc: `${best.count} clientes de ${best.a} nunca han probado ${best.b}`,
        potential: `${curr}${best.impact.toLocaleString("es-ES")} potencial`,
        impact: best.impact, color: "#631CFF", bg: "#F5F3FF",
        whyText: `${best.count} clientes que hacen ${best.a} regularmente nunca han probado ${best.b}. La probabilidad de conversión es alta porque ya son clientes activos y confían en el salón.`,
        actionText: `La próxima vez que estos clientes vengan, ofréceles probar ${best.b} con un descuento de primera vez. La barrera es baja y el ticket sube de forma natural.`,
        actionButton: "Activar upsell",
      });
    }
  }

  // ── OP-08: Ticket bajo en clientes frecuentes ────────────────────────────
  {
    const n = clients.filter((c) => c.visitsLast3m >= 4 && c.spent / c.visits < precioMedio).length;
    if (n > 0) {
      const impact = Math.round(n * 5 * 4);
      ops.push({
        id: "OP-08", title: "Aumento de ticket en clientes frecuentes",
        desc: `${n} clientes frecuentes tienen ticket por debajo de tu media`,
        potential: `+${curr}${impact.toLocaleString("es-ES")}/mes`,
        impact, color: "#F59E0B", bg: "#FFFBEB",
        whyText: `${n} de tus clientes más fieles tienen un ticket medio inferior a tu media del salón (${curr}${Math.round(precioMedio)}). Son candidatos ideales para proponer un extra o servicio adicional en su próxima visita.`,
        actionText: "En la próxima cita de estos clientes, propón un extra o servicio complementario. Su frecuencia indica fidelidad — solo falta darles la oportunidad de gastar un poco más.",
        actionButton: "Ver estrategia",
      });
    }
  }

  // ── OP-09: Franjas vacías en horario prime ───────────────────────────────
  {
    const hasTime = nc.some((r) => r.fecha.getHours() !== 0 || r.fecha.getMinutes() !== 0);
    if (hasTime) {
      const prime = nc.filter((r) => { const h = r.fecha.getHours(); return h >= 17 && h < 19; });
      const primeOcc = nc.length > 0 ? (prime.length / nc.length) * 100 : 100;
      if (primeOcc < 30) {
        const potential = Math.round(((30 - primeOcc) / 100) * nc.length * precioMedio);
        ops.push({
          id: "OP-09", title: "Franjas vacías en horario prime",
          desc: "Tu franja 17h–19h está casi vacía cada semana",
          potential: `~${curr}${potential.toLocaleString("es-ES")}/mes perdidos`,
          impact: potential, color: "#10B981", bg: "#ECFDF5",
          whyText: `Solo el ${Math.round(primeOcc)}% de tus citas son en la franja 17h–19h, cuando la demanda suele ser más alta. Llenar esa franja podría añadir ~${curr}${potential.toLocaleString("es-ES")}/mes sin cambiar nada más.`,
          actionText: "Activa tarifas de franja horaria para las 17h–19h, ofrece servicios a domicilio o crea una lista de espera específica para ese horario.",
          actionButton: "Activar estrategia",
        });
      }
    }
  }

  // ── OP-10: Día de la semana flojo ────────────────────────────────────────
  {
    const dayMap = new Map<number, number>();
    for (const r of nc) dayMap.set(r.fecha.getDay(), (dayMap.get(r.fecha.getDay()) ?? 0) + 1);
    if (dayMap.size >= 3) {
      const avg = nc.length / dayMap.size;
      const DAYS = ["Domingos","Lunes","Martes","Miércoles","Jueves","Viernes","Sábados"];
      let worst: { day: number; sessions: number } | null = null;
      for (const [d, s] of dayMap) {
        if (s < avg * 0.6 && (!worst || s < worst.sessions)) worst = { day: d, sessions: s };
      }
      if (worst) {
        const recoverable = Math.round((avg - worst.sessions) * 0.4 * 4.3);
        const impact = Math.round(recoverable * precioMedio);
        const pct = Math.round(100 - (worst.sessions / avg) * 100);
        ops.push({
          id: "OP-10", title: "Día de la semana flojo recurrente",
          desc: `Los ${DAYS[worst.day]} tienes un ${pct}% menos de reservas que el resto`,
          potential: `${curr}${impact.toLocaleString("es-ES")}/mes recuperables`,
          impact, color: "#10B981", bg: "#ECFDF5",
          whyText: `Los ${DAYS[worst.day]} registras un ${pct}% menos de citas que la media del resto de días. Activar una promoción específica para ese día podría recuperar buena parte de esos huecos.`,
          actionText: `Crea una tarifa especial o promoción para los ${DAYS[worst.day]}. Los clientes con flexibilidad de horario responden bien a incentivos de día específico.`,
          actionButton: "Crear promoción",
        });
      }
    }
  }

  // ── OP-11: Tiempo muerto entre citas ─────────────────────────────────────
  {
    const hasTime = nc.some((r) => r.fecha.getHours() !== 0 || r.fecha.getMinutes() !== 0);
    if (hasTime && fieldMap["duracion"]) {
      const byDay = new Map<string, Array<{ s: number; e: number }>>();
      for (const r of nc.filter((r) => r.duracion > 0)) {
        const dk = `${r.fecha.getFullYear()}-${r.fecha.getMonth()}-${r.fecha.getDate()}`;
        const list = byDay.get(dk) ?? [];
        list.push({ s: r.fecha.getTime(), e: r.fecha.getTime() + r.duracion * 60000 });
        byDay.set(dk, list);
      }
      let totalGap = 0, gapDays = 0;
      for (const sessions of byDay.values()) {
        if (sessions.length < 2) continue;
        sessions.sort((a, b) => a.s - b.s);
        let dg = 0;
        for (let i = 1; i < sessions.length; i++) {
          const gap = (sessions[i].s - sessions[i - 1].e) / 60000;
          if (gap > 0 && gap < 120) dg += gap;
        }
        if (dg > 0) { totalGap += dg; gapDays++; }
      }
      if (gapDays > 0) {
        const avgGap = totalGap / gapDays;
        if (avgGap > 30) {
          const monthlyH = (avgGap * 22) / 60;
          const impact = Math.round(monthlyH * precioMedio);
          ops.push({
            id: "OP-11", title: "Tiempo muerto entre citas",
            desc: `Tienes un promedio de ${Math.round(avgGap)} min muertos entre citas cada día`,
            potential: `${curr}${impact.toLocaleString("es-ES")}/mes recuperables`,
            impact, color: "#10B981", bg: "#ECFDF5",
            whyText: `El gap promedio entre citas es de ${Math.round(avgGap)} minutos diarios, ~${Math.round(monthlyH)} horas perdidas al mes. Servicios express de 15–20 min pueden llenar esos huecos.`,
            actionText: "Introduce servicios express (15–20 min) para rellenar los huecos entre citas largas: retoques de uñas, nail art puntual o extras rápidos. También puedes ofrecer esos slots a clientes de lista de espera.",
            actionButton: "Crear servicio express",
          });
        }
      }
    }
  }

  // ── OP-12: Servicio por debajo del precio de mercado ─────────────────────
  if (fieldMap["servicio"] && fieldMap["precio"]) {
    const benchmarks: Array<[RegExp, number, string]> = [
      [/manicura gel|gel manicura/i, 25, "Manicura Gel"],
      [/pedicura/i,                  30, "Pedicura"],
      [/corte/i,                     25, "Corte"],
      [/tinte/i,                     45, "Tinte"],
    ];
    let best12: { name: string; avg: number; bench: number; sessions: number; impact: number } | null = null;
    for (const [pat, bench, label] of benchmarks) {
      const m = nc.filter((r) => pat.test(r.servicio));
      if (!m.length) continue;
      const avg = m.reduce((s, r) => s + r.precio, 0) / m.length;
      if (avg < bench) {
        const impact = Math.round((bench - avg) * m.length);
        if (!best12 || impact > best12.impact) best12 = { name: label, avg: Math.round(avg), bench, sessions: m.length, impact };
      }
    }
    if (best12) {
      ops.push({
        id: "OP-12", title: "Servicio por debajo del precio de mercado",
        desc: `Tu servicio ${best12.name} está por debajo del precio de mercado`,
        potential: `+${curr}${best12.impact.toLocaleString("es-ES")}/mes ajustando precio`,
        impact: best12.impact, color: "#F59E0B", bg: "#FFFBEB",
        whyText: `Tu ${best12.name} tiene un precio medio de ${curr}${best12.avg}, por debajo del benchmark de mercado (${curr}${best12.bench}). Con ${best12.sessions} sesiones al mes, ajustar el precio podría generar +${curr}${best12.impact.toLocaleString("es-ES")}/mes sin perder clientes.`,
        actionText: `Ajusta el precio de ${best12.name} gradualmente hasta el precio de mercado. Una subida de ${curr}2–3 rara vez genera cancelaciones en clientes fidelizados si la comunicas con antelación.`,
        actionButton: "Ajustar precio",
      });
    }
  }

  // ── OP-13: Clientes que solo reservan con descuento ──────────────────────
  if (fieldMap["descuento"]) {
    const n = clients.filter((c) => c.visits >= 2 && c.discountVisits / c.visits > 0.6).length;
    if (n > 0) {
      const impact = Math.round(n * precioMedio * 0.2);
      ops.push({
        id: "OP-13", title: "Clientes que solo reservan con descuento",
        desc: `${n} clientes solo reservan cuando hay descuento`,
        potential: `${curr}${impact.toLocaleString("es-ES")}/mes de margen perdido`,
        impact, color: "#F59E0B", bg: "#FFFBEB",
        whyText: `${n} clientes usan código de descuento en más del 60% de sus visitas. Esto erosiona el margen de forma sistemática. Un bono o precio fijo preferencial mantiene la fidelidad sin sacrificar margen visita a visita.`,
        actionText: "Propón a estos clientes un bono mensual o precio de fidelidad fijo. Es mejor garantizarles un precio preferencial estable que depender de descuentos esporádicos que erosionan el margen.",
        actionButton: "Crear oferta fidelidad",
      });
    }
  }

  // ── OP-14: Servicio estrella con precio mejorable ────────────────────────
  if (fieldMap["servicio"] && fieldMap["precio"] && nc.length > 0) {
    const sMap = new Map<string, { s: number; r: number }>();
    for (const r of nc) {
      const e = sMap.get(r.servicio);
      sMap.set(r.servicio, { s: (e?.s ?? 0) + 1, r: (e?.r ?? 0) + r.precio });
    }
    const top14 = [...sMap.entries()].sort((a, b) => b[1].s - a[1].s)[0];
    if (top14) {
      const [name, data] = top14;
      const avg14   = data.r / data.s;
      const overall = nc.reduce((s, r) => s + r.precio, 0) / nc.length;
      if (avg14 < overall * 0.85) {
        const impact = Math.round((overall * 0.85 - avg14) * data.s);
        ops.push({
          id: "OP-14", title: "Servicio estrella con margen mejorable",
          desc: `Tu servicio más popular (${name}) tiene margen mejorable`,
          potential: `+${curr}${impact.toLocaleString("es-ES")}/mes ajustando precio`,
          impact, color: "#F59E0B", bg: "#FFFBEB",
          whyText: `${name} es tu servicio más demandado (${data.s} sesiones) pero su precio medio (${curr}${Math.round(avg14)}) está por debajo de la media del salón. Es el servicio con mayor palanca de precio.`,
          actionText: `Revisa el precio de ${name} y evalúa una subida gradual. Al ser tu servicio más popular, tienes margen para ajustar sin impacto significativo en la demanda.`,
          actionButton: "Revisar precio",
        });
      }
    }
  }

  // ── OP-15: Profesional con baja productividad ────────────────────────────
  if (fieldMap["profesional"]) {
    const proMap = new Map<string, number>();
    for (const r of nc) {
      if (!r.profesional) continue;
      proMap.set(r.profesional, (proMap.get(r.profesional) ?? 0) + 1);
    }
    if (proMap.size >= 2) {
      const total = [...proMap.values()].reduce((s, v) => s + v, 0);
      const avg15  = total / proMap.size;
      let worst15: { name: string; sessions: number } | null = null;
      for (const [name, sessions] of proMap) {
        if (sessions < avg15 * 0.5 && (!worst15 || sessions < worst15.sessions))
          worst15 = { name, sessions };
      }
      if (worst15) {
        const unused  = Math.round(avg15 - worst15.sessions);
        const impact  = Math.round(unused * precioMedio);
        const pct15   = Math.round(100 - (worst15.sessions / avg15) * 100);
        ops.push({
          id: "OP-15", title: "Profesional con capacidad sin usar",
          desc: `${worst15.name} tiene un ${pct15}% menos de citas que el resto del equipo`,
          potential: `${curr}${impact.toLocaleString("es-ES")}/mes de capacidad sin usar`,
          impact, color: "#0EA5E9", bg: "#F0F9FF",
          whyText: `${worst15.name} tiene ${worst15.sessions} citas frente a una media de ${Math.round(avg15)} del equipo. Optimizar su agenda recuperaría ~${curr}${impact.toLocaleString("es-ES")}/mes de capacidad instalada.`,
          actionText: `Revisa la distribución de citas de ${worst15.name} y asígnale los slots vacíos de los días flojos. También puedes asignarle los servicios con mayor tiempo de espera para equilibrar la carga del equipo.`,
          actionButton: "Optimizar agenda",
        });
      }
    }
  }

  return ops.sort((a, b) => b.impact - a.impact);
}

// ─── Normalise raw rows ─────────────────────────────────────────────────────────

/**
 * Convert raw file rows into normalised NRow[] using the column mapping.
 * This is the same logic that was previously inline inside processData().
 * Throws descriptive errors when no valid rows can be produced.
 */
export function normalizeRows(
  rows: RawRow[],
  fieldMap: Record<string, string>,
): NRow[] {
  const get = (row: RawRow, field: string): string =>
    fieldMap[field] ? String(row[fieldMap[field]] ?? "").trim() : "";

  const horaInicioCol = fieldMap["hora_inicio"] ?? null;
  const horaFinCol    = fieldMap["hora_fin"] ?? null;
  const inferDuration = !fieldMap["duracion"] && !!horaInicioCol && !!horaFinCol;
  if (inferDuration) {
    console.info(
      `[normalizeRows] Duración inferida de "${horaInicioCol}" - "${horaFinCol}" (no hay columna duracion directa)`,
    );
  }

  const fechaCol = fieldMap["fecha"] || horaInicioCol || null;
  if (!fieldMap["fecha"] && horaInicioCol) {
    console.info(
      `[normalizeRows] No hay columna 'fecha' explícita, usando '${horaInicioCol}' como fuente de fecha (datetime).`,
    );
  }

  const sampleDates = rows.slice(0, 3).map((r) => ({
    raw: fechaCol ? r[fechaCol] : undefined,
    type: fechaCol ? typeof r[fechaCol] : "n/a",
    parsed: fechaCol ? parseExcelDate(r[fechaCol] as unknown)?.toLocaleDateString("es-ES") : null,
  }));
  console.log("[parseExcelDate sample]", sampleDates);

  let sinFecha = 0;
  let sinPrecio = 0;
  let sinAmbos = 0;

  const normalized: NRow[] = rows
    .map((row) => {
      const rawFecha = fechaCol ? (row[fechaCol] as unknown) : null;
      const fecha    = parseExcelDate(rawFecha);
      const precio   = parsePrice(get(row, "precio"));
      const durStr   = get(row, "duracion");
      const estado   = get(row, "estado").toLowerCase();
      const cancelada =
        estado.includes("cancel") ||
        estado.includes("no show") ||
        estado.includes("noshow") ||
        estado.includes("no-show") ||
        estado.includes("baja") ||
        estado.includes("rechaz");
      const descuentoVal = get(row, "descuento").trim();
      const tieneDescuento = descuentoVal !== "" && descuentoVal !== "0" && descuentoVal.toLowerCase() !== "no";

      if (fecha === null && precio <= 0) sinAmbos++;
      else if (fecha === null) sinFecha++;
      else if (precio <= 0) sinPrecio++;

      let duracion = 0;
      if (durStr) {
        duracion = parseDuration(durStr);
      } else if (inferDuration) {
        const rawStart = horaInicioCol ? (row[horaInicioCol] as unknown) : null;
        const rawEnd   = horaFinCol    ? (row[horaFinCol]   as unknown) : null;
        const tStart = parseTimeMinutes(rawStart);
        const tEnd   = parseTimeMinutes(rawEnd);
        if (tStart !== null && tEnd !== null && tEnd > tStart) {
          duracion = tEnd - tStart;
        }
      }

      // ── Client: name, email, phone ────────────────────────────────────────
      const rawCliente = get(row, "cliente");

      let clientEmail: string | null = null;
      if (fieldMap["email"]) {
        const colVal = String(row[fieldMap["email"]] ?? "").trim();
        if (colVal) clientEmail = colVal;
      }
      if (!clientEmail) clientEmail = extractEmail(rawCliente);

      let clientPhone: string | null = null;
      if (fieldMap["telefono"]) {
        const colVal = String(row[fieldMap["telefono"]] ?? "").trim();
        if (colVal) clientPhone = extractPhone(colVal) ?? colVal;
      }
      if (!clientPhone) clientPhone = extractPhone(rawCliente);

      const clientName = cleanClientName(rawCliente);
      // Detect walk-in: any row whose (cleaned) client name is "Cliente sin ficha".
      // The Booksy parser already normalises "Sin cita previa" → "Cliente sin ficha".
      const isWalkIn = clientName.toLowerCase() === "cliente sin ficha";

      const cliente = { name: clientName, email: clientEmail, phone: clientPhone };

      // ── categoria ─────────────────────────────────────────────────────────
      const categoria = get(row, "categoria") || null;

      const startMin = parseClock(rawFecha) ?? (horaInicioCol ? parseTimeMinutes(row[horaInicioCol] as unknown) : null);

      return {
        fecha,
        cliente,
        servicio: get(row, "servicio") || "Otros",
        precio,
        duracion,
        cancelada,
        tieneDescuento,
        profesional: get(row, "profesional"),
        categoria,
        isWalkIn,
        startMin,
      };
    })
    .filter((r): r is NRow => r.fecha !== null && r.precio > 0);

  if (normalized.length === 0) {
    const totalDescartadas = sinFecha + sinPrecio + sinAmbos;
    const soloFecha  = sinFecha + sinAmbos === totalDescartadas && sinPrecio === 0;
    const soloPrecio = sinPrecio + sinAmbos === totalDescartadas && sinFecha === 0;
    if (soloFecha) {
      throw new Error(
        "No hemos podido detectar la fecha de las citas en tu archivo. Asegúrate de que tienes una columna con la fecha o el datetime de cada cita.",
      );
    } else if (soloPrecio) {
      throw new Error(
        "No hemos podido detectar precios válidos en tu archivo. Asegúrate de que tienes una columna con el importe de cada cita.",
      );
    } else {
      throw new Error(
        `Se descartaron ${totalDescartadas} filas: ${sinFecha + sinAmbos} sin fecha válida, ${sinPrecio + sinAmbos} sin precio válido. Revisa el mapeo de columnas.`,
      );
    }
  }

  return normalized;
}

// ─── Main processor ─────────────────────────────────────────────────────────────

export function processData(
  rows: RawRow[],
  mappings: Record<string, string>,
  platform?: string | null,
  currencySymbol?: string,
): DashData;
export function processData(
  normalizedRows: NRow[],
  mappings?: null,
  platform?: string | null,
  currencySymbol?: string,
): DashData;
export function processData(
  input: RawRow[] | NRow[],
  mappings?: Record<string, string> | null,
  platform?: string | null,
  currencySymbol?: string,
): DashData {
  let normalized: NRow[];
  let fieldMap: Record<string, string>;

  if (mappings) {
    // ── Path 1: raw file rows + column mappings (existing behaviour) ──
    fieldMap = {};
    for (const [col, field] of Object.entries(mappings)) {
      if (field) fieldMap[field] = col;
    }

    console.info(
      "[processData] fieldMap:",
      Object.entries(fieldMap).map(([f, col]) => `${f} → "${col}"`),
    );

    normalized = normalizeRows(input as RawRow[], fieldMap);
  } else {
    // ── Path 2: pre-normalised NRow[] (e.g. from API) ──
    normalized = input as NRow[];
    if (normalized.length === 0) {
      throw new Error("No se han proporcionado filas normalizadas.");
    }
    // Synthetic fieldMap: all known fields are "present" so opportunity
    // guards (fieldMap["servicio"], etc.) pass through.
    fieldMap = {
      fecha: "_", servicio: "_", precio: "_", duracion: "_",
      profesional: "_", cliente: "_", estado: "_", descuento: "_",
      categoria: "_", email: "_", telefono: "_",
    };
  }

  normalized.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

  const latest   = normalized[normalized.length - 1].fecha;
  const curMonth = latest.getMonth();
  const curYear  = latest.getFullYear();
  const prevMonth = curMonth === 0 ? 11 : curMonth - 1;
  const prevYear  = curMonth === 0 ? curYear - 1 : curYear;

  const isCur  = (r: NRow) => !r.cancelada && r.fecha.getMonth() === curMonth && r.fecha.getFullYear() === curYear;
  const isPrev = (r: NRow) => !r.cancelada && r.fecha.getMonth() === prevMonth && r.fecha.getFullYear() === prevYear;

  const cur  = normalized.filter(isCur);
  const prev = normalized.filter(isPrev);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const facturacion = Math.round(cur.reduce((s, r) => s + r.precio, 0));
  const facturacionAnterior = prev.length > 0
    ? Math.round(prev.reduce((s, r) => s + r.precio, 0))
    : null;
  const changePercent = facturacionAnterior
    ? Math.round(((facturacion - facturacionAnterior) / facturacionAnterior) * 100)
    : null;

  const withDur = cur.filter((r) => r.duracion > 0);
  const precioMedioHora = withDur.length > 0
    ? Math.round(withDur.reduce((s, r) => s + (r.precio / r.duracion) * 60, 0) / withDur.length)
    : null;

  // Clients unique — walk-ins excluded
  const curClients = new Set(
    cur.filter((r) => !r.isWalkIn).map((r) => r.cliente.name.toLowerCase()).filter(Boolean)
  );
  const prevAllClients = new Set(
    normalized
      .filter((r) => r.fecha < new Date(curYear, curMonth, 1) && !r.isWalkIn)
      .map((r) => r.cliente.name.toLowerCase())
      .filter(Boolean)
  );
  const recurrentes = [...curClients].filter((c) => prevAllClients.has(c)).length;
  const retencion = curClients.size > 0
    ? Math.round((recurrentes / curClients.size) * 100)
    : 0;

  const profesionalesActivos = new Set(cur.map((r) => r.profesional?.trim()).filter(Boolean));
  const nProf = Math.max(profesionalesActivos.size, 1);
  const diasOperados = new Set(cur.map((r) => r.fecha.toDateString())).size || 1;
  // Jornada deducida del propio archivo: ventana entre primera y última cita
  const startsMin = cur.map((r) => r.startMin).filter((x): x is number => x != null);
  const endsMin = cur.filter((r) => r.startMin != null && r.duracion > 0).map((r) => (r.startMin as number) + r.duracion);
  const jornadaMin = startsMin.length > 0 && endsMin.length > 0
    ? Math.max(60, Math.max(...endsMin) - Math.min(...startsMin))
    : 8 * 60;
  const minutosReservados = cur.reduce((s, r) => s + r.duracion, 0);
  const capacidadMin = nProf * jornadaMin * diasOperados;
  const ocupacion = capacidadMin > 0 ? Math.min(Math.round((minutosReservados / capacidadMin) * 100), 100) : 0;

  // Ocupación por franja clave (para la alerta de huecos). Constantes configurables.
  const FRANJA_INICIO = 17 * 60;
  const FRANJA_FIN = 19 * 60;
  const minutosFranja = cur.reduce((s, r) => {
    if (r.startMin == null || r.duracion <= 0) return s;
    const ini = Math.max(r.startMin, FRANJA_INICIO);
    const fin = Math.min(r.startMin + r.duracion, FRANJA_FIN);
    return s + Math.max(0, fin - ini);
  }, 0);
  const capacidadFranja = nProf * (FRANJA_FIN - FRANJA_INICIO) * diasOperados;
  const ocupacionFranja = capacidadFranja > 0 ? Math.min(Math.round((minutosFranja / capacidadFranja) * 100), 100) : 0;

  // ── Walk-in percentage (over non-cancelled current-month citas) ───────────
  const walkInCount   = cur.filter((r) => r.isWalkIn).length;
  const walkInPercent = cur.length > 0 ? Math.round((walkInCount / cur.length) * 100) : 0;

  // ── Services ──────────────────────────────────────────────────────────────
  const svcMap = new Map<string, { sessions: number; revenue: number; durSum: number; durCount: number }>();
  for (const r of cur) {
    const key = r.servicio;
    const e   = svcMap.get(key) ?? { sessions: 0, revenue: 0, durSum: 0, durCount: 0 };
    e.sessions++;
    e.revenue += r.precio;
    if (r.duracion > 0) { e.durSum += r.duracion; e.durCount++; }
    svcMap.set(key, e);
  }
  // Calcular €/hora media del salón (misma fórmula que computeAlerts)
  const totalSvcRevenue  = [...svcMap.values()].reduce((s, d) => s + d.revenue, 0);
  const totalSvcMinutes  = [...svcMap.values()].reduce((s, d) => s + (d.durCount > 0 ? d.durSum : d.sessions * 60), 0);
  const avgEuroPerHour   = totalSvcMinutes > 0 ? Math.round((totalSvcRevenue / totalSvcMinutes) * 60) : null;

  const services: ServiceStat[] = [...svcMap.entries()]
    .map(([name, d]) => {
      const avgDuration = d.durCount > 0 ? d.durSum / d.durCount : null;
      const euroPerHour = avgDuration !== null ? Math.round((d.revenue / d.sessions / avgDuration) * 60) : null;
      let efficiency: ServiceStat["efficiency"] = "unknown";
      if (euroPerHour !== null && avgEuroPerHour !== null) {
        if (euroPerHour >= avgEuroPerHour) efficiency = "high";
        else if (euroPerHour >= avgEuroPerHour * 0.85) efficiency = "medium";
        else efficiency = "low";
      }
      return {
        name,
        sessions: d.sessions,
        avg: Math.round(d.revenue / d.sessions),
        revenue: Math.round(d.revenue),
        duration: d.durCount > 0 ? Math.round(d.durSum / d.durCount) : 60,
        euroPerHour,
        efficiency,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  // ── Services insight ─────────────────────────────────────────────────────
  let servicesInsight: DashData["servicesInsight"] = null;
  if (services.length > 0) {
    const lowCount     = services.filter((s) => s.efficiency === "low").length;
    const unknownCount = services.filter((s) => s.efficiency === "unknown").length;
    const known        = services.filter((s) => s.efficiency !== "unknown" && s.euroPerHour !== null);
    const best         = known.length > 0 ? known.reduce((a, b) => (b.euroPerHour! > a.euroPerHour! ? b : a)) : null;

    if (unknownCount >= services.length / 2) {
      servicesInsight = { message: "Añade la duración de tus servicios para análisis de rentabilidad por hora.", tone: "neutral" };
    } else if (lowCount >= 3) {
      servicesInsight = { message: `Tienes ${lowCount} servicios con €/hora por debajo de la media. Revisa precios o tiempos de ejecución.`, tone: "negative" };
    } else if (lowCount >= 1) {
      servicesInsight = { message: `${lowCount} ${lowCount === 1 ? "servicio tiene" : "servicios tienen"} €/hora bajo. Revisa si el precio compensa el tiempo invertido.`, tone: "negative" };
    } else if (known.length > 0 && known.every((s) => s.efficiency === "high")) {
      servicesInsight = { message: "Excelente. Todos tus servicios están por encima de la media €/hora.", tone: "positive" };
    } else if (best) {
      servicesInsight = { message: `Tu cartera de servicios está equilibrada. Tu servicio más eficiente es ${best.name} (${best.euroPerHour}€/h).`, tone: "positive" };
    }
  }

  // ── Cancellation rate ─────────────────────────────────────────────────────
  const curMonthAll       = normalized.filter((r) => r.fecha.getMonth() === curMonth && r.fecha.getFullYear() === curYear);
  const curMonthCancelled = curMonthAll.filter((r) => r.cancelada).length;
  const tasaCancelacion   = curMonthAll.length > 0
    ? Math.round((curMonthCancelled / curMonthAll.length) * 100)
    : 0;

  // ── Discount frequency per client — walk-ins excluded ────────────────────
  const clientDiscountMap = new Map<string, { total: number; withDiscount: number }>();
  for (const r of normalized.filter((r) => !r.cancelada && !r.isWalkIn && r.cliente.name)) {
    const key = r.cliente.name.toLowerCase();
    const e   = clientDiscountMap.get(key) ?? { total: 0, withDiscount: 0 };
    e.total++;
    if (r.tieneDescuento) e.withDiscount++;
    clientDiscountMap.set(key, e);
  }
  const discountFrecuenteSet = new Set<string>(
    [...clientDiscountMap.entries()]
      .filter(([, d]) => d.total > 0 && d.withDiscount / d.total > 0.5)
      .map(([key]) => key)
  );

  // ── At-risk clients — walk-ins excluded ───────────────────────────────────
  const clientInfo = new Map<string, { lastDate: Date; lastService: string; ltv: number; email: string | null; phone: string | null }>();
  for (const r of normalized.filter((r) => !r.cancelada && !r.isWalkIn)) {
    const key  = r.cliente.name.toLowerCase();
    const e    = clientInfo.get(key);
    const ltv  = (e?.ltv  ?? 0) + r.precio;
    const email = r.cliente.email ?? e?.email ?? null;
    const phone = r.cliente.phone ?? e?.phone ?? null;
    if (!e || r.fecha > e.lastDate) {
      clientInfo.set(key, { lastDate: r.fecha, lastService: r.servicio, ltv, email, phone });
    } else {
      clientInfo.set(key, { ...e, ltv, email, phone });
    }
  }
  const now = new Date();
  const atRiskClients: AtRiskClient[] = [...clientInfo.entries()]
    .map(([rawName, d]) => {
      const name = rawName.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const days = Math.round((now.getTime() - d.lastDate.getTime()) / 86400000);
      return {
        name,
        email: d.email,
        phone: d.phone,
        days,
        ltv: Math.round(d.ltv),
        risk: days >= 60 ? "alto" : "medio" as "alto" | "medio",
        lastService: d.lastService,
        avatar: initials(name),
        descuentoFrecuente: discountFrecuenteSet.has(rawName),
      };
    })
    .filter((c) => c.days >= 45)
    .sort((a, b) => b.days - a.days)
    .slice(0, 12);

  // ── Cancellations this week ───────────────────────────────────────────────
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const cancelacionesSemana = normalized.filter((r) => r.cancelada && r.fecha >= weekAgo).length;

  // ── Period label ──────────────────────────────────────────────────────────
  const MONTHS       = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const period = `${MONTHS[curMonth]} ${curYear}`;

  // ── Monthly revenue ───────────────────────────────────────────────────────
  const monthRevenueMap = new Map<string, number>();
  for (const r of normalized.filter((r) => !r.cancelada)) {
    const key = `${r.fecha.getFullYear()}-${String(r.fecha.getMonth() + 1).padStart(2, "0")}`;
    monthRevenueMap.set(key, (monthRevenueMap.get(key) ?? 0) + r.precio);
  }

  const endDate = latest;
  const last6Keys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
    last6Keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  console.log("[endDate calculado]", `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`);
  console.log("[last6Keys]", last6Keys);
  console.log("[monthRevenueMap all keys]", [...monthRevenueMap.keys()].sort());

  const lastKeyWithData = [...last6Keys].reverse().find((k) => (monthRevenueMap.get(k) ?? 0) > 0);

  const monthlyRevenue = last6Keys.map((key) => {
    const m     = parseInt(key.split("-")[1], 10);
    const label = key === lastKeyWithData ? "Actual" : MONTHS_SHORT[m - 1];
    return { month: label, value: Math.round(monthRevenueMap.get(key) ?? 0) };
  });

  // ── Revenue goal (auto-calculated) ───────────────────────────────────────
  const revenueGoal: DashData["revenueGoal"] = (() => {
    const roundTo100 = (n: number) => Math.round(n / 100) * 100;
    const currentIdx = monthlyRevenue.findIndex((m) => m.month === "Actual");
    const idxCurrent = currentIdx !== -1 ? currentIdx : monthlyRevenue.length - 1;
    const current = monthlyRevenue[idxCurrent];
    const historicals = monthlyRevenue.filter((_, i) => i !== idxCurrent).filter((m) => m.value > 0);

    if (historicals.length >= 1) {
      const best = Math.max(...historicals.map((m) => m.value));
      return { value: roundTo100(best * 1.1), source: "auto-best-historical" };
    }
    if (current && current.value > 0) {
      return { value: roundTo100(current.value * 1.2), source: "auto-single-month" };
    }
    return null;
  })();

  // ── New clients per month — walk-ins excluded ─────────────────────────────
  const clientFirstMonth = new Map<string, string>();
  for (const r of normalized.filter((r) => !r.cancelada && !r.isWalkIn && r.cliente.name)) {
    const key      = r.cliente.name.toLowerCase();
    const monthKey = `${r.fecha.getFullYear()}-${String(r.fecha.getMonth() + 1).padStart(2, "0")}`;
    const existing = clientFirstMonth.get(key);
    if (!existing || monthKey < existing) clientFirstMonth.set(key, monthKey);
  }
  const newByMonth = new Map<string, number>();
  for (const monthKey of clientFirstMonth.values()) {
    newByMonth.set(monthKey, (newByMonth.get(monthKey) ?? 0) + 1);
  }
  const newClientsPerMonth = last6Keys.map((key) => {
    const m     = parseInt(key.split("-")[1], 10);
    const label = key === lastKeyWithData ? "Actual" : MONTHS_SHORT[m - 1];
    return { month: label, value: newByMonth.get(key) ?? 0 };
  });

  // ── Top clients — walk-ins excluded ──────────────────────────────────────
  const clientVisits = new Map<string, number>();
  for (const r of normalized.filter((r) => !r.cancelada && !r.isWalkIn && r.cliente.name)) {
    const key = r.cliente.name.toLowerCase();
    clientVisits.set(key, (clientVisits.get(key) ?? 0) + 1);
  }
  const topClients = [...clientInfo.entries()]
    .map(([rawName, d]) => {
      const name = rawName.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      return {
        name,
        email: d.email,
        phone: d.phone,
        visits: clientVisits.get(rawName) ?? 0,
        total: Math.round(d.ltv),
        lastService: d.lastService,
        avatar: initials(name),
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  const precioMedio = precioMedioHora ?? Math.round(facturacion / Math.max(cur.length, 1));

  // ── Professional stats ────────────────────────────────────────────────────
  const profMap = new Map<string, { revenue: number; sessions: number; minutes: number; services: Map<string, number> }>();
  for (const r of cur) {
    const prof = r.profesional?.trim();
    if (!prof) continue;
    const entry = profMap.get(prof) ?? { revenue: 0, sessions: 0, minutes: 0, services: new Map() };
    entry.revenue += r.precio;
    entry.sessions += 1;
    entry.minutes += r.duracion;
    entry.services.set(r.servicio, (entry.services.get(r.servicio) ?? 0) + 1);
    profMap.set(prof, entry);
  }
  const professionalStats: ProfessionalStat[] = [...profMap.entries()]
    .map(([name, d]) => {
      const hoursWorked = Math.round((d.minutes / 60) * 100) / 100;
      const topEntry = [...d.services.entries()].sort((a, b) => b[1] - a[1])[0];
      return {
        name,
        revenue: Math.round(d.revenue),
        sessions: d.sessions,
        avgPrice: Math.round(d.revenue / d.sessions),
        hoursWorked,
        euroPerHour: hoursWorked > 0 ? Math.round(d.revenue / hoursWorked) : null,
        topService: topEntry?.[0] ?? "-",
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const allOpportunities = computeOpportunities(normalized, fieldMap, precioMedio, now, currencySymbol ?? "€");

  return {
    hasRealData: true,
    period,
    platform: platform ?? null,
    kpis: {
      facturacion,
      facturacionAnterior,
      changePercent,
      precioMedioHora,
      ocupacion,
      totalRegistros: cur.length,
      clientesUnicos: curClients.size,
      retencion,
      tasaCancelacion,
      numServiciosTotal: svcMap.size,
      numOportunidadesTotal: allOpportunities.length,
    },
    services,
    servicesInsight,
    atRiskClients,
    topClients,
    monthlyRevenue,
    revenueGoal,
    newClientsPerMonth,
    opportunities: allOpportunities.slice(0, 4),
    professionalStats,
    metrics: {
      ocupacion,
      ocupacionFranja,
      retencion,
      cancelacionesSemana,
      precioMedio,
      facturacion,
      walkInPercent,
    },
  };
}
