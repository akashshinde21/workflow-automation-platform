FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN npm install
EXPOSE 5173
CMD ["npm", "run", "dev", "--workspace", "@workflow/web"]
