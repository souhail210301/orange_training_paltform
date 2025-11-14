# Testing AI PDF Generation

## Quick Test Script

To test the AI PDF generation feature, follow these steps:

### 1. Check if server is running
The server should show:
```
MongoDB connected !
Server running on port 5000
```

### 2. Test with a catalogue ID

Get a catalogue ID from your database. You can use MongoDB Compass or run:
```javascript
// In MongoDB shell or Compass
db.catalogues.findOne({}, {_id: 1, title: 1})
```

### 3. Test the endpoint with curl

```powershell
# First, get your JWT token (from browser localStorage after logging in)
# Then run:

curl -X GET "http://localhost:5000/api/ai/catalogue/YOUR_CATALOGUE_ID/plan-pdf" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -o test-plan.pdf
```

Replace:
- `YOUR_CATALOGUE_ID` with an actual catalogue ID
- `YOUR_JWT_TOKEN` with your authentication token

### 4. Check server console

Watch the server terminal for logs. You should see:
```
Generating AI training plan PDF for catalogue: [Title]
OpenAI API key not configured. Using fallback plan generator.
```

### 5. Expected Behavior

**Without OPENAI_API_KEY:**
- PDF still generates (using template fallback)
- Server logs warning about missing API key
- PDF downloads successfully
- Content is basic template

**With OPENAI_API_KEY:**
- PDF generates with AI content
- Takes 5-10 seconds
- Content is detailed and intelligent
- Server logs success

### 6. Common Issues

**Error: "Failed to generate PDF for catalogue"**

Check server console for actual error. Common causes:

1. **Catalogue not found** - Invalid catalogue ID
2. **OpenAI error** - Invalid API key (if configured)
3. **PDF generation error** - Missing pdfkit package

**Error: "Unauthorized"**

- Missing or invalid JWT token
- Token expired
- Not logged in

### 7. Verify Fix

After the recent code changes:
1. Server should start without errors ✅
2. Fallback mechanism works without API key ✅
3. Error messages are more helpful ✅
4. Frontend shows better error details ✅

### 8. Next Steps

If still getting errors:
1. Check server console output
2. Copy the exact error message
3. Check if `openai` and `pdfkit` packages are installed:
   ```powershell
   cd server
   npm list openai pdfkit
   ```

### 9. Test from Frontend

1. Login to admin dashboard
2. Go to Catalogues page
3. Click "Générer Plan de Formation (AI)" on any catalogue
4. Watch browser console (F12) for errors
5. Watch server console for processing logs

The error should now be more descriptive and tell you exactly what's wrong!
