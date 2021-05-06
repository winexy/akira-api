FROM node:12-alpine

RUN mkdir /code
RUN chown node /code

USER node

WORKDIR /code

COPY --chown=node:node package.json yarn.lock ./

RUN npm i -g @nestjs/cli
RUN yarn install --frozen-lockfile

COPY --chown=node:node . ./

EXPOSE 3000

CMD ["yarn", "start:dev"]