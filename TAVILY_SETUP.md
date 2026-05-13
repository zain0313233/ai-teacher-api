# Tavily Web Search Setup Guide

## What is Tavily?

Tavily is a real-time web search API designed for AI applications. It provides accurate, up-to-date information from the web, which is essential for our global AI pattern system.

## Why We Need It

Our AI Pattern Assistant needs to support ALL education boards worldwide (Punjab Board, CBSE, GCSE, AP, IB, etc.). Instead of hardcoding patterns that become outdated, we use:

1. **Database Cache** - Fast retrieval of previously searched patterns
2. **Tavily Web Search** - Real-time search when cache misses
3. **AI Parsing** - Convert search results into structured pattern JSON

## How to Get Tavily API Key

1. Visit [https://tavily.com](https://tavily.com)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key
5. Add it to `.env` file:

```env
TAVILY_API_KEY=tvly-your-actual-api-key-here
```

## Free Tier Limits

- 1,000 searches per month (free tier)
- Perfect for development and testing
- Upgrade available for production

## How It Works

```
User: "Create Punjab Board Math pattern"
     ↓
1. Detect Context (board, subject, class, year)
     ↓
2. Check Database Cache
     ↓
3. If cache miss → Tavily Web Search
     ↓
4. AI parses search results into JSON
     ↓
5. Save to cache (expires in 30 days)
     ↓
6. Return pattern to user
```

## Testing

Once you add your API key, test with:

```bash
# Start the server
npm run start:dev

# Test with AI Pattern Assistant in frontend
# Try: "Punjab Board Class 10 Math"
# Try: "CBSE Class 12 Physics"
# Try: "GCSE Chemistry"
```

## Cache Table

The system uses a `pattern_cache` table to store patterns:

```prisma
model PatternCache {
  id          String   @id @default(uuid())
  board       String
  country     String?
  subject     String
  class       String
  year        String
  pattern     Json
  cachedAt    DateTime @default(now())
  expiresAt   DateTime // 30 days from cachedAt
}
```

## Benefits

✅ Always up-to-date patterns (web search)
✅ Fast retrieval (database cache)
✅ Global support (any board, any country)
✅ No manual updates needed
✅ Automatic cache expiry (30 days)

## Fallback Behavior

If Tavily API key is missing or search fails:
- System falls back to AI's built-in knowledge
- Warning logged in console
- Pattern still generated (may be less accurate)
