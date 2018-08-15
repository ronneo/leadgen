#!/bin/sh

./tools/ngrok_controller.sh start
export $(cat .env | xargs)
if [ -f .redis.env ]; then
  ./tools/redis_local.sh
  export $(cat .redis.env | xargs)
fi
NODE_ENV=dev NODE_PATH=. nodemon ./server/server.js --watch ./server --exec babel-node
