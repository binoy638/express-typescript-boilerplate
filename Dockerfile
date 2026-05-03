FROM node:24-slim

WORKDIR /app

USER root

ADD package*.json ./

RUN npm i

COPY . ./

RUN npm run build


