FROM node:18-alpine AS builder

WORKDIR /app

# copy package manifest first for better caching
COPY package.json package-lock.json* ./

RUN npm install --silent

# copy rest of frontend sources and build
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
