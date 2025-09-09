# main.py
# The purpose of this code is to simualate the `step()` function
#  in ScenarioMap.py
# So, running `run_recourse.py` would not need to structure and handle
#  the main game loop

import time
import blade
from blade.Game import Game
from blade.Scenario import Scenario

# helper functions
def step_game_for_step_size(step_size: int, game: Game):
    steps = 1
    _observation, _reward, terminated, truncated, _info = game.step("")
    while(steps < step_size):
        _observation, _reward, terminated, truncated, _info = game.step("")
        steps += 1
    
    return _observation, _reward, terminated, truncated, _info

# game main loop, should simulate play button
def game_loop(game: Game, time_compression: int = 100, delay_ms: int = 0):
    if not isinstance(game, Game):
        raise TypeError(f"Expected Game instance, got {type(game)}")
    print("Game loop starts")

    game.record_step(limit_flag=False, force=True) # first line
    game.scenario_paused = False
    has_game_ended = False

    # simple, separated check to distinguish between code logic
    is_already_over = game.check_winning_conditions() or game.check_game_ended()
    if is_already_over:
        print("Game was already over before starting loop.")
        has_game_ended = True
        game.scenario_paused = True
        print("Game loop ends")
        
        return has_game_ended

    while not game.scenario_paused and not has_game_ended:
        # step_size = time_compression
        # _observation, _reward, terminated, truncated, _info = step_game_for_step_size(step_size, game)
        _observation, _reward, terminated, truncated, _info = game.step("")

        status = bool(terminated) or bool(truncated)
        if status:
            print("status: ", status)
            print("Game ended, located in main.py: game_loop()")
            print("Info:", {"terminated": terminated, "truncated": truncated})
        has_game_ended = status
        # print("gameEnded: ", game_ended)
        if delay_ms > 0:
            time.sleep(delay_ms / 1000.0)

    game.record_step(limit_flag=False, force=True) # last line
    game.scenario_paused = True
    print("Game loop ends")
    return has_game_ended
