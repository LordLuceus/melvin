#!/bin/sh

npm run migrate-deploy
npm run prisma-generate
exec node .
