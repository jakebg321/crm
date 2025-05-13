import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as nodemailer from 'nodemailer';
// In a production environment, you would use a real PDF generation library like PDFKit or jsPDF
// For this example, we'll create a placeholder for PDF generation

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const estimateId = params.id;
    const { to, subject, message, sendCopy } = await req.json();
    
    // Validate input
    if (!to || !subject) {
      return NextResponse.json(
        { message: 'Email and subject are required' },
        { status: 400 }
      );
    }
    
    // Fetch the estimate with client and line items
    const estimate = await prisma.estimate.findUnique({
      where: { id: estimateId },
      include: {
        client: true,
        lineItems: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!estimate) {
      return NextResponse.json(
        { message: 'Estimate not found' },
        { status: 404 }
      );
    }
    
    // Generate PDF of the estimate (placeholder)
    const pdfBuffer = await generateEstimatePDF(estimate);
    
    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      // In production, use your actual SMTP settings
      // For this example, we'll use a placeholder
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'user@example.com',
        pass: process.env.SMTP_PASSWORD || 'password',
      },
    });
    
    const mailOptions = {
      from: `${session.user.name} <${process.env.SMTP_USER || 'user@example.com'}>`,
      to: to,
      subject: subject,
      text: message,
      html: message.replace(/\n/g, '<br>'),
      attachments: [
        {
          filename: `Estimate-${estimate.title.replace(/\s+/g, '-')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        }
      ]
    };
    
    // Add CC if sendCopy is true
    if (sendCopy && session.user.email) {
      mailOptions.cc = session.user.email;
    }
    
    // Send the email
    await transporter.sendMail(mailOptions);
    
    // Update estimate status to SENT if it's currently DRAFT
    if (estimate.status === 'DRAFT') {
      await prisma.estimate.update({
        where: { id: estimateId },
        data: { status: 'SENT' },
      });
    }
    
    // Log the email activity
    // You could create an Activity model in your schema to track all actions
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending estimate email:', error);
    return NextResponse.json(
      { message: 'Error sending email' },
      { status: 500 }
    );
  }
}

// Placeholder function for PDF generation
// In a real implementation, you would use a proper PDF library
async function generateEstimatePDF(estimate: any): Promise<Buffer> {
  // This is a placeholder - in production, use a real PDF generation library
  // such as PDFKit, jsPDF, or react-pdf
  
  // For now, we'll return a simple buffer with some text
  const content = `
    ESTIMATE
    
    Title: ${estimate.title}
    Description: ${estimate.description}
    Client: ${estimate.client.name}
    Email: ${estimate.client.email}
    Phone: ${estimate.client.phone}
    
    Valid Until: ${new Date(estimate.validUntil).toLocaleDateString()}
    
    Line Items:
    ${estimate.lineItems.map(item => 
      `- ${item.description}: ${item.quantity} x $${item.unitPrice.toFixed(2)} = $${(item.quantity * item.unitPrice).toFixed(2)}`
    ).join('\n')}
    
    Total: $${estimate.price.toFixed(2)}
    
    Thank you for your business!
  `;
  
  return Buffer.from(content);
} 