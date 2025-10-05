# Build stage
FROM node:20 AS build
WORKDIR /app
COPY frontend/package*.json ./
# Use npm install to avoid failing builds when lockfile is out of sync
RUN npm install --legacy-peer-deps
COPY frontend/ ./
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
RUN npm run build

# Serve stage
FROM nginx:1.25-alpine
COPY --from=build /app/build /usr/share/nginx/html
# Copy nginx config that lives alongside the frontend code
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
