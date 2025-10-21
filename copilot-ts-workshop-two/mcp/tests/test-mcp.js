#!/usr/bin/env node

// Simple test script to verify the MCP server can load data correctly
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadSuperheroes() {
  try {
    const data = await fs.promises.readFile(
      path.join(__dirname, "../data", "superheroes.json"),
      "utf-8"
    );
    return JSON.parse(data);
  } catch (err) {
    throw new Error(`Failed to load superheroes data: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function formatSuperheroMarkdown(hero) {
  return `Here is the data for ${hero.name} retrieved using the superheroes MCP:

• Name: ${hero.name}
• Image: <img src="${hero.image}" alt="${hero.name}"/>
• Powerstats:
  • Intelligence: ${hero.powerstats.intelligence}
  • Strength: ${hero.powerstats.strength}
  • Speed: ${hero.powerstats.speed}
  • Durability: ${hero.powerstats.durability}
  • Power: ${hero.powerstats.power}
  • Combat: ${hero.powerstats.combat}`;
}

async function testMCP() {
  console.log("Testing MCP server functionality...");
  
  try {
    const superheroes = await loadSuperheroes();
    console.log(`✅ Successfully loaded ${superheroes.length} superheroes`);
    
    // Test finding by name (case insensitive)
    const antman = superheroes.find(h => h.name?.toLowerCase() === "ant-man");
    if (antman) {
      console.log("✅ Found Ant-Man by name");
      console.log(formatSuperheroMarkdown(antman));
    } else {
      console.log("❌ Could not find Ant-Man");
    }
    
    // Test finding by ID
    const hero1 = superheroes.find(h => h.id?.toString() === "1");
    if (hero1) {
      console.log(`✅ Found hero by ID 1: ${hero1.name}`);
    } else {
      console.log("❌ Could not find hero with ID 1");
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testMCP();
