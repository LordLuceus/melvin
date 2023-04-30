npx typeorm-ts-node-esm migration:generate src/migrations/$1 -d src/DataSource.ts && npx typeorm-ts-node-esm migration:run -d src/DataSource.ts
