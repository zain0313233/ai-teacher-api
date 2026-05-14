# Level and Class Fields - Documentation

## Overview
The document upload system now supports proper education level and class fields to handle different education systems.

## Fields

### 1. Level (Required)
Indicates the education level of the document.

**Options:**
- `matric` - Matriculation (9th-10th class)
- `fsc` - FSc/FA/ICS (11th-12th class)
- `bs` - Bachelor's degree (BS/BA/BBA/etc.)
- `ms` - Master's degree (MS/MA/MBA/etc.)
- `phd` - PhD level
- `competitive` - Competitive exams (CSS, PMS, NTS, etc.)

### 2. Class (Conditional)
Specific class within the level.

**Required for:**
- `matric`: Must be "9" or "10"
- `fsc`: Must be "11" or "12"

**Optional for:**
- `bs`: Can be "BS-CS-1", "BS-CS-2", "BS-EE-3", etc.
- `ms`: Can be "MS-CS-1", "MS-CS-2", etc.
- `phd`: Usually not needed
- `competitive`: Not needed

## Examples

### Example 1: Matric 10th Class Math Book
```json
{
  "level": "matric",
  "class": "10",
  "subject": "mathematics",
  "educationSystem": "punjab_board",
  "documentType": "textbook"
}
```

### Example 2: FSc Part 1 Physics Book
```json
{
  "level": "fsc",
  "class": "11",
  "subject": "physics",
  "educationSystem": "federal_board",
  "documentType": "textbook"
}
```

### Example 3: BS Computer Science Semester 3
```json
{
  "level": "bs",
  "class": "BS-CS-3",
  "subject": "data_structures",
  "educationSystem": "nust",
  "documentType": "textbook"
}
```

### Example 4: CSS Past Paper
```json
{
  "level": "competitive",
  "class": null,
  "subject": "english_essay",
  "educationSystem": "css_exam",
  "documentType": "past_paper"
}
```

## Frontend Form Fields

### HTML Form
```html
<!-- Level Selection -->
<select name="level" id="level" required>
  <option value="">Select Level</option>
  <option value="matric">Matric (9-10)</option>
  <option value="fsc">FSc/FA/ICS (11-12)</option>
  <option value="bs">Bachelor's (BS/BA/BBA)</option>
  <option value="ms">Master's (MS/MA/MBA)</option>
  <option value="phd">PhD</option>
  <option value="competitive">Competitive Exams</option>
</select>

<!-- Class Selection (shown conditionally) -->
<div id="classField" style="display: none;">
  <select name="class" id="class">
    <option value="">Select Class</option>
    <!-- Options populated based on level -->
  </select>
</div>

<script>
  const levelSelect = document.getElementById('level');
  const classField = document.getElementById('classField');
  const classSelect = document.getElementById('class');

  levelSelect.addEventListener('change', function() {
    const level = this.value;
    
    // Clear previous options
    classSelect.innerHTML = '<option value="">Select Class</option>';
    
    if (level === 'matric') {
      classField.style.display = 'block';
      classSelect.required = true;
      classSelect.innerHTML += '<option value="9">9th Class</option>';
      classSelect.innerHTML += '<option value="10">10th Class</option>';
    } else if (level === 'fsc') {
      classField.style.display = 'block';
      classSelect.required = true;
      classSelect.innerHTML += '<option value="11">11th Class (Part 1)</option>';
      classSelect.innerHTML += '<option value="12">12th Class (Part 2)</option>';
    } else if (level === 'bs') {
      classField.style.display = 'block';
      classSelect.required = false;
      classSelect.innerHTML += '<option value="BS-1">Semester 1</option>';
      classSelect.innerHTML += '<option value="BS-2">Semester 2</option>';
      classSelect.innerHTML += '<option value="BS-3">Semester 3</option>';
      classSelect.innerHTML += '<option value="BS-4">Semester 4</option>';
      classSelect.innerHTML += '<option value="BS-5">Semester 5</option>';
      classSelect.innerHTML += '<option value="BS-6">Semester 6</option>';
      classSelect.innerHTML += '<option value="BS-7">Semester 7</option>';
      classSelect.innerHTML += '<option value="BS-8">Semester 8</option>';
    } else {
      classField.style.display = 'none';
      classSelect.required = false;
    }
  });
</script>
```

### React/TypeScript Form
```typescript
import { useState } from 'react';

const DocumentUploadForm = () => {
  const [level, setLevel] = useState('');
  const [classValue, setClassValue] = useState('');

  const getClassOptions = () => {
    switch (level) {
      case 'matric':
        return [
          { value: '9', label: '9th Class' },
          { value: '10', label: '10th Class' },
        ];
      case 'fsc':
        return [
          { value: '11', label: '11th Class (Part 1)' },
          { value: '12', label: '12th Class (Part 2)' },
        ];
      case 'bs':
        return Array.from({ length: 8 }, (_, i) => ({
          value: `BS-${i + 1}`,
          label: `Semester ${i + 1}`,
        }));
      default:
        return [];
    }
  };

  const showClassField = ['matric', 'fsc', 'bs'].includes(level);
  const isClassRequired = ['matric', 'fsc'].includes(level);

  return (
    <form>
      {/* Level Selection */}
      <select 
        value={level} 
        onChange={(e) => setLevel(e.target.value)}
        required
      >
        <option value="">Select Level</option>
        <option value="matric">Matric (9-10)</option>
        <option value="fsc">FSc/FA/ICS (11-12)</option>
        <option value="bs">Bachelor's (BS/BA/BBA)</option>
        <option value="ms">Master's (MS/MA/MBA)</option>
        <option value="phd">PhD</option>
        <option value="competitive">Competitive Exams</option>
      </select>

      {/* Class Selection */}
      {showClassField && (
        <select
          value={classValue}
          onChange={(e) => setClassValue(e.target.value)}
          required={isClassRequired}
        >
          <option value="">Select Class</option>
          {getClassOptions().map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </form>
  );
};
```

## API Request Example

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('level', 'matric');
formData.append('class', '10');
formData.append('subject', 'mathematics');
formData.append('educationSystem', 'punjab_board');
formData.append('documentType', 'textbook');
formData.append('uploadMode', 'fullbook');

const response = await fetch('http://localhost:3001/api/documents/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
  body: formData,
});
```

## Validation Rules

1. **Level is always required**
2. **Class is required for matric and fsc levels**
3. **Class must be valid for the selected level:**
   - Matric: "9" or "10"
   - FSc: "11" or "12"
   - BS: "BS-1" to "BS-8" (or custom format)
   - MS: "MS-1" to "MS-4" (or custom format)
4. **Subject is required for chapter upload mode**

## Database Migration

Run this migration to update your database:

```bash
cd ai-teacher-api
npx prisma migrate dev --name add_level_class_fields
```

This will:
- Change `level` field default from "secondary" to "matric"
- Update existing records to use new level values
- Add proper validation

## Backward Compatibility

Old documents with `level: "secondary"` will be automatically mapped to:
- `level: "matric"` for 9th-10th class
- `level: "fsc"` for 11th-12th class

You can run a data migration script if needed.
