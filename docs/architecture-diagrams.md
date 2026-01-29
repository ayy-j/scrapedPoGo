# Architecture Diagrams (Mermaid)

This document provides Mermaid.js diagrams for understanding the scrapedPoGo codebase. It is optimized for LLMs and developers who need quick architectural context.

## System Architecture (High Priority)

```mermaid
flowchart TB
    subgraph External_Sources
        LD["LeekDuck.com"]
        PA["PogoAssets"]
    end

    subgraph Orchestrators
        S1["src/scrapers/scrape.js"]
        S2["src/scrapers/detailedscrape.js"]
        S3["src/scrapers/combinedetails.js"]
        S4["src/scrapers/scrapeShinies.js"]
    end

    subgraph Page_Scrapers
        P1["src/pages/*.js"]
        P2["src/pages/detailed/*.js"]
    end

    subgraph Utilities
        U1["src/utils/scraperUtils.js"]
        U2["src/utils/shinyData.js"]
        U3["src/utils/imageDimensions.js"]
        U4["src/utils/logger.js"]
    end

    subgraph Data_Storage
        T1["data/temp/*.json"]
        D1["data/*.min.json"]
        D2["data/eventTypes/*.min.json"]
    end

    subgraph Validation
        V1["schemas/*.schema.json"]
        V2["scripts/validate-schemas.js"]
    end

    subgraph Automation
        A1["workflows/scraper.yml"]
        A2["jsDelivr CDN"]
    end

    LD --> S1
    LD --> S2
    PA --> S4

    S1 --> P1
    S2 --> P2
    P1 --> U1
    P2 --> U1
    S4 --> U2
    U1 --> U3
    S1 --> U4
    S2 --> U4

    S1 --> D1
    S2 --> T1
    S4 --> T1
    S3 --> D1
    S3 --> D2

    D1 --> V2
    V1 --> V2

    A1 --> S1
    A1 --> S4
    A1 --> S2
    A1 --> S3
    D1 --> A2
    D2 --> A2
```

## Execution Flow (High Priority)

```mermaid
flowchart LR
    TRIGGER["GitHub Actions Trigger"] --> INSTALL["npm install"]

    subgraph Stage_1_Basic_Scrape
        B1["events.get()"]
        B2["raids.get()"]
        B3["research.get()"]
        B4["eggs.get()"]
        B5["rocketLineups.get()"]
    end

    subgraph Stage_2_Shiny_Scrape
        SH1["scrapeShinies.js"]
    end

    subgraph Stage_3_Detailed_Scrape
        D0["read data/events.min.json"]
        D1["dispatch by eventType"]
        D2["generic detailed scrape"]
        D3["type-specific detailed scrape"]
        D4["write data/temp/*.json"]
    end

    subgraph Stage_4_Combine
        C1["merge temp into events"]
        C2["write data/events.min.json"]
        C3["write data/eventTypes/*.min.json"]
    end

    subgraph Stage_5_Validate_Deploy
        V1["npm run validate"]
        V2["commit data/"]
        V3["push to CDN"]
    end

    INSTALL --> B1
    INSTALL --> SH1
    B1 --> D0
    B2 --> D0
    B3 --> D0
    B4 --> D0
    B5 --> D0
    SH1 --> D4

    D0 --> D1 --> D2 --> D3 --> D4
    D4 --> C1 --> C2 --> C3
    C2 --> V1 --> V2 --> V3
```

## Data Flow (High Priority)

```mermaid
sequenceDiagram
    participant LD as LeekDuck.com
    participant PA as PogoAssets
    participant BS as Basic Scrapers
    participant DS as Detailed Scrapers
    participant CD as Combine Details
    participant FS as Filesystem
    participant VS as Schema Validation

    LD->>BS: Fetch HTML pages
    BS->>BS: Parse DOM (JSDOM)
    BS->>BS: Extract structured data
    BS->>FS: Write data/*.min.json

    PA->>BS: Shiny assets feed
    BS->>FS: Write data/shinies.min.json

    FS->>DS: Read events.min.json
    DS->>LD: Fetch event detail pages
    DS->>DS: Extract type-specific details
    DS->>FS: Write data/temp/*.json

    FS->>CD: Read temp files + events
    CD->>CD: Flatten and merge fields
    CD->>FS: Write data/events.min.json
    CD->>FS: Write data/eventTypes/*.min.json

    FS->>VS: Validate output vs schemas
```

## Component Interaction (Medium Priority)

```mermaid
flowchart TB
    S1["src/scrapers/scrape.js"] --> P1["src/pages/events.js"]
    S1 --> P2["src/pages/raids.js"]
    S1 --> P3["src/pages/research.js"]
    S1 --> P4["src/pages/eggs.js"]
    S1 --> P5["src/pages/rocketLineups.js"]

    S2["src/scrapers/detailedscrape.js"] --> D0["src/pages/detailed/generic.js"]
    S2 --> D1["src/pages/detailed/event.js"]
    S2 --> D2["src/pages/detailed/communityday.js"]
    S2 --> D3["src/pages/detailed/raidbattles.js"]
    S2 --> D4["src/pages/detailed/raidhour.js"]
    S2 --> D5["src/pages/detailed/raidday.js"]
    S2 --> D6["src/pages/detailed/timedresearch.js"]
    S2 --> D7["src/pages/detailed/season.js"]
    S2 --> D8["src/pages/detailed/gotour.js"]
    S2 --> D9["src/pages/detailed/teamgorocket.js"]
    S2 --> D10["src/pages/detailed/gobattleleague.js"]
    S2 --> D11["src/pages/detailed/maxbattles.js"]
    S2 --> D12["src/pages/detailed/maxmondays.js"]
    S2 --> D13["src/pages/detailed/gopass.js"]
    S2 --> D14["src/pages/detailed/pokestopshowcase.js"]
    S2 --> D15["src/pages/detailed/research.js"]
    S2 --> D16["src/pages/detailed/breakthrough.js"]
    S2 --> D17["src/pages/detailed/spotlight.js"]

    D0 --> U1["src/utils/scraperUtils.js"]
    D1 --> U1
    D2 --> U1
    D3 --> U1
    D4 --> U1
    D5 --> U1
    D6 --> U1
    D7 --> U1
    D8 --> U1
    D9 --> U1
    D10 --> U1
    D11 --> U1
    D12 --> U1
    D13 --> U1
    D14 --> U1
    D15 --> U1
    D16 --> U1
    D17 --> U1
```

## Event Processing State Machine (Medium Priority)

```mermaid
stateDiagram-v2
    [*] --> Basic_Metadata

    Basic_Metadata --> Type_Dispatch
    Type_Dispatch --> Generic_Detail
    Type_Dispatch --> Type_Specific_Detail

    Generic_Detail --> Write_Temp
    Type_Specific_Detail --> Write_Temp

    Write_Temp --> Combine_Details
    Combine_Details --> Write_Final
    Write_Final --> Write_Per_Type
    Write_Per_Type --> [*]

    Type_Specific_Detail --> Fallback_From_Backup: scrape error
    Fallback_From_Backup --> Write_Temp
```

## Error Handling Flowchart (Medium Priority)

```mermaid
flowchart TD
    START["Detailed scraper get(url, id, bkp)"] --> TRY["Try JSDOM fetch + parse"]
    TRY --> OK{"Scrape success?"}
    OK -->|Yes| WRITE["writeTempFile(id, type, data)"]
    OK -->|No| HANDLE["handleScraperError(err, id, type, bkp, key)"]
    HANDLE --> SEARCH{"Backup data exists?"}
    SEARCH -->|Yes| FALLBACK["writeTempFile from backup"]
    SEARCH -->|No| LOG["Log error (DEBUG) and continue"]
    WRITE --> END["Continue pipeline"]
    FALLBACK --> END
    LOG --> END
```

## Development Workflow (Medium Priority)

```mermaid
flowchart LR
    A1["Add scraper: src/pages/detailed/newtype.js"] --> A2["Import in detailedscrape.js"]
    A2 --> A3["Add eventType dispatch case"]
    A3 --> A4["Update schemas if fields added"]
    A4 --> A5["Run npm run pipeline"]
    A5 --> A6["Run npm run validate"]
    A6 --> A7["Update docs if needed"]
    A7 --> A8["Open PR / commit changes"]
```

## Notes

- Mermaid diagrams render natively in GitHub markdown.
- All paths and script names match the current repository layout.
- Update diagrams when adding new event types or changing the pipeline.
