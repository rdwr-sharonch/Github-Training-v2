Create a TypeScript MCP (Model Context Protocol) server in index.ts that serves superhero data. The project uses ESM modules (type: "module" in package.json) and strict TypeScript compilation.


Check MCP SDK API docs README, its intalled locally, under mcp/node_modules/@modelcontextprotocol/sdk/README.md


Key Requirements:


Imports and ESM Setup:


Import path, fs, fileURLToPath from Node.js built-ins
Import McpServer from "@modelcontextprotocol/sdk/server/mcp.js"
Import StdioServerTransport from "@modelcontextprotocol/sdk/server/stdio.js"
Import z from "zod"
Use ESM __dirname workaround: const __dirname = path.dirname(fileURLToPath(import.meta.url));


TypeScript Interfaces:
interface Powerstats {
    intelligence: number;
    strength: number;
    speed: number;
    durability: number;
    power: number;
    combat: number;
}

interface Superhero {
    id: string | number;
    name: string;
    image: string;
    powerstats: Powerstats;
}


Data Loading Function:
Create async function loadSuperheroes(): Promise<Superhero[]>
Load from superheroes.json relative to __dirname
Use fs.promises.readFile with UTF-8 encoding
Parse JSON and return as Superhero array
Wrap in try/catch with descriptive error: "Failed to load superheroes data: ${err instanceof Error ? err.message : String(err)}"
Markdown Formatting Function:


Create function formatSuperheroMarkdown(hero: Superhero): string
Return formatted string starting with: "Here is the data for ${hero.name} retrieved using the superheroes MCP:\n"
Format as bulleted list with hero name, image (as HTML img tag), and powerstats
Use template: <img src="${hero.image}" alt="${hero.name}"/>
Indent powerstats subbullets with two spaces
MCP Server Configuration:


Create server with name: "superheroes-mcp"
Version: "1.0.0"
Empty capabilities object with resources: {} and tools: {}


Tool Definition:
Tool name: "get_superhero"
Description: "Get superhero details by name or id"
Schema with two optional string parameters:
name: "Name of the superhero (optional)"
id: "ID of the superhero (optional)"
Handler function parameters: { name, id }: { name: string; id: string }


Tool Logic:
Load superheroes data
Convert name to lowercase for case-insensitive search
Convert id to string for comparison
Find superhero where either:
Name matches (case-insensitive): heroNameLc === nameLc
ID matches (as string): heroIdStr === idStr
Use optional chaining and nullish coalescing: hero.name?.toLowerCase() ?? ""
Throw error "Superhero not found" if not found
Return object with content array containing single text object with formatted markdown


Main Function:
Create async main() function
Create StdioServerTransport
Connect server to transport with await server.connect(transport)
Log to stderr: "Superhero MCP Server running on stdio"


Error Handling:
Call main().catch() with error handler
Log "Fatal error in main():" + error to stderr
Exit with code 1


Critical Details:
- Use exact error messages and log messages as specified
- Maintain exact spacing and formatting in markdown output
- Use nullish coalescing (??) for safe property access
- Server name is "superheros-mcp"
- All console output goes to stderr (console.error)
- Use hero.id?.toString() for ID comparison
- Return type from tool must have content array structure

CHECK THINGS WORK:
1. BUILD the code and fix issues: run “npm run build” from within the /mcp folder
2. TEST IT WORKS! use the superheroes-mcp/tests/test-mcp.js function to verify your implementation.