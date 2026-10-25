// Gera src/data/mapa-paises.json (contornos em SVG) a partir do world-atlas.
import { readFileSync, writeFileSync } from "node:fs";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import countries from "i18n-iso-countries";

const topo = JSON.parse(readFileSync("node_modules/world-atlas/countries-110m.json", "utf8"));
const todos = feature(topo, topo.objects.countries).features.filter((f) => f.id !== "010"); // sem Antártida

const LARGURA = 1000;
const projecao = geoNaturalEarth1().fitWidth(LARGURA, { type: "FeatureCollection", features: todos });
const caminho = geoPath(projecao).digits(1);
const [[, y0], [, y1]] = geoPath(projecao).bounds({ type: "FeatureCollection", features: todos });

const paises = [];
for (const f of todos) {
  const iso = countries.numericToAlpha2(String(f.id).padStart(3, "0"));
  const d = caminho(f);
  if (iso && d) paises.push({ iso, nome: f.properties.name, d });
}
// países que o mapa de 110m não desenha (ilhas e cidades-estado) viram marcadores [lon, lat]
const MARCADORES = {
  AG: [-61.8, 17.1], BB: [-59.55, 13.19], BH: [50.55, 26.07], CV: [-23.6, 15.1], HK: [114.17, 22.32],
  GF: [-53.1, 3.9], LC: [-60.98, 13.9], ST: [6.6, 0.3], SG: [103.82, 1.35],
};
const marcadores = Object.entries(MARCADORES).map(([iso, ponto]) => {
  const [x, y] = projecao(ponto);
  return { iso, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
});

writeFileSync(
  "src/data/mapa-paises.json",
  JSON.stringify({ largura: LARGURA, altura: Math.ceil(y1 - Math.min(y0, 0)), deslocY: Math.min(y0, 0), paises, marcadores }),
);
console.log("países desenhados:", paises.length, "| marcadores:", marcadores.length);
