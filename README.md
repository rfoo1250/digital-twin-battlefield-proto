# Digital Twin

## Quick Start

For a quick start of the Digital Twin project, please follow these instructions

### Manual Setup

<!-- If you prefer to set up the environment manually, follow the steps below. -->

First, we will need a virtual environment to start with. We will make this venv in `gym` since it can be used by the `gym` folder and make the node.js virtual environment in `client`. 

1.  **Navigate to the backend directory:**
    ```bash
    cd <project-name>/gym
    ```

2.  **Create a Python virtual environment:**
    ```bash
    python -m venv venv
    ```

3.  **Activate the virtual environment:**
    * **Windows (Command Prompt/PowerShell):**
        ```powershell
        .\venv\Scripts\activate
        ```
    * **macOS/Linux (Bash/Zsh):**
        ```bash
        source venv/bin/activate
        ```

4.  **Install the required Python packages:**
    ```bash
    pip install .[gym]
    pip install nodeenv
    ```

The client requires a **Node.js** version compatible with `>=20.0.0 <=23.9.0` and an **npm** version compatible with `9.6.3 || >=10.5.0 <=10.9.2`. The `nodeenv` package will install a specific version (`--node=20.19.4 --npm=10.8.2`) to ensure consistency.


1.  **Navigate to the client directory:**
    ```bash
    cd <project-name>/client
    ```

2.  **Create and activate the Node.js virtual environment:**
    * First, ensure your Python virtual environment (from the backend setup) is active so the `nodeenv` command is available.
    * Run the following command to create the environment:
        ```bash
        nodeenv --node=20.19.4 --npm=10.8.2 client_venv/
        ```
        > **Note:** On Windows, it is safe to ignore the error message: `Error: Failed to create nodejs.exe link`.

3.  **Activate the Node.js environment:**
    * **Windows (Command Prompt/PowerShell):**
        ```powershell
        .\client_venv\Scripts\activate
        ```
    * **macOS/Linux (Bash/Zsh):**
        ```bash
        source client_venv/bin/activate
        ```

4.  **Install npm packages:**
    ```bash
    npm install
    ```
    If you encounter any issues with package vulnerabilities, run the following command to attempt an automatic fix:
    ```bash
    npm audit fix
    ```

### Starting Development

To begin working, you will need to navigate to `<project-name>/client` and activate the Node.js environment.
Then, run
```bash
npm run standalone
```

## Documentation

The documentation for this Digital Twin project is as follows:
- [Design Documentation](https://docs.google.com/document/d/13I3vo_xWJPcEjBS7f4XPh79qed9hrBFgX0KQlmyAhu0/edit?usp=sharing)
- [Code Documentation](https://docs.google.com/document/d/1fFs3nLwANOcGPW7UW92hnO8h_3fxLdZ_TwPN8es20ao/edit?usp=sharing)

For specific READMEs in `client` and `gym`, they are located in:
- [gym\README.md](.\gym\README.md)
- [client\README.md](.\client\README.md)

For the official documentation for Panopticon AI, please see the [docs](https://docs.panopticon-ai.com/) for full details.

## Licenses

This project is derived from Panopticon AI, which is licensed under the [Apache License 2.0](https://github.com/Panopticon-AI-team/panopticon/blob/main/LICENSE).
