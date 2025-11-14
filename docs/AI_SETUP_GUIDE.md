# AI Training Plan Generator - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Get xAI API Key (Grok)
1. Visit https://x.ai/
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **"Create new API key"**
5. Copy the key (starts with `xai-...`)

### Step 2: Configure Environment
Open `server/.env` and add your xAI API key:

```env
# Existing variables...
MONGO_URI=mongodb://...
JWT_SECRET=your_jwt_secret

# Add this line:
XAI_API_KEY=xai-your-actual-key-here
```

**Important:** 
- Replace `xai-your-actual-key-here` with your real key
- No quotes needed around the key
- Make sure there's no space before or after the `=`

### Step 3: Restart Server
```powershell
cd server
node server.js
```

You should see:
```
Server running on port 5000
Connected to MongoDB
✅ Grok API configured successfully
```

### Step 4: Test the Feature
1. Open your browser to the catalogues page
2. You'll see a new button on each catalogue card: **"Générer Plan de Formation (AI)"**
3. Click the button
4. Wait 5-10 seconds while AI generates the plan
5. PDF will automatically download

---

## 📝 What Gets Generated

The AI creates a comprehensive training plan PDF with:

✅ **Description complète** - Full overview of the training  
✅ **Objectifs pédagogiques** - 5-8 specific learning objectives  
✅ **Public cible** - Target audience description  
✅ **Prérequis** - Prerequisites for participants  
✅ **Modules détaillés** - 4-6 training modules with durations  
✅ **Méthodes pédagogiques** - Teaching methods  
✅ **Modalités d'évaluation** - Evaluation methods  
✅ **Ressources recommandées** - Recommended resources  
✅ **Compétences acquises** - Skills participants will gain  
✅ **Durée totale** - Total training duration  

All content is in **French** and professionally formatted with **Orange branding**.

---

## 🎯 Usage Examples

### From Frontend (Catalogues Page)
1. Navigate to **Catalogue** page in admin dashboard
2. Find any catalogue card
3. Click **"Générer Plan de Formation (AI)"** button
4. PDF downloads automatically with name: `Plan_Formation_[Catalogue_Title].pdf`

### From API (For Testing)
```bash
# Get your JWT token from browser localStorage
# Then use curl:

curl -X GET http://localhost:5000/api/ai/catalogue/YOUR_CATALOGUE_ID/plan-pdf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output plan.pdf
```

Replace:
- `YOUR_CATALOGUE_ID` - MongoDB ObjectId of a catalogue
- `YOUR_JWT_TOKEN` - Your authentication token

---

## ⚠️ Troubleshooting

### Error: "OpenAI API key not configured"
**Cause:** Missing or incorrect `OPENAI_API_KEY` in `.env`

**Fix:**
1. Check `.env` file exists in `server/` folder
2. Verify key starts with `sk-proj-` or `sk-`
3. No extra spaces or quotes
4. Restart server after adding key

### Error: "Rate limit exceeded"
**Cause:** Too many requests to OpenAI API

**Fix:**
- Wait 60 seconds and try again
- OpenAI free tier has limits: 3 requests/minute
- Consider upgrading OpenAI plan for higher limits

### Error: "Failed to generate training plan"
**Cause:** OpenAI API error or network issue

**Fix:**
- Check your internet connection
- Verify API key is still valid on OpenAI dashboard
- Check OpenAI status: https://status.openai.com
- System will automatically use fallback template if AI fails

### PDF Downloads but Won't Open
**Cause:** Corrupted PDF or browser issue

**Fix:**
- Try different browser
- Check server console for PDF generation errors
- Verify PDFKit is installed: `npm list pdfkit`

### Button Click Does Nothing
**Cause:** JavaScript error or missing authentication

**Fix:**
1. Open browser console (F12)
2. Check for error messages
3. Verify you're logged in (JWT token exists)
4. Check network tab for failed requests

---

## 💰 Cost Information

### OpenAI Pricing
- **Model:** GPT-3.5-turbo
- **Cost:** ~$0.004 per training plan
- **Free tier:** $5 credit on new accounts

### Monthly Cost Estimates
| Plans Generated | Cost |
|----------------|------|
| 100 plans      | ~$0.40 |
| 500 plans      | ~$2.00 |
| 1,000 plans    | ~$4.00 |
| 5,000 plans    | ~$20.00 |

**Note:** Very affordable for most use cases!

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep API key in `.env` file
- Add `.env` to `.gitignore`
- Never commit API keys to Git
- Rotate keys every 3-6 months
- Use different keys for dev/prod

### ❌ DON'T:
- Share API keys publicly
- Hardcode keys in source code
- Use production keys in development
- Expose keys in error messages
- Store keys in frontend code

---

## 🎨 Customization Options

### Change AI Model (Better Quality)
Edit `server/services/aiService.js`:

```javascript
// Line ~30: Change model
const completion = await openai.chat.completions.create({
  model: 'gpt-4',  // or 'gpt-4-turbo-preview'
  // ...
});
```

**Note:** GPT-4 is more expensive but produces higher quality content

### Adjust AI Temperature (Creativity)
Edit `server/services/aiService.js`:

```javascript
// Line ~32: Change temperature
const completion = await openai.chat.completions.create({
  // ...
  temperature: 0.5,  // Lower = more consistent, Higher = more creative
  // ...
});
```

**Recommended values:**
- `0.3` - Very consistent, formal
- `0.7` - Balanced (default)
- `0.9` - More creative, varied

### Customize PDF Colors
Edit `server/services/pdfService.js`:

```javascript
// Line ~15: Change Orange color
const ORANGE_COLOR = '#FF6600';  // Change to your brand color
```

---

## 📊 Testing Checklist

Before deploying to production:

- [ ] API key added to `.env`
- [ ] Server restarts without errors
- [ ] Can generate PDF for at least one catalogue
- [ ] PDF downloads correctly
- [ ] PDF opens in Adobe Reader / browser
- [ ] All 10 sections are populated
- [ ] French content is grammatically correct
- [ ] Orange branding appears correctly
- [ ] Button shows loading state during generation
- [ ] Error messages display if AI fails
- [ ] Fallback works without API key (optional)

---

## 🆘 Support Resources

### Documentation
- Full docs: `docs/AI_TRAINING_PLAN_DOCUMENTATION.md`
- API reference: See "API Endpoints" section in full docs
- Code architecture: See "Service Architecture" section

### External Resources
- OpenAI Docs: https://platform.openai.com/docs
- PDFKit Docs: http://pdfkit.org/docs/getting_started.html
- OpenAI Status: https://status.openai.com

### Common Questions

**Q: Can I use this without an API key?**  
A: Yes! System automatically uses template-based fallback, but content quality is lower.

**Q: How long does generation take?**  
A: Typically 5-10 seconds per plan.

**Q: Can I customize the PDF template?**  
A: Yes, edit `server/services/pdfService.js`. See customization section above.

**Q: Does it work offline?**  
A: No, requires internet connection for OpenAI API. Fallback mode works offline.

**Q: What languages are supported?**  
A: Currently French only. Can be modified to support other languages.

---

## ✅ Verification Steps

After setup, verify everything works:

### 1. Check Environment
```powershell
cd server
type .env
```
Should show `OPENAI_API_KEY=sk-...`

### 2. Test Server Startup
```powershell
node server.js
```
Should start without errors

### 3. Test API Endpoint (Simple)
Visit in browser while server running:
```
http://localhost:5000/api/catalogues
```
Should show list of catalogues (JSON)

### 4. Generate Test PDF
1. Login to admin dashboard
2. Go to Catalogues page
3. Click AI button on any catalogue
4. Verify PDF downloads

### 5. Inspect PDF
Open downloaded PDF and verify:
- Orange header/branding
- All sections present
- French language
- Professional formatting
- Multiple pages if content is long

---

## 🎉 Success!

If all verification steps pass, your AI Training Plan Generator is ready to use!

**Next Steps:**
- Generate plans for all existing catalogues
- Share PDFs with university representatives
- Use in presentations and proposals
- Customize AI prompts for your specific needs

**Enjoy automated training plan generation! 🚀**
