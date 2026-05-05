# syntax=docker/dockerfile:1
FROM node:20-slim

LABEL maintainer="Nathan Shepherd <nathan@shepherd217.com>"
LABEL description="Agent-native music generation — write Tone.js, render to MP3"
LABEL org.opencontainers.image.source="https://github.com/Shepherd217/TuneFrames"

# Install FFmpeg and Chromium dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    chromium \
    chromium-sandbox \
    libglib2.0-0 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

# Set Chromium path for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_ARGS="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node deps (skip Puppeteer browser download — we use system Chromium)
RUN npm install --ignore-scripts

# Copy source
COPY src/ src/
COPY registry/ registry/
COPY skills/ skills/

# Install globally so `tuneframes` CLI is on PATH
RUN npm link

# Non-root user for safety
RUN useradd --create-home --shell /bin/bash agent \
    && chown -R agent:agent /app
USER agent

# Default command
ENTRYPOINT ["tuneframes"]
CMD ["--help"]