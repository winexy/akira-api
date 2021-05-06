FROM node:12-alpine

RUN mkdir /code
RUN chown node /code

USER node

WORKDIR /code

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install --frozen-lockfile

EXPOSE 3000

CMD ["yarn", "start:dev"]