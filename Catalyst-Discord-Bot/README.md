# Catalyst-Discord-Bot

## Installation

### Requirements

- [Node/NodeJS](https://nodejs.org/en/) - Be sure to check the box that says "Automatically install the necessary tools" when you're running the installation wizard

**1)** Head over to [the download page](https://github.com/Mirasaki/ttett-discord-bot/releases/)

**2)** Download either the `zip` or `zip.gz` source code

**3)** Extract it using [your favorite zip tool](https://www.rarlab.com/download.htm)

**4)** Open the folder containing your recently extracted files

**5)** Open a console/terminal/shell prompt in this directory

- Run `npm i --include-dev` to install all dependencies

### ALL CONFIGURATION IS DONE IN THE `/config/` FOLDER

**6)** Copy and paste `.env.example` from `config/`, and rename it to `.env` located in `config/.env`

- Provide all your configuration values in this file
  - Get a Bot Token from [the Discord developer portal](https://www.discord.com/developers)
- Also provide the values in `config/config.json`

**7)** Use `node .` to start the application or `npm run start:dev` if you have `nodemon` installed for automatic restarts on changes
