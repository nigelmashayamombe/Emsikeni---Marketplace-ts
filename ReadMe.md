# Step 1: format and generate client
npx prisma format
npx prisma generate

# Step 2: run first migration
npx prisma migrate dev --name init

# Step 3: view database
npx prisma studio

# Step 4: future schema changes
npx prisma migrate dev --name some_change


# Run the project
npm run dev 

# http://localhost:3000/docs/