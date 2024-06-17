FROM node:18.9 as base

RUN apt-get update -y; apt-get install -y nano cron

WORKDIR /react
RUN npm install react react-dom create-react-app
RUN npx create-react-app argovis
WORKDIR /react/argovis
RUN npm install --force react-leaflet \
						leaflet \
						react-leaflet-draw \
						react-router-dom \
						chroma-js \
						react-autosuggest \
						react-plotly.js \
						plotly.js \
						leaflet-geometryutil \
						react-bootstrap \
						jest-canvas-mock \
                                                react-datetime
COPY argovis/src src
COPY argovis/public public
COPY argovis/package.json package.json
COPY generate_argo_sitemap.sh generate_argo_sitemap.sh 
RUN chmod 700 generate_argo_sitemap.sh
COPY crontab crontab
RUN crontab crontab

FROM base as prod
RUN npm run build
RUN npm install -g serve
CMD service cron start ; serve -s build

FROM base as dev
RUN rm /react/argovis/src/App*
CMD service cron start ; npm start
