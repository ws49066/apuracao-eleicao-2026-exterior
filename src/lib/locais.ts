/**
 * O TSE publica o exterior como a UF "zz", onde cada "município" é na verdade
 * uma cidade que abriga seções eleitorais (normalmente a sede de um consulado
 * ou embaixada). O TSE não informa a qual país cada cidade pertence, então o
 * vínculo cidade → país é mantido aqui.
 */

export type Continente =
  | "América do Sul"
  | "América do Norte"
  | "América Central e Caribe"
  | "Europa"
  | "África"
  | "Ásia"
  | "Oceania";

export interface Localidade {
  codigo: string;
  cidade: string;
  pais: string;
  iso: string;
  continente: Continente;
}

type Linha = [codigo: string, cidade: string, pais: string, iso: string, continente: Continente];

const LINHAS: Linha[] = [
  ["29254", "Abidjã", "Costa do Marfim", "CI", "África"],
  ["29262", "Abu Dhabi", "Emirados Árabes Unidos", "AE", "Ásia"],
  ["99198", "Abuja", "Nigéria", "NG", "África"],
  ["29270", "Accra", "Gana", "GH", "África"],
  ["99325", "Adis Abeba", "Etiópia", "ET", "África"],
  ["30457", "Amsterdã", "Países Baixos", "NL", "Europa"],
  ["29289", "Amã", "Jordânia", "JO", "Ásia"],
  ["29297", "Ancara", "Turquia", "TR", "Ásia"],
  ["29300", "Argel", "Argélia", "DZ", "África"],
  ["29319", "Artigas", "Uruguai", "UY", "América do Sul"],
  ["29327", "Assunção", "Paraguai", "PY", "América do Sul"],
  ["39241", "Astana", "Cazaquistão", "KZ", "Ásia"],
  ["29335", "Atenas", "Grécia", "GR", "Europa"],
  ["39080", "Atlanta", "Estados Unidos", "US", "América do Norte"],
  ["99171", "Bagdá", "Iraque", "IQ", "Ásia"],
  ["39128", "Baku", "Azerbaijão", "AZ", "Ásia"],
  ["99350", "Bamako", "Mali", "ML", "África"],
  ["29343", "Bangkok", "Tailândia", "TH", "Ásia"],
  ["29351", "Barcelona", "Espanha", "ES", "Europa"],
  ["99473", "Barein", "Barein", "BH", "Ásia"],
  ["29360", "Beirute", "Líbano", "LB", "Ásia"],
  ["29378", "Belgrado", "Sérvia", "RS", "Europa"],
  ["38881", "Belmopan", "Belize", "BZ", "América Central e Caribe"],
  ["29386", "Berlim", "Alemanha", "DE", "Europa"],
  ["29394", "Bissau", "Guiné-Bissau", "GW", "África"],
  ["29408", "Bogotá", "Colômbia", "CO", "América do Sul"],
  ["29416", "Boston", "Estados Unidos", "US", "América do Norte"],
  ["39209", "Bratislava", "Eslováquia", "SK", "Europa"],
  ["39187", "Brazzaville", "República do Congo", "CG", "África"],
  ["29424", "Bridgetown", "Barbados", "BB", "América Central e Caribe"],
  ["29432", "Bruxelas", "Bélgica", "BE", "Europa"],
  ["29440", "Bucareste", "Romênia", "RO", "Europa"],
  ["29459", "Budapeste", "Hungria", "HU", "Europa"],
  ["29467", "Buenos Aires", "Argentina", "AR", "América do Sul"],
  ["29475", "Caiena", "Guiana Francesa", "GF", "América do Sul"],
  ["29483", "Cairo", "Egito", "EG", "África"],
  ["29491", "Camberra", "Austrália", "AU", "Oceania"],
  ["30651", "Cantão", "China", "CN", "Ásia"],
  ["29505", "Caracas", "Venezuela", "VE", "América do Sul"],
  ["99384", "Castries", "Santa Lúcia", "LC", "América Central e Caribe"],
  ["29513", "Chicago", "Estados Unidos", "US", "América do Norte"],
  ["29521", "Chuy", "Uruguai", "UY", "América do Sul"],
  ["29530", "Cidade do Cabo", "África do Sul", "ZA", "África"],
  ["29556", "Ciudad del Este", "Paraguai", "PY", "América do Sul"],
  ["29564", "Ciudad Guayana", "Venezuela", "VE", "América do Sul"],
  ["99210", "Cobija", "Bolívia", "BO", "América do Sul"],
  ["29572", "Cochabamba", "Bolívia", "BO", "América do Sul"],
  ["30929", "Colombo", "Sri Lanka", "LK", "Ásia"],
  ["38903", "Conacri", "Guiné", "GN", "África"],
  ["29580", "Concepción", "Paraguai", "PY", "América do Sul"],
  ["29599", "Copenhague", "Dinamarca", "DK", "Europa"],
  ["38920", "Cotonou", "Benim", "BJ", "África"],
  ["29602", "Córdoba", "Argentina", "AR", "América do Sul"],
  ["29610", "Dacar", "Senegal", "SN", "África"],
  ["29629", "Daca", "Bangladesh", "BD", "Ásia"],
  ["29637", "Damasco", "Síria", "SY", "Ásia"],
  ["38962", "Dar es Salaam", "Tanzânia", "TZ", "África"],
  ["29653", "Doha", "Catar", "QA", "Ásia"],
  ["29661", "Dublin", "Irlanda", "IE", "Europa"],
  ["29645", "Díli", "Timor-Leste", "TL", "Ásia"],
  ["99503", "Edimburgo", "Reino Unido", "GB", "Europa"],
  ["29670", "Encarnación", "Paraguai", "PY", "América do Sul"],
  ["29688", "Estocolmo", "Suécia", "SE", "Europa"],
  ["30961", "Faro", "Portugal", "PT", "Europa"],
  ["29696", "Frankfurt", "Alemanha", "DE", "Europa"],
  ["30669", "Gaborone", "Botsuana", "BW", "África"],
  ["29700", "Genebra", "Suíça", "CH", "Europa"],
  ["29718", "Georgetown", "Guiana", "GY", "América do Sul"],
  ["98000", "Guatemala", "Guatemala", "GT", "América Central e Caribe"],
  ["29742", "Hamamatsu", "Japão", "JP", "Ásia"],
  ["29750", "Hanói", "Vietnã", "VN", "Ásia"],
  ["29769", "Harare", "Zimbábue", "ZW", "África"],
  ["30902", "Hartford", "Estados Unidos", "US", "América do Norte"],
  ["29777", "Havana", "Cuba", "CU", "América Central e Caribe"],
  ["29785", "Helsinque", "Finlândia", "FI", "Europa"],
  ["29793", "Hong Kong", "China (Hong Kong)", "HK", "Ásia"],
  ["29807", "Houston", "Estados Unidos", "US", "América do Norte"],
  ["29815", "Iaundê", "Camarões", "CM", "África"],
  ["38989", "Ierevan", "Armênia", "AM", "Ásia"],
  ["29823", "Iquitos", "Peru", "PE", "América do Sul"],
  ["29831", "Islamabade", "Paquistão", "PK", "Ásia"],
  ["39306", "Istambul", "Turquia", "TR", "Ásia"],
  ["29840", "Jacarta", "Indonésia", "ID", "Ásia"],
  ["29173", "Katmandu", "Nepal", "NP", "Ásia"],
  ["29858", "Kiev", "Ucrânia", "UA", "Europa"],
  ["99430", "Kingston", "Jamaica", "JM", "América Central e Caribe"],
  ["29874", "Kinshasa", "República Democrática do Congo", "CD", "África"],
  ["29882", "Kuaite", "Kuwait", "KW", "Ásia"],
  ["29890", "Kuala Lumpur", "Malásia", "MY", "Ásia"],
  ["29904", "La Paz", "Bolívia", "BO", "América do Sul"],
  ["29912", "Lagos", "Nigéria", "NG", "África"],
  ["29939", "Libreville", "Gabão", "GA", "África"],
  ["99341", "Lilongue", "Malawi", "MW", "África"],
  ["29947", "Lima", "Peru", "PE", "América do Sul"],
  ["29955", "Lisboa", "Portugal", "PT", "Europa"],
  ["39160", "Liubliana", "Eslovênia", "SI", "Europa"],
  ["29963", "Lomé", "Togo", "TG", "África"],
  ["29971", "Londres", "Reino Unido", "GB", "Europa"],
  ["29980", "Los Angeles", "Estados Unidos", "US", "América do Norte"],
  ["29998", "Luanda", "Angola", "AO", "África"],
  ["99287", "Lusaca", "Zâmbia", "ZM", "África"],
  ["30066", "Madri", "Espanha", "ES", "Europa"],
  ["39263", "Malabo", "Guiné Equatorial", "GQ", "África"],
  ["30082", "Manila", "Filipinas", "PH", "Ásia"],
  ["30074", "Manágua", "Nicarágua", "NI", "América Central e Caribe"],
  ["30090", "Maputo", "Moçambique", "MZ", "África"],
  ["99511", "Marselha", "França", "FR", "Europa"],
  ["39102", "Mascate", "Omã", "OM", "Ásia"],
  ["39004", "Mendoza", "Argentina", "AR", "América do Sul"],
  ["30104", "Cidade do México", "México", "MX", "América do Norte"],
  ["30112", "Miami", "Estados Unidos", "US", "América do Norte"],
  ["30120", "Milão", "Itália", "IT", "Europa"],
  ["30147", "Montevidéu", "Uruguai", "UY", "América do Sul"],
  ["30155", "Montreal", "Canadá", "CA", "América do Norte"],
  ["30163", "Moscou", "Rússia", "RU", "Europa"],
  ["30171", "Mumbai", "Índia", "IN", "Ásia"],
  ["30180", "Munique", "Alemanha", "DE", "Europa"],
  ["30198", "Nagóia", "Japão", "JP", "Ásia"],
  ["30201", "Nairóbi", "Quênia", "KE", "África"],
  ["99180", "Nassau", "Bahamas", "BS", "América Central e Caribe"],
  ["39322", "Nicósia", "Chipre", "CY", "Europa"],
  ["30210", "Nova Délhi", "Índia", "IN", "Ásia"],
  ["30228", "Nova York", "Estados Unidos", "US", "América do Norte"],
  ["99490", "Orlando", "Estados Unidos", "US", "América do Norte"],
  ["30244", "Oslo", "Noruega", "NO", "Europa"],
  ["30252", "Ottawa", "Canadá", "CA", "América do Norte"],
  ["30260", "Panamá", "Panamá", "PA", "América Central e Caribe"],
  ["30279", "Paramaribo", "Suriname", "SR", "América do Sul"],
  ["30287", "Paris", "França", "FR", "Europa"],
  ["30295", "Paso de los Libres", "Argentina", "AR", "América do Sul"],
  ["30309", "Pedro Juan Caballero", "Paraguai", "PY", "América do Sul"],
  ["30317", "Pequim", "China", "CN", "Ásia"],
  ["30325", "Port of Spain", "Trinidad e Tobago", "TT", "América Central e Caribe"],
  ["30341", "Porto", "Portugal", "PT", "Europa"],
  ["30333", "Porto Príncipe", "Haiti", "HT", "América Central e Caribe"],
  ["30350", "Praga", "Tchéquia", "CZ", "Europa"],
  ["30368", "Praia", "Cabo Verde", "CV", "África"],
  ["30376", "Pretória", "África do Sul", "ZA", "África"],
  ["99155", "Puerto Iguazú", "Argentina", "AR", "América do Sul"],
  ["99236", "Puerto Quijarro", "Bolívia", "BO", "América do Sul"],
  ["99295", "Pyongyang", "Coreia do Norte", "KP", "Ásia"],
  ["30392", "Quito", "Equador", "EC", "América do Sul"],
  ["30406", "Rabat", "Marrocos", "MA", "África"],
  ["30414", "Ramallah", "Palestina", "PS", "Ásia"],
  ["30422", "Riade", "Arábia Saudita", "SA", "Ásia"],
  ["30430", "Rio Branco", "Uruguai", "UY", "América do Sul"],
  ["99244", "Rivera", "Uruguai", "UY", "América do Sul"],
  ["30449", "Roma", "Itália", "IT", "Europa"],
  ["99147", "Saint John's", "Antígua e Barbuda", "AG", "América Central e Caribe"],
  ["30465", "Salto del Guairá", "Paraguai", "PY", "América do Sul"],
  ["30473", "Santa Cruz de la Sierra", "Bolívia", "BO", "América do Sul"],
  ["99279", "Santa Elena de Uairén", "Venezuela", "VE", "América do Sul"],
  ["30481", "Santiago", "Chile", "CL", "América do Sul"],
  ["30988", "Sarajevo", "Bósnia e Herzegovina", "BA", "Europa"],
  ["30538", "Seul", "Coreia do Sul", "KR", "Ásia"],
  ["29548", "Singapura", "Singapura", "SG", "Ásia"],
  ["99333", "Saint-Georges de l'Oyapock", "Guiana Francesa", "GF", "América do Sul"],
  ["30562", "Sydney", "Austrália", "AU", "Oceania"],
  ["30490", "São Domingos", "República Dominicana", "DO", "América Central e Caribe"],
  ["30503", "São Francisco", "Estados Unidos", "US", "América do Norte"],
  ["30511", "São José", "Costa Rica", "CR", "América Central e Caribe"],
  ["30520", "São Salvador", "El Salvador", "SV", "América Central e Caribe"],
  ["39225", "São Tomé", "São Tomé e Príncipe", "ST", "África"],
  ["30546", "Sófia", "Bulgária", "BG", "Europa"],
  ["30570", "Taipé", "Taiwan", "TW", "Ásia"],
  ["99317", "Talin", "Estônia", "EE", "Europa"],
  ["99104", "Tbilisi", "Geórgia", "GE", "Ásia"],
  ["30597", "Teerã", "Irã", "IR", "Ásia"],
  ["30600", "Tegucigalpa", "Honduras", "HN", "América Central e Caribe"],
  ["30619", "Tel Aviv", "Israel", "IL", "Ásia"],
  ["99139", "Tirana", "Albânia", "AL", "Europa"],
  ["30635", "Toronto", "Canadá", "CA", "América do Norte"],
  ["30686", "Trípoli", "Líbia", "LY", "África"],
  ["30708", "Túnis", "Tunísia", "TN", "África"],
  ["30627", "Tóquio", "Japão", "JP", "Ásia"],
  ["39284", "Uagadugu", "Burkina Faso", "BF", "África"],
  ["39063", "Vancouver", "Canadá", "CA", "América do Norte"],
  ["30740", "Varsóvia", "Polônia", "PL", "Europa"],
  ["30767", "Viena", "Áustria", "AT", "Europa"],
  ["30783", "Washington", "Estados Unidos", "US", "América do Norte"],
  ["30805", "Wellington", "Nova Zelândia", "NZ", "Oceania"],
  ["30821", "Windhoek", "Namíbia", "NA", "África"],
  ["30848", "Xangai", "China", "CN", "Ásia"],
  ["99376", "Yangon", "Mianmar", "MM", "Ásia"],
  ["39020", "Zagreb", "Croácia", "HR", "Europa"],
  ["30864", "Zurique", "Suíça", "CH", "Europa"],
];

export const LOCALIDADES: Localidade[] = LINHAS.map(
  ([codigo, cidade, pais, iso, continente]) => ({ codigo, cidade, pais, iso, continente }),
);

const POR_CODIGO = new Map(LOCALIDADES.map((l) => [l.codigo, l]));

export function localidadePorCodigo(codigo: string): Localidade | undefined {
  return POR_CODIGO.get(codigo);
}

export interface Pais {
  iso: string;
  nome: string;
  continente: Continente;
  localidades: Localidade[];
}

export const PAISES: Pais[] = (() => {
  const mapa = new Map<string, Pais>();
  for (const l of LOCALIDADES) {
    const atual = mapa.get(l.iso);
    if (atual) atual.localidades.push(l);
    else mapa.set(l.iso, { iso: l.iso, nome: l.pais, continente: l.continente, localidades: [l] });
  }
  return [...mapa.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
})();

const PAIS_POR_ISO = new Map(PAISES.map((p) => [p.iso, p]));

export function paisPorIso(iso: string): Pais | undefined {
  return PAIS_POR_ISO.get(iso.toUpperCase());
}

/** Converte "BR" nos indicadores regionais que formam a bandeira 🇧🇷. */
export function bandeira(iso: string): string {
  if (iso.length !== 2) return "";
  return String.fromCodePoint(
    ...[...iso.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}
