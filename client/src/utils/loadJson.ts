
/**
 * This function uses Vite's glob import feature to load all .json files
 * from the scenarios directory.
 *
 * The `{ eager: true }` option imports the modules directly,
 * so you don't have to deal with async functions.
 */
// const scenarioModules = import.meta.glob('../scenarios/*.json', { eager: true });
const scenarioModules = import.meta.glob('../../../recourse/scenarioJsonFiles/*.json', { eager: true });

// console.log("Found scenario modules:", scenarioModules);

// The 'scenarioModules' object looks like this:
// {
//   '@/scenarios/blank_scenario.json': { ...json content ... },
//   '@/scenarios/army_demo_1.json': { ...json content ... },
//   ...etc
// }

// We can process this into a cleaner object for easier access
export const scenarios: Record<string, any> = {};

for (const path in scenarioModules) {
  const module: any = scenarioModules[path];
  
  // Extract the filename (e.g., "blank_scenario") from the path
  const scenarioName = path
    .split('/')
    .pop()
    ?.replace('.json', '');

  if (scenarioName) {
    // The `default` property holds the JSON content when importing JSON files
    scenarios[scenarioName] = module.default;
  }
}

// Now you have a single object 'scenarios' that you can import anywhere
// scenarios['blank_scenario'] will contain the content of blank_scenario.json