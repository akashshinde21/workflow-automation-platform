FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN npm install
EXPOSE 3001
CMD ["npm", "run", "dev", "--workspace", "@workflow/api"]
