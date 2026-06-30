# Hermes Mission Control - Docker 部署脚本
$dockerDir = "D:/dsoftware/docker/hermes-mission-control"

# 创建 Dockerfile
$dockerfile = @"
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "server.js"]
"@

Set-Content -Path "$dockerDir/Dockerfile" -Value $dockerfile
Write-Host "✓ Dockerfile created"

# 创建 docker-compose.yml
$compose = @"
version: '3.8'
services:
  mission-control:
    build: .
    container_name: hermes-mission-control
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:***@postgres:5432/hermes
      - INTERNAL_API_SECRET=hermes...26
    depends_on:
      postgres:
        condition: service_healthy
  postgres:
    image: postgres:16-alpine
    container_name: hermes-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=***      - POSTGRES_DB=hermes
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
volumes:
  postgres_data:
"@

Set-Content -Path "$dockerDir/docker-compose.yml" -Value $compose
Write-Host "✓ docker-compose.yml created"

# 创建 .env 文件
$env = @"
DATABASE_URL=postgresql://postgres:***@postgres:5432/hermes
INTERNAL_API_SECRET=hermes...26
POSTGRES_USER=postgres
POSTGRES_PASSWORD=***"@

Set-Content -Path "$dockerDir/.env" -Value $env
Write-Host "✓ .env created"

Write-Host "`n✓ All files created! Run: cd $dockerDir && docker-compose up -d --build"
