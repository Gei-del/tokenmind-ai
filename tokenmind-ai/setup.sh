#!/bin/bash
# ============================================================
# TokenMind AI — Script de setup local
# Uso: chmod +x setup.sh && ./setup.sh
# ============================================================

set -e  # Salir si cualquier comando falla

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       TokenMind AI — Setup Local       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# ─── Verificar Node.js ────────────────────────────────────────────────────────
echo -e "${BLUE}▶ Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js no encontrado. Instálalo desde https://nodejs.org${NC}"
  exit 1
fi
NODE_VER=$(node -v | cut -c2- | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo -e "${RED}✗ Se requiere Node.js 18+. Versión actual: $(node -v)${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) OK${NC}"

# ─── Instalar dependencias raíz ───────────────────────────────────────────────
echo ""
echo -e "${BLUE}▶ Instalando dependencias raíz...${NC}"
npm install --silent
echo -e "${GREEN}✓ Dependencias raíz instaladas${NC}"

# ─── Setup Frontend ───────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}▶ Configurando frontend...${NC}"
cd frontend
npm install --silent
echo -e "${GREEN}✓ Dependencias frontend instaladas${NC}"

if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  echo -e "${YELLOW}⚠ Creado frontend/.env.local — edítalo con tus credenciales de Auth0${NC}"
else
  echo -e "${GREEN}✓ frontend/.env.local ya existe${NC}"
fi
cd ..

# ─── Setup Backend ────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}▶ Configurando backend...${NC}"
cd backend
npm install --silent
echo -e "${GREEN}✓ Dependencias backend instaladas${NC}"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${YELLOW}⚠ Creado backend/.env — edítalo con tus credenciales de Auth0${NC}"
else
  echo -e "${GREEN}✓ backend/.env ya existe${NC}"
fi
cd ..

# ─── Generar AUTH0_SECRET ─────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}▶ Generando AUTH0_SECRET...${NC}"
AUTH0_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo -e "${GREEN}✓ AUTH0_SECRET generado:${NC}"
echo -e "   ${YELLOW}$AUTH0_SECRET${NC}"
echo -e "   (Cópialo en frontend/.env.local como AUTH0_SECRET)"

# ─── Resumen ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ¡Setup completado!                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Próximos pasos:"
echo -e "  1. Editar ${YELLOW}frontend/.env.local${NC} con tus credenciales Auth0"
echo -e "  2. Editar ${YELLOW}backend/.env${NC} con tus credenciales Auth0"
echo -e "  3. Ejecutar: ${YELLOW}npm run dev${NC} (inicia frontend + backend)"
echo ""
echo -e "URLs:"
echo -e "  Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "  Backend:  ${BLUE}http://localhost:4000${NC}"
echo -e "  Health:   ${BLUE}http://localhost:4000/health${NC}"
echo ""
echo -e "Documentación: ${BLUE}DEPLOY.md${NC}"
echo ""
