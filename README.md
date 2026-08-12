# Orlando Flow — PWA de roteiro inteligente

Uma PWA mobile-first para acompanhar um roteiro em Orlando, comparar o plano com o horário real, consultar filas e clima, sugerir reordenações e gerar um recap da viagem.

## Por que PWA, e não um HTML offline puro?

Um HTML offline puro é ótimo para consultar um roteiro estático, mas não resolve bem dados em tempo real, instalação como app, cache inteligente e notificações. Esta solução continua sendo HTML/CSS/JavaScript (sem framework), porém adiciona `manifest.webmanifest` + `service worker`, então pode ser instalada no celular e manter o roteiro e a interface disponíveis offline.

## Recursos implementados

- Status do cronograma: no ritmo, adiantado ou atrasado.
- Linha do tempo diária, início/conclusão/pulo de atividades.
- Histórico com fila real, deslocamento, nota e comentário.
- Filas ao vivo por ThemeParks.wiki para os 4 parques Disney e 3 parques Universal principais de Orlando.
- Previsão horária pelo Open-Meteo.
- Recomendação de atrações flexíveis considerando prioridade, fila, horário fixo seguinte, exposição ao clima e área do parque.
- Alertas in-app e notificações do navegador enquanto o app está ativo.
- Cache offline de interface, roteiro e últimos retornos de APIs.
- Report diário ou da viagem, ranking por nota, fila, deslocamento, passos e estatísticas divertidas.
- Exportação de report HTML e card PNG para compartilhamento.
- Backup/importação do roteiro em JSON.

## Como testar no computador

```bash
cd orlando-trip-companion
python -m http.server 8080
```

Abra `http://localhost:8080`.

## Como colocar nos dois celulares

Para instalar como PWA no celular, publique a pasta inteira em um host HTTPS estático (GitHub Pages, Netlify, Cloudflare Pages, Vercel etc.). Depois:

- iPhone: abrir o link → Compartilhar → Adicionar à Tela de Início.
- Android/Chrome: abrir o link → Instalar app / Adicionar à tela inicial.

O app não precisa de servidor próprio para o MVP, apenas hospedagem estática HTTPS.

## Estrutura do roteiro

Edite `data/sample-itinerary.json` ou importe um JSON pelo app.

```json
{
  "tripName": "Orlando 2026",
  "timezone": "America/New_York",
  "settings": { "delayThreshold": 15, "longWaitThreshold": 60 },
  "days": [
    {
      "date": "2026-09-10",
      "label": "Magic Kingdom",
      "park": "magic-kingdom",
      "activities": [
        {
          "id": "mk-01",
          "time": "09:00",
          "title": "Seven Dwarfs Mine Train",
          "entityName": "Seven Dwarfs Mine Train",
          "type": "attraction",
          "duration": 8,
          "priority": 5,
          "flexible": true,
          "indoor": false,
          "weatherSensitive": true,
          "area": "Fantasyland",
          "plannedWait": 35
        }
      ]
    }
  ]
}
```

### `park` aceitos no MVP

- `magic-kingdom`
- `epcot`
- `hollywood-studios`
- `animal-kingdom`
- `universal-studios-florida`
- `islands-of-adventure`
- `epic-universe`
- `off-day`

Use `entityName` com o nome da atração no provedor de filas quando o título do roteiro for diferente.

## APIs

### Filas — ThemeParks.wiki

Base: `https://api.themeparks.wiki/v1`

O app chama `GET /entity/{parkId}/live` e lê `liveData[].queue.STANDBY.waitTime`.

### Clima — Open-Meteo

O app usa previsão horária (`precipitation_probability`, `weather_code`, `wind_gusts_10m`, `temperature_2m`) e condições atuais. Não há chave no protótipo.

## Limitações e evolução recomendada

1. **Push em segundo plano**: notificações confiáveis mesmo com o app fechado exigem Web Push + backend/serverless (por exemplo Cloudflare Worker + banco/cron) e inscrição dos celulares.
2. **Passos automáticos**: navegadores não têm uma API padrão confiável para ler Apple Health/Health Connect. O MVP recebe passos manualmente. Para automação total, um app nativo/Capacitor ou integração autenticada seria a evolução correta.
3. **Mapa e tempo de caminhada real**: o MVP usa `area` para reduzir deslocamentos. Uma fase seguinte pode incluir Google Maps/Mapbox ou um mapa interno com coordenadas das atrações.
4. **Reservas/Lightning Lane**: podem entrar como atividades de horário fixo para o otimizador nunca criar um conflito.
5. **Sincronização entre o casal**: hoje o estado é local em cada aparelho. Um pequeno backend (Supabase/Firebase) permitiria sincronização instantânea entre os dois celulares.

## Lógica de otimização (resumo)

A pontuação de uma atração flexível combina:

- prioridade definida no roteiro;
- fila atual (menor é melhor);
- risco climático para atrações externas;
- preferência por atrações cobertas durante chuva/trovoada;
- mesma área da última atração, para reduzir caminhada;
- tempo disponível antes da próxima atividade de horário fixo.

O otimizador não move refeições, shows e outros itens marcados com `flexible: false`.

## Privacidade

Roteiro, notas, histórico e passos ficam no `localStorage` do navegador. As APIs externas recebem apenas requisições de dados públicos de parque/clima; o app não envia o histórico pessoal para um servidor próprio.
