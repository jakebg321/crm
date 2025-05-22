import { OpenAI } from 'openai';

// Create an OpenAI client instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a landscape estimate based on job description and type
 */
export async function generateEstimate(jobDescription: string, jobType: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4", // Or "gpt-3.5-turbo" for lower cost
      messages: [
        {
          role: "system",
          content: `You are an expert estimator for landscape services. Generate a detailed estimate with line items based on the job description.
            
            IMPORTANT: Your response must ONLY contain a JSON array of line items with NO additional text. 
            Format as follows:
            [
              {
                "description": "Item description",
                "quantity": number,
                "unitPrice": number,
                "notes": "Optional notes about the item"
              }
            ]
            
            When generating estimates:
            1. Include all materials and labor needed for the job
            2. Use any specific materials mentioned in the description with their prices
            3. Be thorough and include all steps of the process (preparation, installation, cleanup)
            4. Use realistic quantities and prices for landscape services
            5. Break down large jobs into appropriate components
            
            DO NOT include any explanatory text before or after the JSON - ONLY return the JSON array.`
        },
        {
          role: "user",
          content: `Job Type: ${jobType}\nDescription: ${jobDescription}\nGenerate a detailed estimate with appropriate line items, quantities, and suggested pricing.`
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || '[]';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate estimate with AI');
  }
}

/**
 * Analyze material requirements based on job description and area
 */
export async function analyzeMaterialRequirements(jobDescription: string, area: number) {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4",
      messages: [
        {
          role: "system",
          content: 
`You are a professional landscape contractor with expert knowledge of materials required for different landscape projects.
Your task is to analyze the job description and area provided by the user, then provide a detailed list of materials needed.

For each material, include:
1. Name of the material
2. Quantity needed (with appropriate units)
3. Unit (e.g., yards, bags, pieces, etc.)
4. Any special notes about the material

Consider factors like the type of job, area size, and any specific requirements mentioned.
If multiple job types are mentioned, include materials for all relevant types.
Be specific with material names and use industry-standard measurements.

Your response should ONLY contain valid JSON in the following format:
{
  "materials": [
    { "name": "Material Name", "quantity": 10, "unit": "yards", "notes": "Optional notes about usage" },
    { "name": "Another Material", "quantity": 5, "unit": "bags", "notes": "Optional notes" }
  ]
}`
        },
        {
          role: "user",
          content: `Job Description: ${jobDescription}\nArea: ${area} square feet\n\nProvide a detailed material list with quantities.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return response.choices[0].message.content || '{"materials":[]}';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`Failed to analyze material requirements: ${error.message}`);
  }
}

/**
 * Optimize pricing based on line items and client information
 */
export async function optimizePricing(lineItems: any[], clientInfo: any) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert in landscape pricing optimization. Analyze the line items and client information
            to suggest optimal pricing.
            
            IMPORTANT: Your response must ONLY contain a JSON object with NO additional text.
            Format as follows:
            {
              "optimizedItems": [
                {
                  "description": "Item description",
                  "suggestedPrice": number,
                  "reasoning": "Brief explanation for the price"
                }
              ],
              "totalPrice": number,
              "recommendations": "Overall pricing recommendations"
            }
            
            DO NOT include any explanatory text before or after the JSON - ONLY return the JSON object.`
        },
        {
          role: "user",
          content: `Line Items: ${JSON.stringify(lineItems)}\nClient Info: ${JSON.stringify(clientInfo)}\nSuggest optimal pricing for these line items.`
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || '{"optimizedItems":[],"totalPrice":0,"recommendations":"No recommendations available"}';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to optimize pricing with AI');
  }
}

export default openai; 