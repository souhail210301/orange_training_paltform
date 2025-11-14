# 🚀 AI Training Plan Generator - Quick Reference Card

## One-Page Cheat Sheet for Fast Setup & Usage

---

## ⚡ 60-Second Setup

```powershell
# 1. Add API key to server/.env
XAI_API_KEY=xai-YOUR-KEY-HERE

# 2. Restart server
cd server
node server.js

# 3. Done! Button appears on all catalogue cards.
```

---

## 🎯 How It Works

```
User clicks "Générer Plan de Formation (AI)" button
           ↓
Grok AI generates training plan (5-10 sec)
           ↓
PDF created with Orange branding
           ↓
Automatic download: Plan_Formation_[Title].pdf
```

---

## 📍 Where to Find It

**Frontend:** Admin Dashboard → Catalogue page → Each catalogue card has orange AI button

**Files:**
- Backend: `server/services/aiService.js` + `pdfService.js`
- Frontend: `client/src/components/AdminDashboard/Catalogues.jsx`
- Routes: `server/routes/aiRoutes.js`

---

## 🔑 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/ai/catalogue/:id/plan-pdf` | Generate PDF for catalogue |
| POST | `/api/ai/generate-plan` | Get JSON plan |
| POST | `/api/ai/generate-plan-pdf` | Generate custom PDF |

**Auth:** All require `Authorization: Bearer <token>`

---

## 📄 PDF Contains

1. ✅ Description de la Formation
2. ✅ Objectifs Pédagogiques (5-8 items)
3. ✅ Public Cible
4. ✅ Prérequis
5. ✅ Modules de Formation (4-6 modules)
6. ✅ Méthodes Pédagogiques
7. ✅ Modalités d'Évaluation
8. ✅ Ressources Recommandées
9. ✅ Compétences Acquises
10. ✅ Durée Totale

**Language:** French | **Branding:** Orange (#FF6600) | **Pages:** 2-4

---

## 💰 Cost

**Per PDF:** ~$0.004 (Grok)  
**100 PDFs:** ~$0.40/month  
**1,000 PDFs:** ~$4.00/month

---

## 🔧 Troubleshooting

| Problem | Fix |
|---------|-----|
| "API key not configured" | Add `OPENAI_API_KEY` to `.env` and restart |
| Button doesn't appear | Check user role (not shown for odc_mentor) |
| PDF won't download | Check browser console, verify auth token |
| "Rate limit exceeded" | Wait 60 seconds (free tier: 3 req/min) |
| Poor quality content | Upgrade to GPT-4 model in `aiService.js` |

---

## 🎨 Customization

### Change AI Model (Higher Quality)
`server/services/aiService.js` line ~30:
```javascript
model: 'gpt-4'  // Instead of 'gpt-3.5-turbo'
```

### Change PDF Color
`server/services/pdfService.js` line ~15:
```javascript
const ORANGE_COLOR = '#YOUR_COLOR';
```

### Adjust Creativity
`server/services/aiService.js` line ~32:
```javascript
temperature: 0.5  // Lower = consistent, Higher = creative
```

---

## ✅ Testing Checklist

```
□ API key in .env
□ Server restarts OK
□ Button visible on catalogues
□ Click generates PDF
□ PDF downloads
□ PDF opens correctly
□ All 10 sections populated
□ Orange branding present
□ French language
□ No errors in console
```

---

## 📚 Documentation Files

1. **AI_SETUP_GUIDE.md** - Quick setup (5 min)
2. **AI_TRAINING_PLAN_DOCUMENTATION.md** - Full reference
3. **AI_IMPLEMENTATION_SUMMARY.md** - Technical overview
4. **AI_QUICK_REFERENCE.md** - This card

---

## 🆘 Quick Help

**Can't find API key?** → https://platform.openai.com/api-keys  
**Server won't start?** → Check `.env` syntax (no quotes around key)  
**PDF corrupted?** → Verify `pdfkit` installed: `npm list pdfkit`  
**Still stuck?** → Check `AI_SETUP_GUIDE.md` troubleshooting section

---

## 💡 Pro Tips

✨ **Generate PDFs in bulk:** Loop through catalogues array  
✨ **Save costs:** Cache plans for frequently accessed catalogues  
✨ **Better quality:** Use GPT-4 for important catalogues  
✨ **Offline mode:** Works without API key (uses templates)  
✨ **Custom branding:** Edit `pdfService.js` colors and layout

---

## 🎉 Success Indicator

When working correctly, you'll see:
- Orange AI button on each catalogue card
- Button changes to "Génération en cours..." when clicked
- PDF downloads automatically after 5-10 seconds
- PDF has Orange header and professional formatting
- All content in French

**If you see this: ✅ FEATURE IS WORKING!**

---

## 📞 Emergency Commands

```powershell
# Restart server
cd server
node server.js

# Check if packages installed
npm list openai pdfkit

# Test API (replace TOKEN and ID)
curl http://localhost:5000/api/ai/catalogue/ID/plan-pdf -H "Authorization: Bearer TOKEN" -o test.pdf

# View server logs
# Check terminal where server is running
```

---

**Print this card and keep it handy! 📌**

*Quick reference for AI Training Plan Generator v1.0*
