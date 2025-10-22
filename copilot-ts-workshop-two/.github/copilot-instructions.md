# GitHub Copilot Workshop Repository - Agent Onboarding Guide

## Application Overview
This is a full-stack superhero comparison application built for a GitHub Copilot training workshop. The app allows users to view a table of superheroes with their power statistics and compare two heroes head-to-head in a battle interface.

**Key Features:**
- View all superheroes in a sortable table
- Select and compare two superheroes
- Visual comparison of power statistics (intelligence, strength, speed, durability, power, combat)
- Determine winner based on stat comparison

## Tech Stack
- **Backend**: Node.js + Express + TypeScript (ES Modules)
- **Frontend**: React 19.1.0 + JavaScript (Create React App)
- **MCP Component**: TypeScript with Model Context Protocol SDK
- **Testing**: Jest (backend), Playwright (frontend E2E)
- **Build Tools**: TSX, Nodemon, TypeScript compiler

## Project Structure
```
├── backend/           # Express API server (TypeScript)
│   ├── src/server.ts  # Main server file with 3 API endpoints
│   ├── data/          # Static superhero data (JSON)
│   └── tests/         # Jest unit tests
├── frontend/          # React client application
│   ├── src/App.js     # Main React component (table + comparison views)
│   ├── public/        # Static assets and HTML
│   └── tests/         # Playwright E2E tests
└── mcp/               # Model Context Protocol server (incomplete)
    ├── src/index.ts   # MCP implementation (placeholder)
    └── data/          # Copy of superhero data
```

## API Endpoints
The backend serves superhero data through these REST endpoints:
- `GET /` - Health check ("Save the World!")
- `GET /api/superheroes` - Returns all superheroes array
- `GET /api/superheroes/:id` - Returns single superhero by ID
- `GET /api/superheroes/:id/powerstats` - Returns powerstats object for superhero

## Development Workflow

### Setup Commands
```bash
# Backend setup
cd backend && npm install && npm run dev    # Runs on port 3000

# Frontend setup (new terminal)
cd frontend && npm install && npm start    # Runs on port 3001

# MCP setup (if needed)
cd mcp && npm install && npm run build
```

### Testing Commands
```bash
# Backend tests (Jest)
cd backend && npm test

# Frontend E2E tests (Playwright - requires both servers running)
cd frontend && npx playwright test
```

## Configuration Notes

### ESM Module Setup
- Backend uses `"type": "module"` in package.json
- Uses `fileURLToPath(import.meta.url)` for __dirname equivalent
- Jest config uses `ts-jest/presets/default-esm` preset
- All imports use `.js` extensions in TypeScript files

### Port Configuration
- Backend: Port 3000 (configurable via PORT env var)
- Frontend: Port 3001 (hardcoded via cross-env)
- Tests use TEST_PORT=3002 to avoid conflicts
- Frontend proxies API calls to backend via proxy setting

### TypeScript Configuration
- Backend: ES2020 target, NodeNext modules, strict mode
- MCP: ES2022 target, Node16 modules, builds to `build/` directory
- All configs exclude node_modules, include src/**/*

## Data Structure
Superhero objects follow this interface:
```typescript
interface Superhero {
  id: number;
  name: string;
  image: string; // External CDN URLs
  powerstats: {
    intelligence: number;
    strength: number;
    speed: number;
    durability: number;
    power: number;
    combat: number;
  };
}
```

## Common Issues & Solutions

### Server Port Conflicts
- Backend checks for EADDRINUSE errors and provides clear messages
- Use different TEST_PORT for tests to avoid conflicts
- Frontend specifically uses port 3001 to avoid backend collision

### Module Resolution
- Backend uses ESM modules - avoid CommonJS patterns
- Use proper `.js` extensions in TypeScript imports
- MCP component uses different TypeScript target (Node16 vs NodeNext)

### Testing Environment
- Jest configured for ESM with experimental VM modules
- Playwright expects both servers running on specific ports
- Backend tests mock Express app without starting actual server

## Key Files to Understand
1. `backend/src/server.ts` - Main API logic, error handling, ESM setup
2. `frontend/src/App.js` - React state management, hero comparison logic
3. `backend/tests/server.test.ts` - API test patterns using supertest
4. `mcp/prompt.md` - Requirements for MCP implementation (incomplete)

## Development Best Practices
- Backend uses comprehensive error handling and logging
- Frontend state management follows React hooks patterns
- Tests cover happy path and error scenarios
- TypeScript strict mode enforced in backend and MCP components
- ESM modules require careful import/export syntax

## Workshop Context
This is proprietary workshop code for Commit AI customers. The MCP component appears to be an exercise for workshop participants to implement based on the requirements in `mcp/prompt.md`.
