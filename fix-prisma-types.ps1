# Fix Prisma TypeScript Types
# Run this if you get "property does not exist" errors after schema changes

Write-Host "Fixing Prisma TypeScript types..." -ForegroundColor Cyan

# Step 1: Delete Prisma client cache
Write-Host "`n1. Deleting Prisma client cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\@prisma\client -ErrorAction SilentlyContinue

# Step 2: Regenerate Prisma client
Write-Host "`n2. Regenerating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# Step 3: Rebuild TypeScript
Write-Host "`n3. Rebuilding TypeScript..." -ForegroundColor Yellow
npm run build

Write-Host "`n✅ Done! Now restart VS Code:" -ForegroundColor Green
Write-Host "   1. Press Ctrl+Shift+P" -ForegroundColor White
Write-Host "   2. Type 'Reload Window'" -ForegroundColor White
Write-Host "   3. Press Enter" -ForegroundColor White
Write-Host "`nOr close and reopen VS Code." -ForegroundColor White
