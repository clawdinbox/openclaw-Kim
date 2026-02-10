# Multi-Agent Team Setup für OpenClaw

## Konzept
Mehrere Agenten mit eigenen SOUL.md-ähnlichen System-Prompts, spezialisiert auf verschiedene Aufgaben.

## Gateway-Konfiguration (openclaw.json)

```json
{
  "agents": {
    "defaults": {
      "model": { "primary": "moonshot/kimi-k2.5" },
      "workspace": "/Users/clawdmm/.openclaw/workspace"
    },
    "entries": {
      "marie": {
        "name": "Marie",
        "role": "Content Writer",
        "systemPrompt": "Du bist Marie, eine erfahrene Content-Strategin für LinkedIn und Social Media. Dein Stil: scharf, datengetrieben, ohne Floskeln. Du schreibst Posts, die Konversationen starten. Keine Emojis, keine Hashtags, keine 'Ich freue mich'-Sätze.",
        "model": "google/gemini-2.5-flash",
        "tools": ["web_search", "message"],
        "workspace": "/Users/clawdmm/.openclaw/workspace/agents/marie"
      },
      "alex": {
        "name": "Alex", 
        "role": "Research Analyst",
        "systemPrompt": "Du bist Alex, Research-Analyst für Fashion, Luxury und Sportswear. Du durchsuchst Quellen, findest Signale und synthesierst zu klaren Insights. Strukturiert, quellenbasiert, immer mit konkreten Daten und Named Entities.",
        "model": "openrouter/google/gemini-2.5-pro",
        "tools": ["web_search", "web_fetch", "cron"],
        "workspace": "/Users/clawdmm/.openclaw/workspace/agents/alex"
      },
      "sam": {
        "name": "Sam",
        "role": "Design & PDF Specialist", 
        "systemPrompt": "Du bist Sam, spezialisiert auf visuelle Berichte, PDF-Layouts und Design-CI. Du erstellst professionelle Dokumente mit HTML/CSS, kennst dich mit Puppeteer aus und hältst strikt an vorgegebene Design-Systeme.",
        "model": "moonshot/kimi-k2.5",
        "tools": ["exec", "read", "write", "edit"],
        "workspace": "/Users/clawdmm/.openclaw/workspace/agents/sam"
      },
      "supervisor": {
        "name": "Supervisor",
        "role": "Task Coordinator",
        "systemPrompt": "Du bist der Supervisor. Du erhältst komplexe Aufgaben, teilst sie auf und weist sie dem passenden Team-Agenten zu. Du trackst Fortschritt und sorgst für Qualitätskontrolle.",
        "model": "openrouter/anthropic/claude-sonnet-4",
        "tools": ["sessions_spawn", "sessions_send", "sessions_list"],
        "workspace": "/Users/clawdmm/.openclaw/workspace"
      }
    }
  }
}
```

## Workspace-Struktur

```
workspace/
├── agents/
│   ├── marie/
│   │   ├── SOUL.md          # Ihre Persönlichkeit
│   │   ├── MEMORY.md        # Ihre gelernten Patterns
│   │   └── drafts/          # Ihre aktuellen Arbeiten
│   ├── alex/
│   │   ├── SOUL.md
│   │   ├── MEMORY.md
│   │   └── research/
│   └── sam/
│       ├── SOUL.md
│       ├── MEMORY.md
│       └── templates/
└── shared/                  # Gemeinsame Ressourcen
    ├── brand-assets/
    ├── data/
    └── logs/
```

## Nutzung

### 1. Direkte Ansprache (per Label)
```bash
# Marie einen LinkedIn-Post schreiben lassen
openclaw sessions_spawn --label marie --task "Schreibe einen LinkedIn-Post über Adidas Q1 Zahlen"

# Alex recherchieren lassen
openclaw sessions_spawn --label alex --task "Recherchiere Anta Sports Puma Übernahme"

# Sam PDF erstellen lassen
openclaw sessions_spawn --label sam --task "Erstelle PDF aus diesem HTML mit CI"
```

### 2. Supervisor delegiert
```bash
# Supervisor bekommt komplexe Aufgabe und teilt auf
openclaw sessions_spawn --label supervisor --task "Erstelle einen Sportswear Report: Alex recherchiert, Marie schreibt Zusammenfassung, Sam macht PDF"
```

### 3. In Cron-Jobs
```json
{
  "name": "Morning Brief",
  "schedule": { "kind": "cron", "expr": "0 8 * * *", "tz": "Europe/Berlin" },
  "payload": {
    "kind": "agentTurn",
    "message": "Erstelle Morning Brief: Recherche + Summary",
    "agentId": "alex"
  }
}
```

## Vorteile

- **Spezialisierung**: Jeder Agent hat seine Stärke
- **Persistenz**: Jedes Agent-Label hat eigenen Session-State
- **Parallel**: Mehrere Agenten können gleichzeitig arbeiten
- **Team-Gefühl**: Du sprichst sie beim Namen an

## Nächste Schritte

1. **Soll ich das Setup deployen?** (gateway.config.patch)
2. **Agent-Ordnerstruktur anlegen?**
3. **Erste SOUL.md für Marie/Alex/Sam schreiben?**
