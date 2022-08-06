FROM node:16

WORKDIR /app

USER root

ADD package*.json ./

RUN npm i

COPY . ./

RUN npm install 


RUN npm run build