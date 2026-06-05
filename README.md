# Lotto Global 🌍

**Play the world's biggest lotteries**

International lottery platform built with React. Deployed on a foreign VPS for global reach.

## Quick Start

```bash
npm install
npm run build
```

## Deploy

```bash
npm run deploy
```

This builds production assets and syncs them to the Frankfurt VPS.

## Stack

- React 18 (UMD + esbuild transpile)
- Vanilla CSS (modular, minified)
- Caddy (reverse proxy, compression, caching)
- Debian VPS (Frankfurt, EU)

## Domain

Point your domain A record to: `38.87.116.237`

Then update `Caddyfile` with your domain for automatic HTTPS.
