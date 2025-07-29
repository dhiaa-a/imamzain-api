#!/bin/bash
echo "Building TypeScript..."
npm run build

echo "Generating Prisma client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npx prisma db seed

echo "Build complete!"