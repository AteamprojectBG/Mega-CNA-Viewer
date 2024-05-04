FROM node:20.12.2

WORKDIR /app
COPY package*.json ./
RUN mkdir ./node_modules
RUN chown node:node ./node_modules
RUN npm install
COPY . .
