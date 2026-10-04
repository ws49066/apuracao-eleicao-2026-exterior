# Apuração 2026 — Voto no Exterior

Painel de acompanhamento da apuração para **Presidente da República** entre os eleitores
brasileiros no exterior, com filtro por **país** e por **cidade**. Os dados vêm dos arquivos
públicos de divulgação de resultados do TSE, consultados em tempo real.

Criado por **Wanderson Oliveira**.

---

## O que o painel mostra

- **Visão geral do exterior** — as 1.351 seções e 916.534 eleitores aptos das 186 cidades com
  voto no exterior, consolidados em uma única tela.
- **Filtro por país** — 134 países. As cidades do país são somadas e os percentuais recalculados.
- **Filtro por cidade** — resultado de uma localidade específica (ex.: Lisboa, Tóquio, Miami).
- **Dados gerais** — seções totalizadas, votos nominais, válidos, anulados, brancos, nulos,
  eleitorado apto, comparecimento e abstenção.
- **Ranking por país** — tabela com eleitorado, comparecimento, seções apuradas e candidato mais
  votado em cada país.
- **Atualização automática** a cada 60 segundos, com botão de atualização manual.

## A API do TSE

O TSE não expõe uma API REST: ele publica arquivos JSON estáticos num CDN. O exterior é tratado
como a **UF `zz`**, e cada cidade com seção eleitoral no exterior é um "município" dessa UF.

Base: `https://resultados.tse.jus.br/oficial/ele2026/6257`

| Finalidade | Caminho |
| --- | --- |
| Catálogo de eleições (ciclos, códigos, cargos) | `/oficial/comum/config/ele-c.json` |
| Localidades de cada UF (inclui as 186 do exterior) | `/config/mun-e006257-cm.json` |
| Resultado consolidado do exterior | `/dados/zz/zz-c0001-e006257-u.json` |
| Resultado de uma cidade (ex.: Lisboa, código 29955) | `/dados/zz/zz29955-c0001-e006257-u.json` |
| Foto do candidato | `/fotos/br/{sqcand}.jpeg` |

Observações sobre o formato:

- O código da eleição aparece com **6 dígitos** no nome do arquivo (`6257` → `e006257`).
- Presidente é o cargo `0001` e o único votado no exterior.
- Todos os números vêm como **string em pt-BR**: `"1.234"` é inteiro, `"12,34"` é decimal.
- Os candidatos ficam aninhados em `carg[0].agr[].par[].cand[]` (cargo → coligação → partido).
- O CDN **rejeita requisições sem `User-Agent` de navegador**.
- O TSE **não informa a que país cada cidade pertence** — esse vínculo é mantido em
  `src/lib/locais.ts`, junto com o continente e o código ISO usado para a bandeira.

### Mudança para o 2º turno

O 1º turno é a eleição `6257`; o 2º turno é a `6258`. Basta definir as variáveis de ambiente
(veja `.env.example`), sem alterar código:

```
TSE_ELEICAO=6258
TSE_TURNO=2
```

## Rodando localmente

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>.

## Publicando na Vercel

O projeto é um Next.js padrão, sem banco de dados nem serviços externos — nenhuma variável de
ambiente é obrigatória.

1. Suba o repositório para o GitHub.
2. Em <https://vercel.com/new>, importe o repositório.
3. Mantenha os padrões (framework Next.js) e clique em **Deploy**.

Ou pela CLI:

```bash
npx vercel --prod
```

## Estrutura

```
src/
  app/
    page.tsx                 painel principal (Server Component)
    api/apuracao/route.ts    resultado de um escopo (exterior | país | cidade)
    api/paises/route.ts      ranking consolidado dos 134 países
  components/                seletor de escopo, cards, painel lateral, tabela
  lib/
    apuracao.ts              resolve o filtro e agrega cidades em países
    locais.ts                as 186 cidades do exterior → país, ISO e continente
    tse/
      config.ts              montagem das URLs do TSE
      client.ts              fetch com cache e User-Agent
      normalize.ts           JSON do TSE → modelo da aplicação
      types.ts               tipos do JSON bruto
```

### Cache

As respostas do TSE são cacheadas por 30 segundos (`next.revalidate`), o que evita martelar o CDN
durante a totalização sem atrasar visivelmente os números. O ranking por país percorre as 186
cidades em lotes de 12 requisições e só é carregado sob demanda.

## Resultado provisório (BUs não oficiais)

Enquanto o TSE não totaliza o exterior, o painel usa os **boletins de urna divulgados pela imprensa**,
sempre sinalizados como não oficiais. O código está em `src/lib/fontes/`:

- `config.ts` — lista de fontes. A `principal` (g1) é lida e entra nos números; as de `conferencia`
  só confirmam se os totais do líder e do 2º colocado batem.
- `leitor.ts` — transforma a matéria em votos por país (tolera erros de digitação da fonte) e
  compara o líder com o percentual que a própria matéria informa para sinalizar números que não fecham.
- `index.ts` — coleta tudo em paralelo (cache de 60s/300s), mescla com o snapshot em
  `src/data/provisorio.ts` e gera uma `versao` (hash). Se uma coleta falhar, vale o snapshot.
- `/api/monitor` — devolve a `versao` e o status das fontes; o componente `MonitorFontes` consulta a cada
  60s e, se a versão mudar, atualiza a tela e avisa o que mudou.

Dado oficial do TSE sempre prevalece: com votos apurados no escopo, o provisório deixa de ser usado.
Para incluir outra fonte, basta adicioná-la em `config.ts`.

---

Projeto independente, sem vínculo com o Tribunal Superior Eleitoral.
