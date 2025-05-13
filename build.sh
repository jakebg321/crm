#!/bin/bash

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build the Next.js app
npx next build --no-lint
