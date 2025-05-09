"# imamzain-api" 

# Local dev, full reset & seed:
npx prisma migrate reset

# Only re-seed (keep existing schema/data):
npx prisma db seed

# In production/CI (never drops data):
npx prisma migrate deploy
npx prisma db seed