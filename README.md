<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

# NestJS AI Agent

A minimal, opinionated NestJS backend that demonstrates building an AI Agent: it connects to MongoDB, fetches customer data, optionally calls an external premium API, and synthesizes a final answer using OpenAI.

Key principles: KISS, DRY, and clear separation of concerns — the `AgentService` orchestrates, `AiService` encapsulates AI calls, and `CustomerService` encapsulates DB access.

## Features

- Mongoose integration for persistence
- Health endpoint that checks MongoDB connectivity
- Agent endpoint: fetch customer, call premium API (optional), call OpenAI and return synthesized answer
- Small AI wrapper using `openai` SDK (configurable via `OPENAI_MODEL`)

## Environment

Create a `.env` file at the project root with the values below (example):

```
MONGODB_URI=mongodb://localhost:27017/ai-agent
OPENAI_API_KEY=sk_...
OPENAI_MODEL=gpt-3.5-turbo
PREMIUM_API_URL=http://localhost:4000
PORT=3000
```

## Install

```bash
yarn install
```

## Run (development)

```bash
yarn start:dev
```

## Endpoints (Postman)

- Health: `GET /api/health`
  - Returns `{ status: 'up'|'down', mongo: { readyState, error? }, timestamp }`

- Create customer: `POST /api/customer`
  - Body (JSON):
    ```json
    {
      "name": "Test User",
      "email": "test@example.com",
      "phone": "555-0100",
      "policies": [ { "policyNumber": "P-001", "type": "auto", "coverageAmount": 50000 } ]
    }
    ```

- List customers: `GET /api/customer`

- Agent insight: `GET /api/agent/customer/:id/insight`
  - Returns `{ customer, premium, answer }` where `answer` is the assistant output (fallback if `OPENAI_API_KEY` not set).

## Testing with Postman

1. Start app: `yarn start:dev`
2. Hit `GET http://localhost:3000/api/health` to confirm DB connectivity.
3. Create a customer using `POST http://localhost:3000/api/customer`.
4. Call `GET http://localhost:3000/api/agent/customer/{_id}/insight` using `_id` from created customer.

## Notes & Next Steps

- `CustomerController` provides basic create/list routes for testing. In production you'd add pagination, authentication, and stricter validation.
- You can provide a mock `PREMIUM_API_URL` to exercise the premium path.
- Consider enabling strict startup by waiting for DB connection before `app.listen()` in `main.ts` for containerized deployments.

---

If you want, I can add: unit tests for `AgentService`, API docs (Swagger), or a simple mock premium service for local testing.
