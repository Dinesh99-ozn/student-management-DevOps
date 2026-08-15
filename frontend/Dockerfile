FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite environment variables are provided during the production build.
ARG VITE_AUTH_API_URL=http://localhost:4001/api
ARG VITE_STUDENT_API_URL=http://localhost:4002/api
ARG VITE_ACADEMIC_API_URL=http://localhost:4003/api

ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL
ENV VITE_STUDENT_API_URL=$VITE_STUDENT_API_URL
ENV VITE_ACADEMIC_API_URL=$VITE_ACADEMIC_API_URL

RUN npm run build

FROM nginx:alpine

# Copy the React production files into Nginx.
COPY --from=build /app/dist /usr/share/nginx/html

# Configure Nginx to support React Router.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]