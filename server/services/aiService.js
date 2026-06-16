const goalLabels = {
  sales: 'increase sales',
  leads: 'collect qualified leads',
  awareness: 'increase brand awareness',
  retention: 'bring customers back',
}

const toneLabels = {
  confident: 'confident',
  friendly: 'friendly',
  premium: 'premium',
  playful: 'playful',
}

const languageLabels = {
  english: 'English',
  russian: 'Russian',
  azerbaijani: 'Azerbaijani',
}

const localizedGoalLabels = {
  english: {
    sales: 'increase sales',
    leads: 'collect qualified leads',
    awareness: 'increase brand awareness',
    retention: 'bring customers back',
  },
  russian: {
    sales: 'увеличить продажи',
    leads: 'получить качественные заявки',
    awareness: 'повысить узнаваемость бренда',
    retention: 'вернуть клиентов',
  },
  azerbaijani: {
    sales: 'satışları artırmağa',
    leads: 'keyfiyyətli müraciətlər toplamağa',
    awareness: 'brend tanınmasını artırmağa',
    retention: 'müştəriləri geri qaytarmağa',
  },
}

const localizedToneLabels = {
  english: {
    confident: 'confident',
    friendly: 'friendly',
    premium: 'premium',
    playful: 'playful',
  },
  russian: {
    confident: 'уверенное',
    friendly: 'дружелюбное',
    premium: 'премиальное',
    playful: 'игривое',
  },
  azerbaijani: {
    confident: 'inamlı',
    friendly: 'səmimi',
    premium: 'premium',
    playful: 'əyləncəli',
  },
}

function normalizeText(value) {
  return String(value || '').trim()
}

function normalizeLanguage(value) {
  const language = normalizeText(value).toLowerCase()

  return languageLabels[language] ? language : 'english'
}

function normalizeHashtag(value) {
  const cleaned = normalizeText(value)
    .replace(/^#+/, '')
    .replace(/[^\p{L}\p{N}_]/gu, '')

  return cleaned ? `#${cleaned}` : ''
}

function ensureMinimumHashtags(hashtags, businessName) {
  const fallbackTags = [
    normalizeHashtag(businessName),
    '#InstagramAd',
    '#SmallBusiness',
    '#Marketing',
  ]
  const uniqueTags = [...hashtags, ...fallbackTags]
    .map(normalizeHashtag)
    .filter(Boolean)
    .filter((tag, index, allTags) => allTags.indexOf(tag) === index)

  return uniqueTags.slice(0, Math.max(3, uniqueTags.length))
}

function buildPrompt({
  businessName,
  audience,
  language,
  goal,
  tone,
  productInfo,
}) {
  const responseLanguage = languageLabels[language] || languageLabels.english

  return [
    'Create an Instagram ad text.',
    `Business name: ${businessName}`,
    `Target audience: ${audience}`,
    `Response language: ${responseLanguage}`,
    `Goal: ${goalLabels[goal] || goalLabels.sales}`,
    `Tone: ${toneLabels[tone] || toneLabels.confident}`,
    `Product or service info: ${productInfo}`,
    'Return only valid JSON with these fields:',
    '- shortAdText: one short Instagram ad text, maximum 45 words',
    '- callToAction: one clear CTA',
    '- hashtags: array with at least 3 Instagram hashtags',
    `All user-facing text must be in ${responseLanguage}.`,
  ].join('\n')
}

function createFallbackAd({
  businessName,
  audience,
  language,
  goal,
  tone,
  productInfo,
}) {
  const cleanBusinessName = normalizeText(businessName)
  const cleanAudience = normalizeText(audience)
  const cleanProductInfo = normalizeText(productInfo)
  const selectedLanguage = normalizeLanguage(language)
  const cleanGoal =
    localizedGoalLabels[selectedLanguage][goal] ||
    localizedGoalLabels[selectedLanguage].sales
  const cleanTone =
    localizedToneLabels[selectedLanguage][tone] ||
    localizedToneLabels[selectedLanguage].confident
  const fallbackCopy = {
    english: {
      shortAdText: `${cleanBusinessName} helps ${cleanAudience} ${cleanGoal}. ${cleanProductInfo} Discover a ${cleanTone} offer made for Instagram.`,
      callToAction: goal === 'leads' ? 'Book a free consultation' : 'Order now',
    },
    russian: {
      shortAdText: `${cleanBusinessName} помогает аудитории "${cleanAudience}" ${cleanGoal}. ${cleanProductInfo} Откройте для себя ${cleanTone} предложение для Instagram.`,
      callToAction:
        goal === 'leads' ? 'Запишитесь на консультацию' : 'Закажите сейчас',
    },
    azerbaijani: {
      shortAdText: `${cleanBusinessName} "${cleanAudience}" auditoriyasına ${cleanGoal} kömək edir. ${cleanProductInfo} Instagram üçün ${cleanTone} təklifi kəşf edin.`,
      callToAction: goal === 'leads' ? 'Pulsuz məsləhət alın' : 'İndi sifariş edin',
    },
  }
  const localizedCopy = fallbackCopy[selectedLanguage]

  return {
    shortAdText: localizedCopy.shortAdText,
    callToAction: localizedCopy.callToAction,
    isDemoMode: true,
    hashtags: ensureMinimumHashtags(
      ['#InstagramAd', '#BusinessGrowth', '#LimitedOffer'],
      cleanBusinessName,
    ),
  }
}

function safeJsonParse(value) {
  if (typeof value !== 'string') {
    return value || null
  }

  const cleanedValue = value
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')

  try {
    return JSON.parse(cleanedValue)
  } catch {
    const jsonMatch = cleanedValue.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return null
    }

    try {
      return JSON.parse(jsonMatch[0])
    } catch {
      return null
    }
  }
}

async function generateWithOpenAi(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You create concise Instagram ad copy and return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error('OpenAI rejected the generation request.')
  }

  const payload = await response.json()
  return safeJsonParse(payload.choices?.[0]?.message?.content)
}

async function generateWithClaude(prompt) {
  if (!process.env.CLAUDE_API_KEY) {
    return null
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || 'claude-3-5-haiku-latest',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    throw new Error('Claude rejected the generation request.')
  }

  const payload = await response.json()
  const textBlock = payload.content?.find((block) => block.type === 'text')
  return safeJsonParse(textBlock?.text)
}

async function generateWithGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    return null
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash'
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: 'You create concise Instagram ad copy and return only valid JSON.',
            },
          ],
        },
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    },
  )

  if (!response.ok) {
    throw new Error('Gemini rejected the generation request.')
  }

  const payload = await response.json()
  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join('\n')

  return safeJsonParse(text)
}

async function generateWithExternalAi(prompt) {
  const provider = normalizeText(process.env.AI_PROVIDER).toLowerCase()

  if (provider === 'gemini') {
    return generateWithGemini(prompt)
  }

  if (provider === 'claude') {
    return generateWithClaude(prompt)
  }

  if (provider === 'openai') {
    return generateWithOpenAi(prompt)
  }

  return (
    (await generateWithOpenAi(prompt)) ||
    (await generateWithClaude(prompt)) ||
    generateWithGemini(prompt)
  )
}

function normalizeAd(payload, businessName) {
  if (!payload) {
    return null
  }

  const candidate = payload.ad || payload
  const shortAdText = normalizeText(candidate.shortAdText || candidate.primaryText)
  const callToAction = normalizeText(
    candidate.callToAction || candidate.cta || candidate.CTA,
  )
  const hashtags = ensureMinimumHashtags(
    Array.isArray(candidate.hashtags) ? candidate.hashtags : [],
    businessName,
  )

  if (!shortAdText || !callToAction) {
    return null
  }

  return {
    shortAdText,
    callToAction,
    isDemoMode: false,
    hashtags,
  }
}

export async function generateAdCopy(input) {
  const normalizedInput = {
    businessName: normalizeText(input.businessName),
    audience: normalizeText(input.audience),
    language: normalizeLanguage(input.language),
    goal: normalizeText(input.goal),
    tone: normalizeText(input.tone),
    productInfo: normalizeText(input.productInfo),
  }

  const prompt = buildPrompt(normalizedInput)
  const externalAd = normalizeAd(
    await generateWithExternalAi(prompt),
    normalizedInput.businessName,
  )

  return externalAd || createFallbackAd(normalizedInput)
}
