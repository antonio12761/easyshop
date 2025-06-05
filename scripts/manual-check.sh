#!/bin/bash

echo "=== CONTROLLO MANUALE DIPENDENZE ==="

# Vai nella directory del progetto
cd /Users/antoniocolaizzi/Documents/App-Next/revup-shopping

echo "📍 Directory corrente: $(pwd)"

echo ""
echo "🔍 Controllo se packages/auth esiste:"
if [ -d "packages/auth" ]; then
    echo "✅ packages/auth trovato"
    echo "📁 Contenuto packages/auth:"
    ls -la packages/auth/
    
    echo ""
    echo "📦 Controllo package.json:"
    if [ -f "packages/auth/package.json" ]; then
        echo "✅ package.json trovato"
        echo "📋 Dipendenze:"
        cat packages/auth/package.json
    else
        echo "❌ package.json non trovato"
    fi
    
else
    echo "❌ packages/auth NON trovato"
    echo "📁 Contenuto packages/:"
    ls -la packages/ 2>/dev/null || echo "Directory packages non esiste"
fi

echo ""
echo "🔍 Controllo node_modules nel root:"
if [ -d "node_modules" ]; then
    echo "✅ node_modules root trovato"
    
    # Controlla dipendenze specifiche nel root
    if [ -d "node_modules/otplib" ]; then
        echo "✅ otplib trovato nel root"
    else
        echo "❌ otplib NON trovato nel root"
    fi
    
    if [ -d "node_modules/qrcode" ]; then
        echo "✅ qrcode trovato nel root"
    else
        echo "❌ qrcode NON trovato nel root"
    fi
    
else
    echo "❌ node_modules root NON trovato"
fi

echo ""
echo "📋 Controllo pnpm workspace:"
if [ -f "pnpm-workspace.yaml" ]; then
    echo "✅ pnpm-workspace.yaml trovato"
    echo "📄 Contenuto:"
    cat pnpm-workspace.yaml
else
    echo "❌ pnpm-workspace.yaml non trovato"
fi

echo ""
echo "=== FINE CONTROLLO MANUALE ==="
