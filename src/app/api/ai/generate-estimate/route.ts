import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateEstimate } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import { JobType } from '@prisma/client';

/**
 * Parse the AI response into structured line items
 */
function parseAIEstimateResponse(aiResponse: string, savedMaterials: any[] = []): any[] {
  try {
    // Handle empty responses
    if (!aiResponse || aiResponse.trim() === '') {
      console.warn('Empty AI response received');
      return [{
        description: 'Basic Landscape Service',
        quantity: 1,
        unitPrice: 100,
        total: 100,
        notes: 'Default item due to empty AI response',
      }];
    }

    // Try to parse as JSON first
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      // If it's not valid JSON, attempt to extract JSON from the text
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch (innerError) {
          console.error('Failed to extract JSON from response text:', innerError);
          // Fallback to parsing line by line
          return parseLineByLine(aiResponse);
        }
      } else {
        // No JSON found, fall back to line-by-line parsing
        return parseLineByLine(aiResponse);
      }
    }
    
    // Handle different JSON structures
    let lineItems;
    if (Array.isArray(parsedResponse)) {
      lineItems = parsedResponse;
    } else if (parsedResponse.lineItems && Array.isArray(parsedResponse.lineItems)) {
      lineItems = parsedResponse.lineItems;
    } else if (parsedResponse.items && Array.isArray(parsedResponse.items)) {
      lineItems = parsedResponse.items;
    } else {
      // If no recognizable array is found, treat the object as a single item
      lineItems = [parsedResponse];
    }
    
    // Make sure we have at least one item
    if (lineItems.length === 0) {
      return [{
        description: 'Basic Landscape Service',
        quantity: 1,
        unitPrice: 100,
        total: 100,
        notes: 'Default item due to empty parsed response',
      }];
    }
    
    // Map to ensure all items have the required fields
    // And match any items with saved materials when descriptions are similar
    const processedItems = lineItems.map(item => {
      const description = item.description || item.name || item.item || 'Unnamed item';
      const quantity = parseFloat(item.quantity) || 1;
      
      // Try to find matching saved material based on description similarity
      const matchedMaterial = findMatchingSavedMaterial(description, savedMaterials);
      
      // Use saved material price if available, otherwise use AI suggested price
      const unitPrice = matchedMaterial ? 
        matchedMaterial.unitPrice : 
        (parseFloat(item.unitPrice) || parseFloat(item.price) || 0);
      
      // Calculate total
      const total = (
        parseFloat(item.total) || 
        quantity * unitPrice
      );
      
      return {
        description: description,
        quantity: quantity,
        unitPrice: unitPrice,
        total: total,
        notes: item.notes || (matchedMaterial ? `Using saved material price: $${unitPrice}` : ''),
        savedMaterialId: matchedMaterial?.id,
      };
    });
    
    // Add any explicitly selected materials that weren't included by the AI
    savedMaterials.forEach(material => {
      // Check if this material was already included
      const alreadyIncluded = processedItems.some(item => 
        item.savedMaterialId === material.id ||
        item.description.toLowerCase().includes(material.description.toLowerCase())
      );
      
      if (!alreadyIncluded) {
        processedItems.push({
          description: material.description,
          quantity: 1, // Default quantity
          unitPrice: material.unitPrice,
          total: material.unitPrice,
          notes: 'Added from saved materials',
          savedMaterialId: material.id,
        });
      }
    });
    
    return processedItems;
  } catch (error) {
    console.error('Error parsing AI response:', error, aiResponse);
    return parseLineByLine(aiResponse); // Fallback to line-by-line parsing
  }
}

/**
 * Find a matching saved material based on description similarity
 */
function findMatchingSavedMaterial(description: string, savedMaterials: any[]): any | null {
  if (!savedMaterials || savedMaterials.length === 0) return null;
  
  const descLower = description.toLowerCase();
  
  // First try exact match
  const exactMatch = savedMaterials.find(mat => 
    mat.description.toLowerCase() === descLower
  );
  
  if (exactMatch) return exactMatch;
  
  // Then try includes match
  const includesMatch = savedMaterials.find(mat => 
    descLower.includes(mat.description.toLowerCase()) ||
    mat.description.toLowerCase().includes(descLower)
  );
  
  if (includesMatch) return includesMatch;
  
  // Finally, try word match (if any word in the saved material matches)
  const words = descLower.split(/\s+/);
  const wordMatch = savedMaterials.find(mat => {
    const matWords = mat.description.toLowerCase().split(/\s+/);
    return matWords.some(matWord => 
      words.some(word => word === matWord && word.length > 3) // Only match on words longer than 3 chars
    );
  });
  
  return wordMatch || null;
}

/**
 * Parse response line by line as a fallback
 */
function parseLineByLine(text: string): any[] {
  try {
    // Simple line pattern: "Item: quantity x price = total"
    // Or "Item: $price x quantity = total"
    const linePattern = /([^:]+):\s*(?:\$?(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*[xX]\s*\$?(\d+(?:\.\d+)?))\s*=?\s*\$?(\d+(?:\.\d+)?)?/g;
    const itemPattern = /(\d+)\.\s*([^:]+)(?::\s*)?\$?(\d+(?:\.\d+)?)/g;
    const simpleItemPattern = /([^:]+):?\s*\$?(\d+(?:\.\d+)?)/g;
    
    const items = [];
    let matches;

    // Try standard line pattern first
    while ((matches = linePattern.exec(text)) !== null) {
      const [_, description, price1, quantity1, quantity2, price2, total] = matches;
      
      // Determine which format was matched
      const unitPrice = price1 || price2 || 0;
      const quantity = quantity1 || quantity2 || 1;
      
      items.push({
        description: description.trim(),
        quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice),
        total: parseFloat(total) || (parseFloat(quantity) * parseFloat(unitPrice)),
        notes: '',
      });
    }
    
    // If nothing was found, try the numbered item pattern
    if (items.length === 0) {
      while ((matches = itemPattern.exec(text)) !== null) {
        const [_, number, description, price] = matches;
        items.push({
          description: description.trim(),
          quantity: 1,
          unitPrice: parseFloat(price),
          total: parseFloat(price),
          notes: '',
        });
      }
    }
    
    // If still nothing, try a simple item:price pattern
    if (items.length === 0) {
      while ((matches = simpleItemPattern.exec(text)) !== null) {
        const [_, description, price] = matches;
        if (description && price) {
          items.push({
            description: description.trim(),
            quantity: 1,
            unitPrice: parseFloat(price),
            total: parseFloat(price),
            notes: '',
          });
        }
      }
    }
    
    // If still no items, create a single generic item with the text as description
    if (items.length === 0) {
      items.push({
        description: 'AI Generated Item',
        quantity: 1,
        unitPrice: 100,
        total: 100,
        notes: 'Generated from unstructured text: ' + text.substring(0, 100) + '...',
      });
    }
    
    return items;
  } catch (error) {
    console.error('Error in parseLineByLine:', error);
    // Return a default item as last resort
    return [{
      description: 'Landscape Service',
      quantity: 1,
      unitPrice: 100,
      total: 100,
      notes: 'Default item due to parsing error',
    }];
  }
}

/**
 * Calculate total price from line items
 */
function calculateTotalPrice(lineItems: any[]): number {
  try {
    return lineItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
  } catch (error) {
    console.error('Error calculating total price:', error);
    return 0;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id || !session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobDescription, jobType, clientId, materials = [] } = await req.json();
    
    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    // Validate jobType if provided
    if (jobType && !Object.values(JobType).includes(jobType as JobType)) {
      return NextResponse.json(
        { error: 'Invalid job type' },
        { status: 400 }
      );
    }

    // Validate clientId if provided
    if (clientId) {
      const client = await prisma.client.findUnique({
        where: { 
          id: clientId,
          companyId: session.user.companyId // Ensure client belongs to user's company
        }
      });
      
      if (!client) {
        return NextResponse.json(
          { error: 'Client not found or not authorized to access this client' },
          { status: 404 }
        );
      }
    }

    // Fetch user's saved materials if not provided
    let savedMaterials = materials;
    if (!materials || materials.length === 0) {
      // Only fetch if not provided - helps prevent unnecessary database calls
      try {
        const userSavedItems = await prisma.savedItem.findMany({
          where: { userId: session.user.id },
        });
        savedMaterials = userSavedItems;
      } catch (err) {
        console.error('Error fetching saved materials:', err);
        // Continue without saved materials if there's an error
      }
    }

    // Create job description with material information
    let enhancedDescription = jobDescription;
    if (savedMaterials && savedMaterials.length > 0) {
      enhancedDescription += "\n\nPlease use the following materials where applicable:";
      savedMaterials.forEach((material: any) => {
        enhancedDescription += `\n- ${material.description} ($${material.unitPrice}/unit)`;
      });
    }

    // Get AI-generated estimate content
    const estimateContent = await generateEstimate(
      enhancedDescription, 
      jobType || 'General Landscape Work'
    );
    
    // Parse the AI response into structured line items
    const lineItems = parseAIEstimateResponse(estimateContent, savedMaterials);
    
    // Calculate the total price
    const totalPrice = calculateTotalPrice(lineItems);
    
    // Return the structured estimate data
    return NextResponse.json({
      success: true,
      title: `${jobType || 'Landscape'} Estimate`,
      description: jobDescription,
      lineItems,
      totalPrice,
      rawResponse: estimateContent // Include raw response for debugging
    });
  } catch (error) {
    console.error('Error generating AI estimate:', error);
    return NextResponse.json(
      { error: 'Failed to generate estimate' },
      { status: 500 }
    );
  }
} 