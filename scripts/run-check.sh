#!/bin/bash

echo "=== CONTROLLO DIPENDENZE PACKAGES/AUTH ==="

# Controlla se il file package.json esiste
if [ -f "packages/auth/package.json" ]; then
    echo "✅ package.json trovato in packages/auth"
    
    # Mostra le dipendenze installate
    echo ""
    echo "📦 Dipendenze nel package.json:"
    cat packages/auth/package.json | grep -A 20 '"dependencies"'
    
    echo ""
    echo "🔍 Controllo node_modules..."
    
    # Controlla se node_modules esiste
    if [ -d "packages/auth/node_modules" ]; then
        echo "✅ node_modules trovato in packages/auth"
        
        # Controlla dipendenze specifiche
        echo ""
        echo "🔍 Controllo dipendenze specifiche:"
        
        if [ -d "packages/auth/node_modules/otplib" ]; then
            echo "✅ otplib installato"
        else
            echo "❌ otplib NON installato"
        fi
        
        if [ -d "packages/auth/node_modules/qrcode" ]; then
            echo "✅ qrcode installato"
        else
            echo "❌ qrcode NON installato"
        fi
        
        if [ -d "packages/auth/node_modules/crypto" ]; then
            echo "✅ crypto installato"
        else
            echo "⚠️  crypto è un modulo nativo di Node.js"
        fi
        
    else
        echo "❌ node_modules NON trovato in packages/auth"
        echo "💡 Esegui: cd packages/auth && pnpm install"
    fi
    
else
    echo "❌ package.json NON trovato in packages/auth"
fi

echo ""
echo "🔍 Controllo workspace root..."

# Controlla anche nel root del workspace
if [ -d "node_modules/otplib" ]; then
    echo "✅ otplib trovato nel root workspace"
else
    echo "❌ otplib NON trovato nel root workspace"
fi

if [ -d "node_modules/qrcode" ]; then
    echo "✅ qrcode trovato nel root workspace"
else
    echo "❌ qrcode NON trovato nel root workspace"
fi

echo ""
echo "=== FINE CONTROLLO ==="
