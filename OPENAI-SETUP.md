# OpenAI Integration Setup

This document explains how to set up the OpenAI integration for the AI-powered estimate generator.

## Environment Variables

You need to add your OpenAI API key to the environment variables. Create or edit the `.env.local` file in the root directory and add the following:

```bash
# OpenAI API Key
OPENAI_API_KEY="your-openai-api-key"
```

Replace `your-openai-api-key` with your actual OpenAI API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys).

## Installation

We've already installed the required OpenAI package. If you need to install it manually:

```bash
npm install openai
```

## Usage

The OpenAI integration is now available in the Estimate creation flow. When creating a new estimate, you can:

1. Fill in the client information and basic estimate details
2. On the "Line Items" step, use the AI Estimate Generator to automatically generate line items based on your job description
3. Edit the generated items as needed or add more manually

## Features

The AI integration provides:

- **Smart estimate generation**: Create line items from natural language descriptions
- **Material recommendations**: Automatically suggest materials based on job type
- **Pricing suggestions**: Get realistic pricing based on the scope of work

## Troubleshooting

If you encounter issues with the OpenAI integration:

1. **API Key Issues**: Make sure your OpenAI API key is correctly set in the `.env.local` file
2. **Rate Limits**: Be aware of OpenAI's rate limits for your account tier
3. **Network Issues**: Ensure your server has internet access to reach OpenAI's API

## Cost Management

Using the OpenAI API incurs costs based on your usage. To manage costs:

1. The integration defaults to GPT-4 for best results, but you can switch to GPT-3.5-turbo for lower costs
2. Monitor your usage in the OpenAI dashboard
3. Set spending limits in your OpenAI account

## Security Considerations

- Never expose your OpenAI API key in client-side code
- All API calls are made server-side in Next.js API routes
- Consider data privacy when sending job descriptions to OpenAI 