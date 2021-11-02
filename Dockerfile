FROM node:12-slim

WORKDIR /usr/src/app

COPY --chown=node:node package.json package-lock.json* ./

RUN npm install --no-optional && npm cache clean --force

COPY . .

EXPOSE 5000

CMD [ "npm", "start" ]