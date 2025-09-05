// Does not work, need to be in Vite + React environment

import Game from "@/game/Game"
import Scenario from "@/game/Scenario"
import { scenarios } from "@/utils/loadJson"

const blankScenario = new Scenario({
    id: "None",
    name: "New Scenario",
    startTime: 1699073110,
    duration: 14400,
    });

function gameLoop(
    game: Game
): boolean {
    console.log("Game loop starts");

    game.scenarioPaused = false;
    game.recordingScenario = true;
    game.recordStep(false, true); // First line
    game.recordingScenario = false;
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

    game.recordingScenario = true;
    game.recordStep(false, true); // Last line
    game.recordingScenario = false;
    game.scenarioPaused = true;
    console.log("Game loop ends");
    return hasGameEnded;
}

// const blankScenario = scenarios['blank_scenario'];
// const armyDemo = scenarios['army_demo_1'];
export const runAllScenarios = () => {
  console.log("runAllScenarios starts");
  for (const [scenarioName, scenarioJson] of Object.entries(scenarios)) {
    console.log(`--- Running Scenario: ${scenarioName} ---`);
    console.log("scenarioJson", scenarioJson);
    
    const game = new Game(blankScenario);
    game.loadScenario(JSON.stringify(scenarioJson));
    game.startRecording();
    const hasGameEnded = gameLoop(game);
    game.exportRecourseRecording(hasGameEnded); 
    
  }
  console.log("runAllScenarios ends");
};