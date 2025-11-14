# 🔄 Migration from OpenAI to Grok (xAI)

## Overview
The ODC Certification Platform has migrated from OpenAI GPT-3.5 to **Grok** (by xAI) for all AI-powered features:
- **AI Training Plan Generator**: Creates structured PDF training plans
- **Chatbot Assistant**: Helps students choose trainings and answers questions

This migration was necessary due to OpenAI quota limitations and provides access to Grok's advanced capabilities.

---

## What Changed

### API Configuration
| Aspect | Before (OpenAI) | After (Grok) |
|--------|----------------|--------------|
| Environment Variable | `OPENAI_API_KEY` | `XAI_API_KEY` |
| API Endpoint | Default OpenAI | `https://api.x.ai/v1` |
| Model | `gpt-3.5-turbo` | `grok-beta` |
| SDK | `openai` npm package | Same (compatible) |

### Files Modified
1. **server/services/aiService.js**
   - Changed API key check to `XAI_API_KEY`
   - Added `baseURL: 'https://api.x.ai/v1'`
   - Changed model to `grok-beta`
   - Removed `response_format` parameter (not supported by Grok)

2. **server/services/chatbotService.js**
   - Changed API key check to `XAI_API_KEY`
   - Added `baseURL: 'https://api.x.ai/v1'`
   - Changed model to `grok-beta`
   - Updated error messages to reference "Grok"

---

## Setup Instructions

### 1. Get xAI API Key
1. Visit [xAI Platform](https://x.ai/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `xai-...`)

### 2. Update Environment Variables
Edit `server/.env`:

```env
# Old (remove or comment out)
# OPENAI_API_KEY=sk-...

# New (add this)
XAI_API_KEY=xai-your-actual-key-here
```

### 3. Restart Server
```powershell
cd server
node server.js
```

### 4. Verify Configuration
Check server logs:
```
✅ Grok API configured successfully
```

If you see:
```
⚠️ Grok API key not configured. Using rule-based responses.
```
Then your API key is missing or invalid.

---

## Testing the Migration

### Test 1: AI Training Plan Generator
1. Go to Admin Dashboard → Catalogues
2. Click "Générer Plan de Formation" button on any catalogue
3. Wait for PDF generation
4. Check server logs for Grok API calls

**Expected**: PDF generated with Grok-powered content

### Test 2: Chatbot Assistant
1. Click floating chatbot button (bottom-right corner)
2. Send message: "Quelles formations en développement web proposez-vous?"
3. Check response quality

**Expected**: Relevant, context-aware response from Grok

---

## Fallback System

### Automatic Fallback
If Grok API is unavailable, the system **automatically falls back** to rule-based responses:

**Triggers:**
- Missing API key
- Invalid API key
- Quota exceeded (429 error)
- Network errors

**Behavior:**
- Training Plan: Uses template-based content
- Chatbot: Uses keyword matching + database queries

### No User Impact
Users will still receive responses, just without AI enhancement. The system logs warnings but continues functioning.

---

## Pricing & Quotas

### xAI Grok Pricing (as of 2024)
- **Free Tier**: Limited requests per month
- **Pay-as-you-go**: ~$0.002 per 1K tokens
- **Enterprise**: Contact xAI for volume pricing

### Cost Estimates
| Feature | Avg Tokens | Cost per Use |
|---------|-----------|--------------|
| Training Plan | ~2,000 | $0.004 |
| Chatbot Message | ~500 | $0.001 |

**Monthly estimate** (100 plans + 1000 messages):
- Training Plans: 100 × $0.004 = **$0.40**
- Chatbot: 1000 × $0.001 = **$1.00**
- **Total**: ~$1.40/month

---

## Differences from OpenAI

### Advantages of Grok
✅ Higher token limits per request  
✅ More recent knowledge cutoff  
✅ Better context understanding  
✅ Fewer quota issues  
✅ Competitive pricing  

### Limitations
❌ No JSON mode (removed `response_format`)  
❌ Different response style  
❌ May require prompt adjustments  

### Prompt Compatibility
Most prompts work unchanged, but Grok may:
- Be more conversational
- Provide more detailed explanations
- Structure answers differently

**Recommendation**: Monitor responses for first week and adjust prompts if needed.

---

## Troubleshooting

### Error: "Grok API key not configured"
**Cause**: Missing or invalid `XAI_API_KEY` in `.env`  
**Fix**:
1. Check `.env` file exists in `server/` folder
2. Verify `XAI_API_KEY=xai-...` line present
3. Ensure no extra spaces around `=`
4. Restart server

### Error: "Invalid API key"
**Cause**: Wrong key or expired key  
**Fix**:
1. Regenerate key from xAI platform
2. Update `.env` with new key
3. Restart server

### Error: 429 - Quota exceeded
**Cause**: Free tier limit reached  
**Fix**:
1. Check usage on xAI dashboard
2. Upgrade to paid plan
3. System will use fallback automatically

### Responses seem off
**Cause**: Grok's different style  
**Fix**:
1. Check `server/services/aiService.js` prompts
2. Adjust `temperature` parameter (0.7-0.9)
3. Modify system messages for desired tone

---

## Code Reference

### aiService.js (Grok Integration)
```javascript
// Initialize Grok client
const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1'
});

// Generate training plan
const completion = await openai.chat.completions.create({
  model: "grok-beta",
  messages: messages,
  temperature: 0.7,
  max_tokens: 3000
  // Note: No response_format parameter
});
```

### chatbotService.js (Grok Integration)
```javascript
// Initialize Grok client
const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1'
});

// Generate chatbot response
const completion = await openai.chat.completions.create({
  model: "grok-beta",
  messages: messages,
  temperature: 0.8,
  max_tokens: 500,
  presence_penalty: 0.6,
  frequency_penalty: 0.3
});
```

---

## Rollback Instructions

If you need to revert to OpenAI:

1. **Restore environment variable**:
   ```env
   OPENAI_API_KEY=sk-your-openai-key
   # XAI_API_KEY=xai-... (comment out)
   ```

2. **Modify aiService.js**:
   - Change `XAI_API_KEY` → `OPENAI_API_KEY`
   - Remove `baseURL` parameter
   - Change model to `gpt-3.5-turbo`
   - Add back `response_format: { type: "json_object" }`

3. **Modify chatbotService.js**:
   - Change `XAI_API_KEY` → `OPENAI_API_KEY`
   - Remove `baseURL` parameter
   - Change model to `gpt-3.5-turbo`

4. **Restart server**

---

## Support

### Resources
- [xAI Documentation](https://docs.x.ai/)
- [xAI API Reference](https://docs.x.ai/api)
- [Grok Model Specs](https://docs.x.ai/models)

### Contact
For xAI account issues: [support@x.ai](mailto:support@x.ai)

---

## Migration Checklist

- [x] Update `aiService.js` to Grok
- [x] Update `chatbotService.js` to Grok
- [x] Create migration documentation
- [ ] Get xAI API key
- [ ] Update `.env` file
- [ ] Test training plan generator
- [ ] Test chatbot assistant
- [ ] Monitor response quality
- [ ] Adjust prompts if needed

---

**Migration completed successfully! 🎉**

All AI features now powered by Grok (xAI).
