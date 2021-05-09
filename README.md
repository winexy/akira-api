# Akira API
## Installation

```bash
$ yarn
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Migrations

```bash
docker-compose exec akira-api sh

- yarn run migrate:up
- yarn run migrate:down
- yarn run migrate:latest
- yarn run migrate:rollback
```
