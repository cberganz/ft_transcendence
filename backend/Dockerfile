FROM node:17
#AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
# COPY package*.json ./
# COPY prisma ./prisma/

# # Install app dependencies
# RUN npm install

# COPY . .

# RUN npm run build

# FROM node:16

# WORKDIR /app

COPY . .

# COPY --from=builder /app/node_modules ./node_modules
# RUN true
# COPY --from=builder /app/package*.json ./
# RUN true
# COPY --from=builder /app/dist ./dist
# RUN true
RUN npm i
EXPOSE 3000

CMD [ "npm", "run", "start:migrate:dev" ]
