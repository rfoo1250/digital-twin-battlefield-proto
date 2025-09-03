# Prerequisites
1. Python 3.12.3
2. pip

# Quick Start Guide
## Install BLADE
Make sure your virtual environment in the folder `gym` is created and activated.

1. Install the repository using `pip install .` Anytime you make changes to the files in the project folder, you need to reinstall the package using `pip install .`. Alternatively, use `pip install -e .` to install the package in editable mode. After doing this you can change the code without needing to continue to install it. 
2. [gymnasium](https://gymnasium.farama.org/) is a dependency for users who want to use BLADE as a Gym environment. In this case, use `pip install .[gym]` or `pip install -e .[gym]` for setup.

## Run recourse
This part runs the automatic script to generate the outcome for algorithmic recourse.
<!-- TODO: update the run command to have the folder name or smthg -->
1. call `python run_recourse.py`

## Run a demo (Panopticon AI)
This part is for running a pre-defined demo from Panopticon AI to simulate using the Gymnasium environment.
1. Run the provided demo in `scripts/simple_demo/demo.py`.
2. The demo will output a scenario file that can be viewed using the frontend GUI.
