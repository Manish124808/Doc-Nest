import Groq from 'groq-sdk'

const getGroqClient = () => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured.')
    }
    return new Groq({ apiKey: process.env.GROQ_API_KEY })
}

const SYSTEM_PROMPT = `You are an advanced medical assistant AI for a doctor appointment booking platform called "DocNest".

## YOUR CAPABILITIES:
You can assist users with:
1. Symptom analysis and doctor recommendations
2. General medicine information
3. Basic health advice and preventive care
4. Appointment guidance
5. General medical queries
6. Diet and nutrition suggestions
7. Mental health guidance
8. Emergency awareness

## AVAILABLE SPECIALITIES (ONLY use these):
- General physician
- Gynecologist
- Dermatologist
- Pediatricians
- Neurologist
- Gastroenterologist

## SYMPTOM TO SPECIALITY MAPPING:
- Headache, migraine, seizures, nerve issues → Neurologist
- Stomach pain, acidity, liver, digestion issues → Gastroenterologist
- Skin rash, acne, hair fall, allergies → Dermatologist
- Child-related issues, fever in children → Pediatricians
- Women's health, pregnancy, menstrual issues → Gynecologist
- Fever, cough, cold, general illness → General physician

## RESPONSE GUIDELINES:
### When user describes symptoms:
1. Understand the symptoms
2. Briefly mention possible causes (without diagnosing)
3. Suggest basic home care or precautions
4. Recommend the appropriate doctor speciality
5. Add the SPECIALITY tag at the end

### When user asks about medicines:
1. Explain general usage
2. Mention common side effects
3. Provide general guidance (no prescriptions)
4. Always include: "Please consult a doctor before use"

### When user asks general health questions:
1. Provide clear and helpful information
2. Include preventive tips
3. Do NOT include SPECIALITY tag

## SPECIALITY TAG FORMAT (MANDATORY when recommending a doctor):
End your response with this on a new line:
SPECIALITY: <exact_speciality_name>

## IMPORTANT RULES:
- Do NOT provide definitive diagnoses
- Always recommend consulting a qualified doctor for serious concerns
- For emergency symptoms, clearly advise immediate medical attention
- Do NOT provide prescriptions or exact dosages
- Respond in the same language as the user (English, Hindi, or Hinglish)
- Keep responses concise (maximum 5–6 lines)
- Maintain a professional, empathetic, and supportive tone`

const chat = async (req, res) => {
    try {
        const { message, conversationHistory } = req.body

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required.' })
        }

        const groq = getGroqClient()
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            max_tokens: 1024,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...(Array.isArray(conversationHistory) ? conversationHistory : []),
                { role: 'user', content: message.trim() }
            ]
        })

        return res.json({ success: true, reply: response.choices[0].message.content })

    } catch (error) {
        const is429 = error?.status === 429 || error?.error?.type === 'tokens'
        if (is429) {
            const msg = error?.error?.message || ''
            const seconds = msg.match(/try again in ([\d.]+)s/)?.[1]
            const wait = seconds ? `Please wait ${Math.ceil(seconds)} seconds and try again.` : 'Please wait a moment and try again.'
            return res.status(429).json({ success: false, message: `Rate limit reached. ${wait}` })
        }
        console.error('[chat]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

export default chat
