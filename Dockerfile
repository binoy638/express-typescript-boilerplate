FROM node:20.10.0-alpine

WORKDIR /app

USER root

ADD package*.json ./

RUN npm i

COPY . ./

RUN npm run build