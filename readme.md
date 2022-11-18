# Express TypeScript Boilerplate and Starter
🚀 Boilerplate and Starter Express and TypeScript ⚡️ Made with developer experience first: TypeScript + ESLint + Prettier + Husky + Lint-Staged + VSCode + Docker + Docker-Compose + Jest

Clone this project and use it to create your own Express project.
## Features

- Type checking [TypeScript](https://www.typescriptlang.org/)
- Linter with [ESLint](https://www.npmjs.com/package/eslint)
- Code Formatter with [Prettier](https://www.npmjs.com/package/prettier)
- [Husky](https://www.npmjs.com/package/husky) for Git Hooks
- [Lint-staged](https://www.npmjs.com/package/lint-staged) for running linters on Git staged files
- Testing with [Jest](https://www.npmjs.com/package/jest)
- [Docker](https://www.docker.com/) with seperate config for development and Production environment
- [Zod](https://www.npmjs.com/package/zod) for validation
- Out of the box [mongoDB](https://www.mongodb.com/) support
- [Winston](https://www.npmjs.com/package/winston) for logging 
- [hapi/boom](https://www.npmjs.com/package/@hapi/boom) for formatting error messages


## How to Run

Clone the project

```bash
  git clone --depth=1 https://github.com/binoy638/Express-Typescript-Boilerplate.git my-project-name
```

Go to the project directory

```bash
  cd my-project-name
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```


## With Docker

Clone the project

```bash
  git clone --depth=1 https://github.com/binoy638/Express-Typescript-Boilerplate.git my-project-name
```

Go to the project directory

```bash
  cd cd my-project-name
```

Start the server with docker-compose

```bash
  docker-compose -f docker-compose.dev.yml up
```
