import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
// ESM __dirname workaround
const __dirname = path.dirname(fileURLToPath(import.meta.url));
/**
* Loads the superheroes data from the JSON file.
* Throws a descriptive error if loading fails.
*/
async function loadSuperheroes() {
    const dataPath = path.join(__dirname, "../data/superheroes.json");
    try {
        const data = await fs.promises.readFile(dataPath, "utf8");
        return JSON.parse(data);
    }
    catch (err) {
        throw new Error(`Failed to load superheroes data: ${err instanceof Error ? err.message : String(err)}`);
    }
}
/**
* Formats superhero data as a Markdown string.
*/
function formatSuperheroMarkdown(hero) {
    const stats = hero.powerstats;
    return [
        `Here is the data for ${hero.name} retrieved using the superheroes MCP:\n`,
        `• Name: ${hero.name}`,
        `• Image: <img src=\"${hero.image}\" alt=\"${hero.name}\"/>`,
        `• Powerstats:`,
        `  • Intelligence: ${stats.intelligence}`,
        `  • Strength: ${stats.strength}`,
        `  • Speed: ${stats.speed}`,
        `  • Durability: ${stats.durability}`,
        `  • Power: ${stats.power}`,
        `  • Combat: ${stats.combat}`
    ].join("\n");
}
// --- MCP Server Setup ---
const server = new McpServer({
    name: "superheroes-mcp",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
// --- Tool: Get Superhero by Name or ID ---
server.tool("get_superhero", "Get superhero details by name or id", {
    name: z.string().describe("Name of the superhero (optional)"),
    id: z.string().describe("ID of the superhero (optional)"),
}, async ({ name, id }) => {
    const superheroes = await loadSuperheroes();
    const nameLc = name?.toLowerCase();
    const idStr = id?.toString();
    // Find superhero by name (case-insensitive) or id
    const superhero = superheroes.find((hero) => {
        const heroNameLc = hero.name?.toLowerCase() ?? "";
        const heroIdStr = hero.id?.toString() ?? "";
        return (nameLc && heroNameLc === nameLc) || (idStr && heroIdStr === idStr);
    });
    if (!superhero) {
        throw new Error("Superhero not found");
    }
    return {
        content: [
            {
                type: "text",
                text: formatSuperheroMarkdown(superhero),
            },
        ],
    };
});
// --- Main Entrypoint ---
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Superhero MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
