import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/settings/estimates - Get user settings for estimates
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get user settings or create default settings if not exist
    const settings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!settings) {
      // Return default settings
      return NextResponse.json({
        company: {
          companyName: '',
          companyLogo: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          phone: '',
          email: '',
          website: '',
          taxId: '',
        },
        estimates: {
          defaultValidDays: 30,
          showTaxes: true,
          taxRate: 0,
          defaultTerms: '',
          defaultNotes: '',
          numberingPrefix: 'EST-',
          footerText: '',
        },
        branding: {
          primaryColor: '#4CAF50',
          accentColor: '#2196F3',
          fontFamily: 'Arial',
          showLogo: true,
          logoPosition: 'left',
          pdfTemplate: 'standard',
        },
      });
    }

    // Parse JSON data from settings
    const company = settings.companySettings ? JSON.parse(settings.companySettings) : {};
    const estimates = settings.estimateSettings ? JSON.parse(settings.estimateSettings) : {};
    const branding = settings.brandingSettings ? JSON.parse(settings.brandingSettings) : {};

    return NextResponse.json({
      company,
      estimates,
      branding,
    });
  } catch (error) {
    console.error('Error fetching estimate settings:', error);
    return NextResponse.json(
      { message: 'Error fetching estimate settings' },
      { status: 500 }
    );
  }
}

// POST /api/settings/estimates - Save user settings for estimates
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // Validate data
    if (!data.company || !data.estimates || !data.branding) {
      return NextResponse.json(
        { message: 'Missing required settings sections' },
        { status: 400 }
      );
    }

    // Convert settings objects to JSON strings
    const companySettings = JSON.stringify(data.company);
    const estimateSettings = JSON.stringify(data.estimates);
    const brandingSettings = JSON.stringify(data.branding);

    // Upsert user settings (create if not exist, update if exist)
    const settings = await prisma.userSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        companySettings,
        estimateSettings,
        brandingSettings,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        companySettings,
        estimateSettings,
        brandingSettings,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving estimate settings:', error);
    return NextResponse.json(
      { message: 'Error saving estimate settings' },
      { status: 500 }
    );
  }
} 