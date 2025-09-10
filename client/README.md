# GUI / BLADE

Client/gui for Digital Twin.

> For information reagrding the original Panopticon AI code, please review the [client project structure](https://github.com/Panopticon-AI-team/panopticon/blob/main/CONTRIBUTING.md#client) to get familiar with the folder and file organization and their intended context.

---

## Table of Contents

- [Installation](#installation)
  - [Clone Repository](#clone-repository)
  - [Quick Start without Server](#quick-start)
  - [Start Development Server](#start-development-server)

---

## [Installation](#installation)

Assuming the reader has not cloned nor started with the Quick Start guide at the [initial README.md](./README.md). If not, please navigate to [npm-installation](#npm-installation).

### [Clone Repository](#clone-repository)

```bash
git clone git@git@github.com:rfoo1250/digital-twin-proto.git
```

```bash
cd <project-name>/client
```


### [NPM Installation](#npm-installation)

```bash
npm install
```


### [Gemini Key](#get-gemini-key)

To utilize the in-built chatbot, an .env file must be created and inputted with the user's Gemini API Key, obtainable for free from [here](https://aistudio.google.com/apikey). Then, click on "Create API key" to generate your own API key, and assign it to the variable "VITE_GEMINI_API_KEY".

Example:
```
VITE_GEMINI_API_KEY=ebd8a4e5-74a6-4995-be49-871ebdad9629
```

*Note: it is advisible to use a non-institutional Google account, since the institution might restrict access for API keys.*


### [Quick Start without Server](#quick-start)

To run the client without a server:
```bash
npm run standalone
```


### [Start Development Server](#start-development-server)

```bash
npm run start
```
