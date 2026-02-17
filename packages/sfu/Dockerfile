FROM oven/bun:1-alpine

WORKDIR /app

RUN apk add --no-cache python3 py3-pip make g++ py3-setuptools linux-headers

ENV PYTHON=/usr/bin/python3

COPY package.json ./
RUN bun install --production

COPY . .

CMD ["bun", "run", "start"]
