FROM node:latest

ARG PORT=5000

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE $PORT

ENTRYPOINT  npm start
