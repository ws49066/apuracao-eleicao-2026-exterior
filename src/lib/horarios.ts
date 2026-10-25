import { LOCALIDADES, paisPorIso } from "./locais";
import type { Turno } from "./tse/config";

/** A votação no exterior vai das 8h às 17h, horário local de cada seção. */
const ABERTURA = 8;
const FECHAMENTO = 17;

export const DATA_ELEICAO: Record<Turno, string> = { "1": "2026-10-04", "2": "2026-10-25" };

const FUSO_PAIS: Record<string, string> = {
  AE: "Asia/Dubai", AG: "America/Antigua", AL: "Europe/Tirane", AM: "Asia/Yerevan", AO: "Africa/Luanda",
  AR: "America/Argentina/Buenos_Aires", AT: "Europe/Vienna", AU: "Australia/Sydney", AZ: "Asia/Baku",
  BA: "Europe/Sarajevo", BB: "America/Barbados", BD: "Asia/Dhaka", BE: "Europe/Brussels", BF: "Africa/Ouagadougou",
  BG: "Europe/Sofia", BH: "Asia/Bahrain", BJ: "Africa/Porto-Novo", BO: "America/La_Paz", BS: "America/Nassau",
  BW: "Africa/Gaborone", BZ: "America/Belize", CA: "America/Toronto", CD: "Africa/Kinshasa", CG: "Africa/Brazzaville",
  CH: "Europe/Zurich", CI: "Africa/Abidjan", CL: "America/Santiago", CM: "Africa/Douala", CN: "Asia/Shanghai",
  CO: "America/Bogota", CR: "America/Costa_Rica", CU: "America/Havana", CV: "Atlantic/Cape_Verde",
  CY: "Asia/Nicosia", CZ: "Europe/Prague", DE: "Europe/Berlin", DK: "Europe/Copenhagen", DO: "America/Santo_Domingo",
  DZ: "Africa/Algiers", EC: "America/Guayaquil", EE: "Europe/Tallinn", EG: "Africa/Cairo", ES: "Europe/Madrid",
  ET: "Africa/Addis_Ababa", FI: "Europe/Helsinki", FR: "Europe/Paris", GA: "Africa/Libreville", GB: "Europe/London",
  GE: "Asia/Tbilisi", GF: "America/Cayenne", GH: "Africa/Accra", GN: "Africa/Conakry", GQ: "Africa/Malabo",
  GR: "Europe/Athens", GT: "America/Guatemala", GW: "Africa/Bissau", GY: "America/Guyana", HK: "Asia/Hong_Kong",
  HN: "America/Tegucigalpa", HR: "Europe/Zagreb", HT: "America/Port-au-Prince", HU: "Europe/Budapest",
  ID: "Asia/Jakarta", IE: "Europe/Dublin", IL: "Asia/Jerusalem", IN: "Asia/Kolkata", IQ: "Asia/Baghdad",
  IR: "Asia/Tehran", IT: "Europe/Rome", JM: "America/Jamaica", JO: "Asia/Amman", JP: "Asia/Tokyo",
  KE: "Africa/Nairobi", KP: "Asia/Pyongyang", KR: "Asia/Seoul", KW: "Asia/Kuwait", KZ: "Asia/Almaty",
  LB: "Asia/Beirut", LC: "America/St_Lucia", LK: "Asia/Colombo", LY: "Africa/Tripoli", MA: "Africa/Casablanca",
  ML: "Africa/Bamako", MM: "Asia/Yangon", MW: "Africa/Blantyre", MX: "America/Mexico_City", MY: "Asia/Kuala_Lumpur",
  MZ: "Africa/Maputo", NA: "Africa/Windhoek", NG: "Africa/Lagos", NI: "America/Managua", NL: "Europe/Amsterdam",
  NO: "Europe/Oslo", NP: "Asia/Kathmandu", NZ: "Pacific/Auckland", OM: "Asia/Muscat", PA: "America/Panama",
  PE: "America/Lima", PH: "Asia/Manila", PK: "Asia/Karachi", PL: "Europe/Warsaw", PS: "Asia/Hebron",
  PT: "Europe/Lisbon", PY: "America/Asuncion", QA: "Asia/Qatar", RO: "Europe/Bucharest", RS: "Europe/Belgrade",
  RU: "Europe/Moscow", SA: "Asia/Riyadh", SE: "Europe/Stockholm", SG: "Asia/Singapore", SI: "Europe/Ljubljana",
  SK: "Europe/Bratislava", SN: "Africa/Dakar", SR: "America/Paramaribo", ST: "Africa/Sao_Tome",
  SV: "America/El_Salvador", SY: "Asia/Damascus", TG: "Africa/Lome", TH: "Asia/Bangkok", TL: "Asia/Dili",
  TN: "Africa/Tunis", TR: "Europe/Istanbul", TT: "America/Port_of_Spain", TW: "Asia/Taipei", TZ: "Africa/Dar_es_Salaam",
  UA: "Europe/Kyiv", US: "America/New_York", UY: "America/Montevideo", VE: "America/Caracas", VN: "Asia/Ho_Chi_Minh",
  ZA: "Africa/Johannesburg", ZM: "Africa/Lusaka", ZW: "Africa/Harare",
};

/** Países com mais de um fuso: o fuso da cidade prevalece. */
const FUSO_CIDADE: Record<string, string> = {
  "29513": "America/Chicago", // Chicago
  "29807": "America/Chicago", // Houston
  "29980": "America/Los_Angeles", // Los Angeles
  "30503": "America/Los_Angeles", // São Francisco
  "39063": "America/Vancouver", // Vancouver
};

export type EstadoVotacao = "aguardando" | "votando" | "encerrada";

export interface StatusPais {
  iso: string;
  estado: EstadoVotacao;
  abre: Date;
  primeiroFechamento: Date;
  ultimoFechamento: Date;
}

function deslocamentoMin(fuso: string, instante: Date): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: fuso,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(instante)
      .map((x) => [x.type, x.value]),
  );
  const local = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((local - instante.getTime()) / 60_000);
}

/** Instante UTC em que o relógio de `fuso` marca `hora`h no dia `data` (AAAA-MM-DD). */
function instanteLocal(fuso: string, data: string, hora: number): Date {
  const [a, m, d] = data.split("-").map(Number);
  const palpite = Date.UTC(a, m - 1, d, hora);
  const primeiro = deslocamentoMin(fuso, new Date(palpite));
  let t = palpite - primeiro * 60_000;
  const segundo = deslocamentoMin(fuso, new Date(t));
  if (segundo !== primeiro) t = palpite - segundo * 60_000;
  return new Date(t);
}

const cache = new Map<string, Omit<StatusPais, "estado">>();

function janela(iso: string, turno: Turno) {
  const chave = `${turno}:${iso}`;
  const guardado = cache.get(chave);
  if (guardado) return guardado;

  const data = DATA_ELEICAO[turno];
  const locais = LOCALIDADES.filter((l) => l.iso === iso);
  const abre: number[] = [];
  const fecha: number[] = [];
  for (const l of locais) {
    const fuso = FUSO_CIDADE[l.codigo] ?? FUSO_PAIS[iso];
    if (!fuso) continue;
    abre.push(instanteLocal(fuso, data, ABERTURA).getTime());
    fecha.push(instanteLocal(fuso, data, FECHAMENTO).getTime());
  }
  const resultado = {
    iso,
    abre: new Date(Math.min(...abre)),
    primeiroFechamento: new Date(Math.min(...fecha)),
    ultimoFechamento: new Date(Math.max(...fecha)),
  };
  cache.set(chave, resultado);
  return resultado;
}

export function statusPais(iso: string, turno: Turno, agora: Date): StatusPais {
  const j = janela(iso, turno);
  const estado: EstadoVotacao =
    agora >= j.ultimoFechamento ? "encerrada" : agora >= j.abre ? "votando" : "aguardando";
  return { ...j, estado };
}

export function statusTodos(turno: Turno, agora: Date): StatusPais[] {
  return [...new Set(LOCALIDADES.map((l) => l.iso))]
    .filter((iso) => paisPorIso(iso))
    .map((iso) => statusPais(iso, turno, agora));
}

const FORMATO_HORA = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
});
const FORMATO_DIA = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  weekday: "short",
});

/** "21:00" em horário de Brasília; acrescenta o dia da semana quando não é hoje. */
export function horaBrasilia(d: Date, referencia: Date): string {
  const hora = FORMATO_HORA.format(d);
  const mesmoDia = FORMATO_DIA.format(d) === FORMATO_DIA.format(referencia);
  return mesmoDia ? hora : `${hora} (${FORMATO_DIA.format(d).replace(".", "")})`;
}

/** "2h13" ou "45min". */
export function faltam(alvo: Date, agora: Date): string {
  const min = Math.max(0, Math.round((alvo.getTime() - agora.getTime()) / 60_000));
  const h = Math.floor(min / 60);
  return h > 0 ? `${h}h${String(min % 60).padStart(2, "0")}` : `${min}min`;
}
