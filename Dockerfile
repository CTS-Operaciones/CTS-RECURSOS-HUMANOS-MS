FROM node:20.19.1-alpine3.21

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

RUN pnpm add file:/shared/entities-ms

COPY . .

EXPOSE 3020

CMD ["sh", "-c", "pnpm add /shared/entities-ms"]
# CMD ["pnpm", "start:dev"]