
FROM node:lts

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

COPY .env ./

RUN yarn build

CMD [ "node", "dist/main.js" ]
