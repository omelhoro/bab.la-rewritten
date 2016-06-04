FROM node:6

RUN mkdir /app
ENV NODE_ENV production
WORKDIR /app

RUN npm install http-server -g --loglevel silent

COPY ./package.json /app
RUN npm install --loglevel silent


COPY ./bower.json /app
RUN npm run bower

COPY ./ /app
RUN npm run build:prod

CMD ["http-server","public","-p 5000"]

EXPOSE 5000
