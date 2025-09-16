
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
export const runAllScenarios = async () => {
  console.log("runAllScenarios starts");

    const chunkSize = 10;
    const delayBetweenChunks = 1000; // 5 seconds in milliseconds
    const scenarioEntries = Object.entries(scenarios);
    
    console.log(`Starting to process ${scenarioEntries.length} scenarios in chunks of ${chunkSize}...`);

    for (let i = 0; i < scenarioEntries.length; i += chunkSize) {
        // 1. Get the next chunk of scenarios
        const chunk = scenarioEntries.slice(i, i + chunkSize);
        console.log(`--- Processing chunk ${Math.floor(i / chunkSize) + 1} (scenarios ${i + 1} to ${i + chunk.length}) ---`);

        // 2. Process each scenario within the chunk sequentially
        for (const [scenarioName, scenarioJson] of chunk) {
            console.log(`Running Scenario: ${scenarioName}`);
            
            const game = new Game(blankScenario);
            game.loadScenario(JSON.stringify(scenarioJson));
            game.startRecording();
            const hasGameEnded = gameLoop(game);
            game.exportRecourseRecording(hasGameEnded);
        }
        console.log(`--- Finished processing chunk ---`);
        // 3. If this is not the last chunk, pause before starting the next one
        if (i + chunkSize < scenarioEntries.length) {
            console.log(`Waiting for ${delayBetweenChunks / 1000} seconds before the next chunk...`);
            await new Promise(resolve => setTimeout(resolve, delayBetweenChunks));
        }
    }

    console.log("runAllScenarios ends");
};