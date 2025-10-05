# Build stage
FROM node:20 AS build
WORKDIR /app

# Speed up npm, smaller telemetry
ENV NODE_ENV=production \
    GENERATE_SOURCEMAP=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false

# Install deps with a cacheable layer
COPY frontend/package*.json ./
# Use npm install for resilience; add faster flags for MVP builds
RUN npm install --legacy-peer-deps --no-audit --no-fund --prefer-offline --no-optional

# Copy source and build
COPY frontend/ ./
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
RUN npm run build

# Serve stage
FROM nginx:1.25-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
