/** Tipos do JSON bruto devolvido pelo TSE. Todos os números vêm como string. */

export interface TseCandidatoBruto {
  n: string;
  sqcand: string;
  nm: string;
  nmu: string;
  seq: string;
  e: string;
  st: string;
  vap: string;
  pvap: string;
  vs?: { tp: string; sqcand: string; nm: string; nmu: string; sgp: string }[];
}

export interface TsePartidoBruto {
  n: string;
  sg: string;
  nm: string;
  cand: TseCandidatoBruto[];
}

export interface TseAgremiacaoBruta {
  n: string;
  nm: string;
  tp: string;
  com: string;
  par: TsePartidoBruto[];
}

export interface TseCargoBruto {
  cd: string;
  nmn: string;
  nv: string;
  agr: TseAgremiacaoBruta[];
}

export interface TseResultadoBruto {
  ele: string;
  t: string;
  tpabr: string;
  cdabr: string;
  dg: string;
  hg: string;
  dt: string;
  ht: string;
  /** Seções. */
  s: {
    ts: string;
    st: string;
    pst: string;
    snt: string;
    psnt: string;
  };
  /** Eleitorado. */
  e: {
    te: string;
    est: string;
    pest: string;
    c: string;
    pc: string;
    a: string;
    pa: string;
  };
  /** Votos. */
  v: {
    tv: string;
    vv: string;
    pvv: string;
    vnom: string;
    pvnom: string;
    van: string;
    pvan: string;
    vansj: string;
    pvansj: string;
    vb: string;
    pvb: string;
    vn: string;
    pvn: string;
  };
  carg: TseCargoBruto[];
}

export interface TseConfigMunicipios {
  dg: string;
  hg: string;
  abr: {
    cd: string;
    ds: string;
    mu: { cd: string; cdi: string; nm: string; c: string; z: string[] }[];
  }[];
}
