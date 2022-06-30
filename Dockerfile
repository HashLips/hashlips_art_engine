FROM node:lts

COPY ./ /app
RUN apt-get update -y && apt-get update -y && apt-get install yarn build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev -y
WORKDIR /app
RUN npm audit fix
RUN npm install
RUN npm run build
CMD bash