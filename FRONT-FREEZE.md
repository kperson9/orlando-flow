# Orlando Flow v41.4.3 — Front Freeze

Status: **front congelado para uso real**.

## Escopo
Parte da v41.3.3 funcionalmente aprovada e aplica somente polimento de interface.
Motor de decisão, scoring, prioridades, histórico, filas e replanejamento não foram alterados.

## Polimento aplicado
- textos mais curtos para dados recentes, Express e Early Entry;
- cards menos técnicos:
  - Base da previsão → Confiança da previsão;
  - Contexto do parque → Movimento do parque;
  - Logística → Área e caminhada;
  - Custo total → Tempo total;
  - qualidade técnica dos dados removida da experiência principal;
  - motivos limitados aos 4 mais úteis;
- ajuda das recomendações simplificada;
- pequenos ajustes de espaçamento/touch/mobile;
- preservação de cards abertos da v41.3.3;
- cache isolado em `v41-4-0-freeze`.

## Política de freeze
Até a viagem, alterar somente em caso de:
1. bug funcional reproduzível;
2. problema crítico de compatibilidade/PWA;
3. erro de dados que impeça uma decisão.

Evitar novos ajustes cosméticos e não alterar o motor sem evidência de falha.

## Smoke test
```js
window.__ORLANDO_FLOW_FRONT_UX__.status()
```

Esperado:
- `controller` preenchido;
- `freshnessElement: true`;
- `expressElement: true`;
- `visibleScores: 0`;
- `freeze.version: "41.4.0-freeze"`;
- `freeze.scope: "front-only"`;
- `freeze.engineChanged: false`.

Em parque Universal com Express ativo:
- `expressBanner: true`.

Com cards reais:
- abrir card + Outras opções;
- Atualizar;
- o estado deve ser preservado para cards que continuarem na nova recomendação.


## Final PWA
Novo conjunto de ícones Android/Apple adicionado. Motor permanece inalterado.

- ajuste visual final: o logo do Animal Kingdom agora preserva a arte original no modo claro e no modo escuro.
