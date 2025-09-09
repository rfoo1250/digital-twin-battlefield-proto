# run_recourse.py
# this file should simulate the actions of the user on the GUI
#  but in automation, multithreading, and Python code.
# call `python scripts\simple_demo\run_recourse.py`
#  
import os
import sys
import blade
from blade.Game import Game
from blade.Scenario import Scenario
from blade.main import game_loop

# this folder stores the csv
recourse_csv_folder = "../recourse/results"
# where all test Scenarios are stored
# scenario_folder = "."
scenario_folder = "./scripts/simple_demo" # gym scenarios
# scenario_folder = "../client/src/scenarios" # client scenarios
scenario_filename = "test_mission_success.json"
# scenario_filename = "testt.json"
scenario_filename = "army_demo_1.json"
required_folder_to_be_in = "gym"

# check if the user is in gym/
if os.path.basename(os.getcwd()) != required_folder_to_be_in:
    print(f"[ERROR] Please run this script from inside the '{required_folder_to_be_in}/' directory.")
    sys.exit(1)


game = Game(
    current_scenario=Scenario(),
    record_every_seconds=3600,
    recording_export_path=recourse_csv_folder,
)
filepath = os.path.join(scenario_folder, scenario_filename)

# print(filepath)

with open(filepath, "r") as scenario_file:
    game.load_scenario(scenario_file.read())


# sim Start Recording button
game.start_recording()
# game.record_step()
# steps = 35000
# for step in range(steps):
#     env.unwrapped.pretty_print(observation)
#     game.step()
#     game.record_step()

# start game, returns bool indicating game ended on game ending conditions
has_game_ended = game_loop(game, time_compression=100, delay_ms=0) # max speed

# game.export_recording()
if (has_game_ended):
    game.export_recourse_recording(has_game_ended)
