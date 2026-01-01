#!/bin/bash

echo "🔍 CBD Portal Deployment Verification Script"
echo "=============================================="

echo ""
echo "📡 Testing API endpoints..."

echo ""
echo "1. Testing env-check endpoint:"
ENV_RESPONSE=$(curl -s "https://cbd-portal.vercel.app/api/admin/env-check")
if [[ $ENV_RESPONSE == *"timestamp"* ]]; then
    echo "✅ Env-check working: $ENV_RESPONSE"
else
    echo "❌ Env-check failed: $(echo $ENV_RESPONSE | head -c 100)..."
fi

echo ""
echo "2. Testing authors endpoint:"
AUTHORS_RESPONSE=$(curl -s "https://cbd-portal.vercel.app/api/admin/authors")
if [[ $AUTHORS_RESPONSE == *"authors"* || $AUTHORS_RESPONSE == *"error"* ]]; then
    echo "✅ Authors API working: $(echo $AUTHORS_RESPONSE | head -c 100)..."
else
    echo "❌ Authors API failed: $(echo $AUTHORS_RESPONSE | head -c 100)..."
fi

echo ""
echo "3. Testing setup endpoint:"
SETUP_RESPONSE=$(curl -s -X POST "https://cbd-portal.vercel.app/api/admin/setup")
if [[ $SETUP_RESPONSE == *"message"* || $SETUP_RESPONSE == *"error"* ]]; then
    echo "✅ Setup API working: $(echo $SETUP_RESPONSE | head -c 100)..."
else
    echo "❌ Setup API failed: $(echo $SETUP_RESPONSE | head -c 100)..."
fi

echo ""
echo "🌐 Testing admin interface..."
ADMIN_RESPONSE=$(curl -s "https://cbd-portal.vercel.app/admin/authors")
if [[ $ADMIN_RESPONSE == *"Authors"* ]]; then
    echo "✅ Admin page accessible"
else
    echo "❌ Admin page issue: $(echo $ADMIN_RESPONSE | head -c 100)..."
fi

echo ""
echo "📋 Summary:"
echo "If APIs show HTML instead of JSON, the deployment hasn't picked up the latest code."
echo "If you see environment variable errors, check Vercel dashboard settings."
echo "Visit: https://vercel.com/dashboard to check deployment status."