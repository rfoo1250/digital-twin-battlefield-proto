import os
import gymnasium
import blade
from blade.Game import Game
from blade.Scenario import Scenario

# CHANGE
demo_folder = "./gym/scripts/simple_demo"

game = Game(
    current_scenario=Scenario(),
    record_every_seconds=30,
    recording_export_path=demo_folder,
)
# CHANGE
with open(f"{demo_folder}/simple_demo.json", "r") as scenario_file:
    game.load_scenario(scenario_file.read())

env = gymnasium.make("blade/BLADE-v0", game=game)

observation, info = env.reset()
env.unwrapped.pretty_print(observation)


def simple_scripted_agent(observation):
    print("army demo v1")
    # army 


for filename in os.listdir(demo_folder):
    if (
        filename.endswith(".json") and "simple_demo_t" in filename
    ) or filename.endswith(".jsonl"):
        os.remove(f"{demo_folder}/{filename}")

game.start_recording()
game.record_step()
steps = 35000
for step in range(steps):
    action = simple_scripted_agent(observation)
    observation, reward, terminated, truncated, info = env.step(action=action)
    # env.unwrapped.pretty_print(observation)
    game.record_step()

env.unwrapped.export_scenario(
    f"{demo_folder}/simple_demo_t{steps}.json"
)  # blue aircraft should be returning to base
game.export_recording()
