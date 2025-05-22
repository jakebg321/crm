import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzeMaterialRequirements } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import { JobType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id || !session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobDescription, jobType, area } = await req.json();
    
    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    if (!area || area <= 0) {
      return NextResponse.json(
        { error: 'Valid area is required' },
        { status: 400 }
      );
    }

    // We're now more flexible with jobType - it can be a string with multiple types
    // or even include custom types, so we don't validate it strictly against the enum
    // if (jobType && !Object.values(JobType).includes(jobType as JobType)) {
    //   return NextResponse.json(
    //     { error: 'Invalid job type' },
    //     { status: 400 }
    //   );
    // }

    // Fetch user's saved materials for context
    let savedMaterials = [];
    try {
      savedMaterials = await prisma.savedItem.findMany({
        where: { userId: session.user.id },
      });
    } catch (err) {
      console.error('Error fetching saved materials:', err);
      // Continue without saved materials if there's an error
    }

    // Create enhanced job description with saved materials context
    let enhancedDescription = jobDescription;
    if (savedMaterials && savedMaterials.length > 0) {
      enhancedDescription += "\n\nConsider using the following materials if appropriate:";
      savedMaterials.forEach((material: any) => {
        enhancedDescription += `\n- ${material.description} ($${material.unitPrice}/unit)`;
      });
    }

    // Enhance description with job type context
    if (jobType) {
      enhancedDescription += `\n\nThis is for a ${jobType} project.`;
    }
    
    // Add area information
    enhancedDescription += `\n\nThe total area is approximately ${area} square feet.`;

    // Get AI-generated material requirements
    const materialRequirementsJson = await analyzeMaterialRequirements(
      enhancedDescription, 
      area
    );
    
    // Parse the response
    let materialRequirements;
    try {
      if (typeof materialRequirementsJson === 'string') {
        materialRequirements = JSON.parse(materialRequirementsJson);
      } else {
        materialRequirements = materialRequirementsJson;
      }
    } catch (error) {
      console.error('Error parsing material requirements:', error);
      return NextResponse.json(
        { error: 'Failed to parse material requirements' },
        { status: 500 }
      );
    }
    
    // Return the structured materials data
    return NextResponse.json({
      success: true,
      jobType,
      description: jobDescription,
      area,
      materials: materialRequirements.materials || [],
      rawResponse: materialRequirementsJson // Include raw response for debugging
    });
  } catch (error) {
    console.error('Error analyzing material requirements:', error);
    return NextResponse.json(
      { error: 'Failed to analyze material requirements' },
      { status: 500 }
    );
  }
} 