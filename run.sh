#!/bin/sh

npm run migrate-deploy
npm run prisma-generate
npm run build
NODE_ENV=production exec node .
