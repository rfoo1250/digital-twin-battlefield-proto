// Does not work, need to be in Vite + React environment

import Game from "@/game/Game"
import { scenarios } from "@/utils/loadJson"

function gameLoop(
    game: Game
): boolean {
    console.log("Game loop starts");

    game.recordStep(false, true); // First line
    game.scenarioPaused = false;
    let hasGameEnded = false;

    // Simple, separated check to distinguish between code logic
    const isAlreadyOver = game.checkWinningConditions() || game.checkGameEnded();
    if (isAlreadyOver) {
        console.log("Game was already over before starting loop.");
        hasGameEnded = true;
        game.scenarioPaused = true;
        console.log("Game loop ends");
        return hasGameEnded;
    }

    while (!game.scenarioPaused && !hasGameEnded) {
        // const stepSize = timeCompression;
        // let [observation, reward, terminated, truncated, info] = stepGameForStepSize(stepSize, game);
        const [_observation, _reward, terminated, truncated, _info] = game.step();

        const status = !!terminated || !!truncated; // Coerce to boolean just in case
        if (status) {
            console.log("status: ", status);
            console.log("Game ended, located in main.ts: gameLoop()");
            console.log("Info:", { terminated, truncated });
        }
        hasGameEnded = status;
    }

    game.recordStep(false, true); // Last line
    game.scenarioPaused = true;
    console.log("Game loop ends");
    return hasGameEnded;
}


// Algorithmic recourse automation
console.log("Algorithmic recourse automation starting...");
// const blankScenario = scenarios['blank_scenario'];
// const armyDemo = scenarios['army_demo_1'];


for (const [scenarioName, scenarioJson] of Object.entries(scenarios)) {
  console.log(`--- Running Scenario: ${scenarioName} ---`);

  // It's likely you need to pass the JSON object, not its name
  const game = new Game(scenarioJson);

  // Simulate pressing the Start Recording button
  game.startRecording();
  
  // Await the result of the async gameLoop
  const hasGameEnded = gameLoop(game); // max speed

  // Export recording if the game ended, using the scenario's name for the file
  if (hasGameEnded) {
    console.log(`Scenario ${scenarioName} ended. Exporting recording...`);
    // It's good practice to pass the name for a unique filename
    game.exportRecourseRecording(hasGameEnded); 
  } else {
    console.log(`Scenario ${scenarioName} did not end as expected.`);
  }
}