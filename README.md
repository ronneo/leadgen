Leadgen Bot
====

It helps you to collect leads with mssenger conversation.

Deploy to heorku
====

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/ronneo/leadgen.git)

Local developing
====

install dependencies first

* `ngrok`: install it with `brew cask install ngrok`

steps
1. `npm install`.
2. `cp sample/dot.env.sample .env`, modify app id and app secret inside to be yours, leave `HEROKU_LOCAL_URL` variable as is, no need to worry.
3. `./tools/gen_local_cert.sh` to generate your server key and crt file, please do anwser all questions, can be fake info.
4. `cp sample/data/question_flow_default.json var/data/` if you do not have any questions from your own.
5. Enable API access in your app settings: In app dashboard, go to Settings → Advanced, scroll down and find the “Allow API Access to App Settings”, toggle to enable.
6. `heroku local` to start the server
7. go to `https://localhost:5000` for the setup UI, connect your page.
8. go to your bot for testing.

Local developing with Redis
====

install redis first

* `brew install redis`

steps
1. `npm install`.
2. `cp sample/dot.env.sample .env`, modify app id and app secret inside to be yours, leave `HEROKU_LOCAL_URL` variable as is, no need to worry.
3. `./tools/gen_local_cert.sh` to generate your server key and crt file, please do anwser all questions, can be fake info.
4. `cp sample/dot.redis.env.sample .redis.env`, do not modify anything
5. Enable API access in your app settings: In app dashboard, go to Settings → Advanced, scroll down and find the “Allow API Access to App Settings”, toggle to enable.
6. `heroku local` to start the server
7. go to `https://localhost:5000` for the setup UI, connect your page.
8. go to your bot for testing.

With redis how to check the data
1. `cat .redis.env` to find out redis PORT
2. `redis-cli -p $PORT` to connect your redis to check data

With redis how to import sample question
1. go to UI, connect your page, then go to tab 'Manage Questions'
2. open `sample/data/question_flow_default.json`, copy everything into clipboard
3. back to UI, click on any place of the default question card, paste, you will see popup dialog helping you import questions

