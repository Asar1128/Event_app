FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY index.js ./
# Acts as the "test" stage: build fails if the code has a syntax error
RUN node --check index.js
EXPOSE 4000
CMD ["node", "index.js"]
