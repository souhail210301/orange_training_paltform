# AI Training Plan Generator - Documentation

## Overview
The AI Training Plan Generator automatically creates detailed, professional training plans in PDF format using OpenAI's GPT-3.5-turbo model. When a catalogue is created, the system can generate a comprehensive training plan document with Orange branding.

## Features
- **AI-Powered Content**: Uses OpenAI GPT-3.5 to generate detailed French training plans
- **Fallback System**: Automatically uses template-based generation if AI is unavailable
- **Professional PDFs**: Multi-page documents with Orange branding (#FF6600)
- **Comprehensive Content**: Includes 10 sections (description, objectives, modules, prerequisites, etc.)
- **REST API**: Three endpoints for different use cases
- **Protected Routes**: Requires authentication via JWT

---

## Setup Instructions

### 1. Environment Configuration
Add your OpenAI API key to `server/.env`:

```env
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

**How to get an API key:**
1. Visit https://platform.openai.com
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy and paste into `.env`

**Note:** The system will work without an API key using the fallback template generator, but AI-generated content will not be available.

### 2. Install Dependencies
Ensure the following packages are installed (already included in package.json):

```powershell
cd server
npm install openai pdfkit
```

### 3. Verify Integration
Check that `server/server.js` includes:
```javascript
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);
```

---

## API Endpoints

### 1. Generate Training Plan (JSON)
**Endpoint:** `POST /api/ai/generate-plan`  
**Authentication:** Required (Bearer token)  
**Description:** Generates a detailed training plan and returns it as JSON

**Request Body:**
```json
{
  "title": "Formation React Avancé",
  "description": "Approfondir les concepts avancés de React",
  "duration": "40 heures"
}
```

**Response:**
```json
{
  "success": true,
  "plan": {
    "description": "Description complète de la formation...",
    "objectives": ["Objectif 1", "Objectif 2", "..."],
    "targetAudience": "Développeurs ayant une expérience avec React de base",
    "prerequisites": ["Maîtrise de JavaScript ES6+", "..."],
    "modules": [
      {
        "title": "Module 1: Hooks Avancés",
        "content": "Détails du contenu...",
        "duration": "8 heures"
      }
    ],
    "teachingMethods": ["Cours magistraux", "Travaux pratiques", "..."],
    "evaluationMethods": ["QCM", "Projets pratiques", "..."],
    "resources": ["Documentation React officielle", "..."],
    "skillsAcquired": ["Compétence 1", "Compétence 2", "..."],
    "totalDuration": "40 heures"
  }
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/ai/generate-plan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Formation React Avancé",
    "description": "Approfondir les concepts avancés de React",
    "duration": "40 heures"
  }'
```

---

### 2. Generate Training Plan PDF (Download)
**Endpoint:** `POST /api/ai/generate-plan-pdf`  
**Authentication:** Required (Bearer token)  
**Description:** Generates a training plan and returns it as a downloadable PDF

**Request Body:** Same as endpoint #1

**Response:** Binary PDF file  
**Content-Type:** `application/pdf`  
**Content-Disposition:** `attachment; filename="Plan_Formation_[Title].pdf"`

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/ai/generate-plan-pdf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Formation React Avancé",
    "description": "Approfondir les concepts avancés de React",
    "duration": "40 heures"
  }' \
  --output plan.pdf
```

---

### 3. Generate PDF for Existing Catalogue
**Endpoint:** `GET /api/ai/catalogue/:id/plan-pdf`  
**Authentication:** Required (Bearer token)  
**Description:** Generates a PDF training plan for an existing catalogue

**Parameters:**
- `id` (path parameter): MongoDB ObjectId of the catalogue

**Response:** Binary PDF file

**Example cURL:**
```bash
curl -X GET http://localhost:5000/api/ai/catalogue/6583a8f3c2e4b1a2d3e4f5a6/plan-pdf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output plan.pdf
```

---

## PDF Document Structure

The generated PDF includes the following sections:

### Header (All Pages)
- Orange logo
- Document title: "Plan de Formation"
- Orange branding bar (#FF6600)

### Content Sections
1. **Description de la Formation** - Overview and context
2. **Objectifs Pédagogiques** - Learning objectives (bullet points)
3. **Public Cible** - Target audience description
4. **Prérequis** - Prerequisites (bullet points)
5. **Modules de Formation** - Detailed modules with:
   - Module title and number
   - Content description
   - Duration per module
6. **Méthodes Pédagogiques** - Teaching methods (bullet points)
7. **Modalités d'Évaluation** - Evaluation methods (bullet points)
8. **Ressources Recommandées** - Recommended resources (bullet points)
9. **Compétences Acquises** - Skills acquired (bullet points)
10. **Durée Totale** - Total duration

### Footer (All Pages)
- Page number (e.g., "Page 1")
- Generation date

---

## Frontend Integration Example

### Add Button to Catalogues Component

```jsx
import { FileText } from 'lucide-react';

const Catalogues = () => {
  const [generatingPDF, setGeneratingPDF] = useState(null);

  const handleGeneratePDF = async (catalogueId) => {
    setGeneratingPDF(catalogueId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/ai/catalogue/${catalogueId}/plan-pdf`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Plan_Formation_${catalogueId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setGeneratingPDF(null);
    }
  };

  return (
    <div>
      {/* Your existing catalogue list */}
      {catalogues.map(catalogue => (
        <div key={catalogue._id}>
          <h3>{catalogue.title}</h3>
          <button
            onClick={() => handleGeneratePDF(catalogue._id)}
            disabled={generatingPDF === catalogue._id}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            <FileText size={16} />
            {generatingPDF === catalogue._id 
              ? 'Génération...' 
              : 'Générer Plan de Formation (AI)'}
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## How It Works

### AI Generation Process

1. **Request Received**: Controller receives catalogue data (title, description, duration)
2. **AI Service Call**: `aiService.generateTrainingPlan()` is invoked
3. **OpenAI API Call**: Sends structured prompt to GPT-3.5-turbo:
   ```
   Génère un plan de formation professionnel et détaillé pour:
   Titre: [title]
   Description: [description]
   Durée: [duration]
   ```
4. **Response Parsing**: Parses JSON response with validation
5. **PDF Generation**: `pdfService.generateTrainingPlanPDF()` creates document
6. **Download**: Returns PDF buffer with appropriate headers

### Fallback Mechanism

If OpenAI API fails (no key, rate limit, network error):

1. System logs warning
2. `generateFallbackPlan()` creates template-based plan
3. Uses catalogue title/description to populate sections
4. Generates professional PDF with placeholder content
5. User receives PDF without errors (quality reduced but functional)

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `500: OpenAI API key not configured` | Missing `OPENAI_API_KEY` in `.env` | Add valid API key or use fallback |
| `404: Catalogue not found` | Invalid catalogue ID | Verify ID exists in database |
| `401: Unauthorized` | Missing or invalid JWT token | Include valid Bearer token |
| `429: Rate limit exceeded` | Too many OpenAI requests | Wait or upgrade OpenAI plan |
| `500: Failed to generate training plan` | AI service error | Check logs, fallback will activate |

### Debugging Tips

**Enable detailed logging:**
```javascript
// In aiService.js, uncomment console.logs
console.log('AI Response:', completion.choices[0].message.content);
```

**Test without AI:**
```javascript
// Temporarily comment out API call to test fallback
// const completion = await openai.chat.completions.create({...});
const plan = generateFallbackPlan(title, description, duration);
```

**Verify PDF generation:**
```javascript
// Save PDF to file system for inspection
const fs = require('fs');
fs.writeFileSync('test-plan.pdf', pdfBuffer);
```

---

## Service Architecture

### Files Overview

**`server/services/aiService.js`** (180 lines)
- Handles OpenAI API integration
- `generateTrainingPlan(title, description, duration)` - Main AI function
- `generateFallbackPlan(title, description, duration)` - Template generator
- Structured JSON response format
- Error handling and logging

**`server/services/pdfService.js`** (400 lines)
- PDF document generation using PDFKit
- `generateTrainingPlanPDF(plan, title)` - Returns Buffer
- `addSection(doc, title, content, isLarge)` - Helper for sections
- Orange branding (#FF6600)
- Multi-page support with automatic pagination
- Headers and footers on all pages

**`server/controllers/aiController.js`** (120 lines)
- Express route handlers
- `generatePlan(req, res)` - JSON endpoint
- `generatePlanPDF(req, res)` - PDF download endpoint
- `generateCataloguePlanPDF(req, res)` - Catalogue-specific endpoint
- Request validation
- Error responses

**`server/routes/aiRoutes.js`**
- Express Router configuration
- Protected routes using `protect` middleware
- Three endpoints defined
- Exports router for `server.js`

---

## Best Practices

### 1. API Key Security
✅ **DO:**
- Store API key in `.env` file
- Add `.env` to `.gitignore`
- Use environment-specific keys (dev/prod)
- Rotate keys periodically

❌ **DON'T:**
- Hardcode keys in source code
- Commit keys to version control
- Share keys in public repositories
- Use production keys in development

### 2. Rate Limiting
- OpenAI has rate limits (requests per minute, tokens per minute)
- Consider implementing request queuing for high traffic
- Cache frequently requested training plans
- Monitor usage via OpenAI dashboard

### 3. Error Handling
- Always provide user-friendly error messages
- Log detailed errors server-side for debugging
- Implement retry logic for transient failures
- Fall back to template generation gracefully

### 4. PDF Quality
- Validate input data before generation
- Ensure sufficient content for each section
- Test with various catalogue types
- Preview PDFs before deploying to production

---

## Testing Guide

### Manual Testing

**Test 1: JSON Generation with AI**
```bash
# Ensure OPENAI_API_KEY is set in .env
curl -X POST http://localhost:5000/api/ai/generate-plan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Formation",
    "description": "Test description",
    "duration": "20 heures"
  }'
```

Expected: JSON with all 10 sections populated by AI

**Test 2: PDF Download**
```bash
curl -X POST http://localhost:5000/api/ai/generate-plan-pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Formation",
    "description": "Test description",
    "duration": "20 heures"
  }' \
  --output test-plan.pdf
```

Expected: PDF file downloads successfully, opens correctly

**Test 3: Existing Catalogue**
```bash
# Replace with real catalogue ID from your database
curl -X GET http://localhost:5000/api/ai/catalogue/6583a8f3c2e4b1a2d3e4f5a6/plan-pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output catalogue-plan.pdf
```

Expected: PDF generated from existing catalogue data

**Test 4: Fallback (No API Key)**
```bash
# Temporarily remove OPENAI_API_KEY from .env
# Restart server
# Run any of the above tests
```

Expected: Template-based plan generated, PDF still works

**Test 5: Authentication**
```bash
# Test without Authorization header
curl -X POST http://localhost:5000/api/ai/generate-plan \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "description": "Test",
    "duration": "10h"
  }'
```

Expected: 401 Unauthorized error

---

## Troubleshooting

### Problem: "OpenAI API key not configured"
**Solution:**
1. Check `.env` file exists in `server/` directory
2. Verify variable name is exactly `OPENAI_API_KEY`
3. Restart server after adding key
4. Check for extra spaces or quotes around key

### Problem: PDF displays incorrectly
**Solution:**
1. Verify PDFKit is installed: `npm list pdfkit`
2. Check console for PDF generation errors
3. Save PDF to disk and inspect manually
4. Ensure all sections have valid content

### Problem: AI generates poor quality content
**Solution:**
1. Improve the prompt in `aiService.js`
2. Provide more detailed catalogue descriptions
3. Consider using GPT-4 model (change in `aiService.js`)
4. Add example outputs to the prompt

### Problem: Rate limit exceeded
**Solution:**
1. Implement caching for frequently requested plans
2. Add request throttling on frontend
3. Upgrade OpenAI plan
4. Use fallback for non-critical requests

---

## Future Enhancements

### Planned Features
- [ ] Custom templates per formation category
- [ ] Admin UI to customize PDF branding
- [ ] Multi-language support (English, Arabic)
- [ ] Training plan versioning
- [ ] Collaborative editing of AI-generated plans
- [ ] Integration with catalogue creation workflow
- [ ] Batch PDF generation for all catalogues
- [ ] Email delivery of generated PDFs
- [ ] Analytics on AI usage and cost

### Configuration Options
Consider adding to `.env`:
```env
AI_MODEL=gpt-3.5-turbo
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2000
PDF_PAGE_SIZE=A4
PDF_PRIMARY_COLOR=#FF6600
```

---

## Cost Considerations

### OpenAI Pricing (as of 2024)
- GPT-3.5-turbo: ~$0.002 per 1K tokens
- Average training plan: ~2,000 tokens (input + output)
- Cost per generation: ~$0.004

**Example Monthly Costs:**
- 100 plans/month: ~$0.40
- 1,000 plans/month: ~$4.00
- 10,000 plans/month: ~$40.00

**Optimization Tips:**
- Cache plans for reused catalogues
- Use lower temperature (0.5) for consistency
- Implement request deduplication
- Consider GPT-3.5-turbo-16k only when needed

---

## Support

For issues or questions:
1. Check this documentation
2. Review server logs (`server/logs/` if configured)
3. Test endpoints with curl/Postman
4. Verify `.env` configuration
5. Check OpenAI dashboard for API status

---

## Changelog

### Version 1.0.0 (Current)
- Initial implementation
- OpenAI GPT-3.5-turbo integration
- Professional PDF generation with Orange branding
- Three API endpoints
- Fallback template system
- JWT authentication
- French language support
- 10 comprehensive training plan sections
