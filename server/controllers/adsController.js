import { Router } from 'express'
import { generateAdCopy } from '../services/aiService.js'

const router = Router()

router.post('/generate', async (request, response, next) => {
  try {
    const {
      businessName,
      productInfo,
      productName,
      audience,
      language,
      goal,
      tone,
      description,
    } = request.body
    const normalizedBusinessName = businessName || productName
    const normalizedProductInfo = productInfo || description

    if (!normalizedBusinessName || !audience || !normalizedProductInfo) {
      return response.status(400).json({
        message:
          'Business name, target audience, and product or service info are required.',
      })
    }

    const ad = await generateAdCopy({
      businessName: normalizedBusinessName,
      audience,
      language,
      goal,
      tone,
      productInfo: normalizedProductInfo,
    })

    return response.json({ ad })
  } catch (error) {
    return next(error)
  }
})

export default router
