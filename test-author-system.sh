#!/bin/bash

echo "🧪 Testing Author Management System..."

# Test if server is running
echo "📡 Testing server connection..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server not running. Run 'npm run dev' first!"
    exit 1
fi

# Test setup endpoint
echo "📋 Running database setup..."
SETUP_RESPONSE=$(curl -s -X POST http://localhost:3001/api/admin/setup)
echo "Setup response: $SETUP_RESPONSE"

# Test authors API
echo "📚 Testing authors API..."
AUTHORS_RESPONSE=$(curl -s http://localhost:3001/api/admin/authors)
if [[ $AUTHORS_RESPONSE == *"authors"* ]]; then
    echo "✅ Authors API working"
else
    echo "❌ Authors API failed: $AUTHORS_RESPONSE"
fi

# Test admin page
echo "🔐 Testing admin interface..."
ADMIN_RESPONSE=$(curl -s http://localhost:3001/admin/authors | head -1)
echo "Admin page response: $ADMIN_RESPONSE"

# Test public page
echo "🌍 Testing public authors page..."
PUBLIC_RESPONSE=$(curl -s http://localhost:3001/authors | head -1)
echo "Public page response: $PUBLIC_RESPONSE"

echo ""
echo "🎉 Test complete! Check the responses above."
echo "📝 Next steps:"
echo "   1. Visit http://localhost:3001/admin (password: Robin)"
echo "   2. Click 'Authors' in sidebar"
echo "   3. Try creating a new author"
echo "   4. Test image upload"
echo "   5. Check public page at http://localhost:3001/authors"