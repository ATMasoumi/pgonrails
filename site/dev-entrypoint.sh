#!/bin/bash
set -e

echo "🚀 Starting development server setup..."

# Run migrations
echo "📦 Pushing database migrations..."
# supabase db push --yes --db-url "$DB_PRIVATE_CONNECTION_STRING"
echo "⚠️ Skipping automatic migrations to avoid TLS error. Run 'supabase db push' manually if needed."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📥 node_modules not found. Installing dependencies..."
    npm install
else
    echo "✅ node_modules found. Skipping full install."
    echo "   (Run 'docker compose exec site npm install' if you added new packages)"
fi

echo "✨ Starting Next.js..."
exec npm run dev
