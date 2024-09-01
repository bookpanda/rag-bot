# RAG-bot

Making a bot that can **leverage chat context** with **RAG** to generate consistent responses.

## Stack

- discordjs
- chatgpt
- pgvector

## Getting Started

### Prerequisites

- 💻
- bun
- node 20
- [discord bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)

### Installation

1. Clone this repo
2. Copy `.env.template` and paste it in the same directory as `.env` and fill in the values.
3. Copy `prompt_config.example.json` in `./src/config` and paste it in the same directory as `prompt_config.json` and fill in the values.
4. Download dependencies by `bun i`

### Running

1. For the first time, run `bun deploy-commands` to deploy the commands to the discord server.
2. Run `docker-compose up -d` or `bun dev`
