# Past Paper Upload Fix - 422 Error Resolution

## Problem
The upload was failing with a 422 error:
```json
{
  "detail": [{
    "type": "missing",
    "loc": ["body", "year"],
    "msg": "Field required"
  }]
}
```

## Root Cause
The NestJS service was trying to send fields that the Python FastAPI backend doesn't support:
- `is_multi_year` ❌
- `year_from` ❌
- `year_to` ❌

But the Python backend **requires** these exact fields:
```python
file: UploadFile = File(...)
user_id: str = Form(...)
subject: str = Form(...)
year: int = Form(...)          # ← REQUIRED!
class_name: str = Form(...)
board: str = Form("Punjab Board")
exam_type: str = Form("final")
```

## Solution Applied

### 1. Fixed NestJS Service (`past-papers.service.ts`)
- Always sends `year` field (required by Python backend)
- For multi-year papers: uses `yearFrom` as the year value
- For single-year papers: uses the provided year
- Removed unsupported fields (`is_multi_year`, `year_from`, `year_to`)
- Added proper validation with clear error messages

### 2. What Gets Sent Now
```typescript
formData.append('file', fileStream);
formData.append('user_id', userId);
formData.append('subject', 'Mathematics');
formData.append('year', '2023');           // ✅ Always present
formData.append('class_name', '10');
formData.append('board', 'Punjab Board');
formData.append('exam_type', 'final');
```

## Testing

### Quick Test
```bash
cd ai-teacher-api
node test-upload-debug.js
```

### Full Test Flow
1. Start Python backend: `cd ai-teacher-ai-engine && python main.py`
2. Start NestJS API: `cd ai-teacher-api && npm run start:dev`
3. Start Next.js frontend: `cd ai-teacher-nextjs && npm run dev`
4. Upload a past paper through the UI

## Multi-Year Support Note
The Python backend currently doesn't support multi-year papers natively. The current implementation:
- Accepts the year range from the frontend
- Uses the starting year (`yearFrom`) for the upload
- The AI will need to detect individual years during processing

## Next Steps
If you need true multi-year support, you'll need to:
1. Update the Python FastAPI endpoint to accept `year_from` and `year_to`
2. Update the processing logic to handle year ranges
3. Or: Upload multi-year papers multiple times (once per year)
