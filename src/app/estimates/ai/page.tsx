'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Grid,
  IconButton,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Drawer,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  FormLabel,
  FormGroup
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AddIcon from '@mui/icons-material/Add';
import Navigation from '@/components/Navigation';
import { JobType } from '@prisma/client';

// Chatbot message types
type MessageRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: Date;
  loading?: boolean;
  lineItems?: any[];
  estimateTitle?: string;
}

interface EstimateData {
  title: string;
  clientId: string;
  description: string;
  jobType: string;
  lineItems: any[];
}

interface QuestionnaireStep {
  id: string;
  question: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'area' | 'materials';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  subtitle?: string;
  unit?: string;
}

export default function AIEstimatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! I can help you create landscape estimates. What type of job are you looking for a quote on?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [savedItemsDrawerOpen, setSavedItemsDrawerOpen] = useState(false);
  const [materialsDrawerOpen, setMaterialsDrawerOpen] = useState(false);
  const [currentEstimate, setCurrentEstimate] = useState<EstimateData | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveError, setSaveError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [questionnaireActive, setQuestionnaireActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, any>>({});
  const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);
  const [questionnaireError, setQuestionnaireError] = useState('');
  const [newClientDialogOpen, setNewClientDialogOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  });
  const [creatingClient, setCreatingClient] = useState(false);
  const [clientError, setClientError] = useState('');

  const questionnaireSteps: QuestionnaireStep[] = [
    {
      id: 'jobType',
      question: 'What type of landscaping work do you need?',
      type: 'select',
      options: Object.values(JobType).map(type => ({
        value: type,
        label: type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      })),
      required: true,
      subtitle: 'Select the primary type of landscaping work required'
    },
    {
      id: 'description',
      question: 'Describe the job in detail',
      type: 'text',
      placeholder: 'Please provide specifics about what needs to be done',
      required: true,
      subtitle: 'Include information about the scope, specific requirements, and any special considerations'
    },
    {
      id: 'area',
      question: 'What is the approximate area to be worked on?',
      type: 'area',
      required: true,
      subtitle: 'This helps us estimate materials and labor required'
    },
    {
      id: 'materials',
      question: 'Are there specific materials you want to use?',
      type: 'materials',
      subtitle: 'Select materials from your saved items or enter custom materials'
    }
  ];

  // Fetch clients when component mounts
  useEffect(() => {
    if (status === 'authenticated') {
      fetchClients();
      fetchMaterials();
    }
  }, [status]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/saved-items');
      if (response.ok) {
        const data = await response.json();
        setMaterials(data);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    
    // Clear input
    setInput('');

    // Add loading message
    const loadingMessage: ChatMessage = {
      role: 'assistant',
      content: 'Thinking...',
      timestamp: new Date(),
      loading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);
    setLoading(true);

    try {
      // Determine if we need to generate an estimate based on the conversation
      const shouldGenerateEstimate = needsEstimateGeneration(messages, userMessage.content);
      
      if (shouldGenerateEstimate) {
        await generateEstimate(userMessage.content);
      } else {
        // Just respond to the general question
        // Properly wrap setTimeout in a Promise
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            const assistantMessage: ChatMessage = {
              role: 'assistant',
              content: generateResponse(messages, userMessage.content),
              timestamp: new Date(),
            };
            
            // Replace loading message with actual response
            setMessages((prev) => [...prev.slice(0, prev.length - 1), assistantMessage]);
            resolve();
          }, 1000);
        });
      }
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Replace loading message with error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev.slice(0, prev.length - 1), errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const needsEstimateGeneration = (messages: ChatMessage[], latestMessage: string) => {
    // Basic heuristic - if a message contains an extensive job description or explicitly asks for an estimate
    const estimateKeywords = ['estimate', 'quote', 'pricing', 'cost', 'price', 'how much'];
    const jobDescriptionPatterns = [
      /\d+ sq(uare)? ft/i,
      /\d+ acres/i,
      /need (a|to) \w+ (installed|removed|built|designed)/i,
      /looking for (a|an) \w+ (service|installation|removal|project)/i
    ];
    
    const containsEstimateKeyword = estimateKeywords.some(keyword => 
      latestMessage.toLowerCase().includes(keyword)
    );
    
    const containsJobDescription = jobDescriptionPatterns.some(pattern => 
      pattern.test(latestMessage)
    );
    
    return containsEstimateKeyword || containsJobDescription || latestMessage.split(' ').length > 15;
  };

  const generateResponse = (messages: ChatMessage[], latestMessage: string) => {
    // Simple rule-based responses for demonstration
    if (latestMessage.toLowerCase().includes('help')) {
      return "I can help you create landscape estimates. Just describe the job you need help with, and I'll generate a detailed estimate for you.";
    }
    
    if (latestMessage.toLowerCase().includes('job type')) {
      return "I can help with various landscape jobs including lawn maintenance, landscape design, tree service, irrigation, hardscaping, cleanup, planting, and fertilization. What type of job do you need an estimate for?";
    }
    
    if (latestMessage.toLowerCase().includes('material')) {
      return "I can recommend appropriate materials for your job. Just describe the project, and I'll include suitable materials in the estimate. You can also click the 'Materials' button to see all saved materials.";
    }
    
    // Default response to encourage providing job details
    return "Could you tell me more about the landscape job you need help with? Please provide details like the size of the area, what you want done, and any specific requirements you have.";
  };

  const generateEstimate = async (description: string) => {
    try {
      // Extract job type from conversation or description
      const jobType = extractJobType(messages, description);
      
      // Add a loading message about connecting to AI
      setMessages((prev) => {
        const newMessages = [...prev];
        // Replace the "Thinking..." message with more specific info
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          content: 'Connecting to AI to generate your estimate. This might take a moment...',
        };
        return newMessages;
      });
      
      const response = await fetch('/api/ai/generate-estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: description,
          jobType: jobType || 'LANDSCAPE_DESIGN',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Error ${response.status}: Failed to generate estimate`);
      }
      
      const data = await response.json();
      
      // Check if we have line items
      if (!data.lineItems || data.lineItems.length === 0) {
        throw new Error('No line items were generated. Please try a more detailed description.');
      }
      
      // Format the estimate as a nice message with the line items
      const totalPrice = data.lineItems.reduce((sum: number, item: any) => sum + (parseFloat(item.total) || 0), 0);
      let estimateTitle = data.title || `${jobType?.toLowerCase().replace('_', ' ') || 'Landscape'} Estimate`;
      
      // Create a nicely formatted response
      const formattedResponse = `
I've created an estimate for your ${jobType?.toLowerCase().replace('_', ' ') || 'landscape'} project.`;

      // Store line items in the message object but don't render them in text
      const estimateMessage: ChatMessage = {
        role: 'assistant',
        content: formattedResponse,
        timestamp: new Date(),
        lineItems: data.lineItems,
        estimateTitle: estimateTitle,
      };
      
      // Set current estimate for potential saving
      setCurrentEstimate({
        title: estimateTitle,
        description: description,
        jobType: jobType || 'LANDSCAPE_DESIGN',
        lineItems: data.lineItems,
        clientId: '', // Will be selected when saving
      });
      
      // Replace loading message with estimate message
      setMessages((prev) => [...prev.slice(0, prev.length - 1), estimateMessage]);
    } catch (error) {
      console.error('Error generating estimate:', error);
      
      // Display a more helpful error message based on the type of error
      let errorMessage = 'Sorry, I encountered an error generating an estimate. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('No line items')) {
          errorMessage = 'I couldn\'t generate line items based on your description. Please provide more details about the job, including the type of work, area size, and specific requirements.';
        } else if (error.message.includes('429')) {
          errorMessage = 'The AI service is currently experiencing high demand. Please try again in a few moments.';
        } else if (error.message.includes('500')) {
          errorMessage = 'There was a server error while generating your estimate. The team has been notified. Please try again shortly.';
        }
      }
      
      // Replace loading message with error message
      const errorResponse: ChatMessage = {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev.slice(0, prev.length - 1), errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  const extractJobType = (messages: ChatMessage[], latestMessage: string): string | null => {
    // Map of keywords to job types
    const jobTypeKeywords: Record<string, JobType> = {
      'lawn': JobType.LAWN_MAINTENANCE,
      'mowing': JobType.LAWN_MAINTENANCE,
      'mow': JobType.LAWN_MAINTENANCE,
      'grass': JobType.LAWN_MAINTENANCE,
      'design': JobType.LANDSCAPE_DESIGN,
      'tree': JobType.TREE_SERVICE,
      'pruning': JobType.TREE_SERVICE,
      'irrigation': JobType.IRRIGATION,
      'sprinkler': JobType.IRRIGATION,
      'water': JobType.IRRIGATION,
      'hardscape': JobType.HARDSCAPING,
      'patio': JobType.HARDSCAPING,
      'walkway': JobType.HARDSCAPING,
      'path': JobType.HARDSCAPING,
      'stone': JobType.HARDSCAPING,
      'cleanup': JobType.CLEANUP,
      'clean': JobType.CLEANUP,
      'plant': JobType.PLANTING,
      'flower': JobType.PLANTING,
      'shrub': JobType.PLANTING,
      'fertilize': JobType.FERTILIZATION,
      'fertilizer': JobType.FERTILIZATION,
      'fertilization': JobType.FERTILIZATION,
      'fertilising': JobType.FERTILIZATION,
    };
    
    // Check latest message for keywords
    const messageLower = latestMessage.toLowerCase();
    for (const [keyword, jobType] of Object.entries(jobTypeKeywords)) {
      if (messageLower.includes(keyword)) {
        return jobType;
      }
    }
    
    // If not found, check previous messages
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'user') {
        const msgLower = msg.content.toLowerCase();
        for (const [keyword, jobType] of Object.entries(jobTypeKeywords)) {
          if (msgLower.includes(keyword)) {
            return jobType;
          }
        }
      }
    }
    
    // Default to null if no job type found
    return null;
  };

  const handleOpenSaveDialog = () => {
    if (!currentEstimate) return;
    setSaveDialogOpen(true);
  };

  const handleSaveEstimate = async () => {
    if (!currentEstimate || !currentEstimate.clientId) {
      setSaveError('Please select a client for this estimate');
      return;
    }
    
    try {
      // Call the API to save the estimate
      const response = await fetch('/api/estimates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: currentEstimate.title,
          description: currentEstimate.description,
          clientId: currentEstimate.clientId,
          validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          lineItems: currentEstimate.lineItems,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save estimate');
      }
      
      const data = await response.json();
      
      // Close the dialog
      setSaveDialogOpen(false);
      
      // Add success message to chat
      const successMessage: ChatMessage = {
        role: 'assistant',
        content: `Your estimate "${currentEstimate.title}" has been saved successfully! You can view and edit it in the Estimates section.`,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, successMessage]);
      
      // Reset current estimate
      setCurrentEstimate(null);
    } catch (error) {
      console.error('Error saving estimate:', error);
      setSaveError('Failed to save estimate. Please try again.');
    }
  };

  const handleClientChange = (event: any) => {
    const value = event.target.value;
    
    // If "new" is selected, open the new client dialog
    if (value === "new") {
      setNewClientDialogOpen(true);
      return;
    }
    
    setCurrentEstimate({
      ...currentEstimate!,
      clientId: value,
    });
    setSaveError('');
  };

  const startQuestionnaire = () => {
    setQuestionnaireActive(true);
    setCurrentStep(0);
    setQuestionnaireAnswers({});
    setSelectedMaterials([]);
  };

  const handleQuestionnaireChange = (stepId: string, value: any) => {
    setQuestionnaireAnswers(prev => ({
      ...prev,
      [stepId]: value
    }));
  };

  const handleMaterialSelect = (material: any, isSelected: boolean) => {
    if (isSelected) {
      setSelectedMaterials(prev => [...prev, material]);
    } else {
      setSelectedMaterials(prev => prev.filter(m => m.id !== material.id));
    }
  };

  const handleNextStep = () => {
    const currentStepData = questionnaireSteps[currentStep];
    
    // Validate current step
    if (currentStepData.required) {
      const answer = questionnaireAnswers[currentStepData.id];
      if (!answer && answer !== 0) {
        setQuestionnaireError('This field is required');
        return;
      }
    }
    
    setQuestionnaireError('');
    if (currentStep < questionnaireSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Generate estimate from questionnaire
      generateEstimateFromQuestionnaire();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      setQuestionnaireActive(false);
    }
  };

  const generateEstimateFromQuestionnaire = () => {
    // Construct a detailed job description from questionnaire answers
    const jobType = questionnaireAnswers.jobType || 'LANDSCAPE_DESIGN';
    let detailedDescription = questionnaireAnswers.description || '';
    
    // Add area information if provided
    if (questionnaireAnswers.area) {
      const { length, width, unit } = questionnaireAnswers.area;
      const area = length * width;
      detailedDescription += `\nArea: ${area} square ${unit === 'ft' ? 'feet' : 'meters'} (${length} × ${width} ${unit})`;
    }
    
    // Add materials information if selected
    if (selectedMaterials.length > 0) {
      detailedDescription += '\n\nMaterials to use:';
      selectedMaterials.forEach(material => {
        detailedDescription += `\n- ${material.description} ($${material.unitPrice} per unit)`;
      });
    }
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: detailedDescription,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Generate the estimate using the constructed description
    generateEstimate(detailedDescription, jobType);
    
    // Close the questionnaire
    setQuestionnaireActive(false);
  };

  const renderQuestionnaire = () => {
    if (!questionnaireActive) return null;
    
    const currentStepData = questionnaireSteps[currentStep];
    
    return (
      <Dialog
        open={questionnaireActive}
        onClose={() => setQuestionnaireActive(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">{currentStepData.question}</Typography>
          {currentStepData.subtitle && (
            <Typography variant="body2" color="text.secondary">
              {currentStepData.subtitle}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {currentStepData.type === 'text' && (
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder={currentStepData.placeholder}
                value={questionnaireAnswers[currentStepData.id] || ''}
                onChange={(e) => handleQuestionnaireChange(currentStepData.id, e.target.value)}
                error={!!questionnaireError}
                helperText={questionnaireError}
              />
            )}
            
            {currentStepData.type === 'select' && (
              <FormControl fullWidth error={!!questionnaireError}>
                <InputLabel>{currentStepData.question}</InputLabel>
                <Select
                  value={questionnaireAnswers[currentStepData.id] || ''}
                  onChange={(e) => handleQuestionnaireChange(currentStepData.id, e.target.value)}
                  label={currentStepData.question}
                >
                  {currentStepData.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {questionnaireError && (
                  <Typography color="error" variant="caption">
                    {questionnaireError}
                  </Typography>
                )}
              </FormControl>
            )}
            
            {currentStepData.type === 'area' && (
              <Box>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Length"
                      value={questionnaireAnswers[currentStepData.id]?.length || ''}
                      onChange={(e) => handleQuestionnaireChange(
                        currentStepData.id, 
                        { 
                          ...questionnaireAnswers[currentStepData.id] || { unit: 'ft' }, 
                          length: parseFloat(e.target.value) 
                        }
                      )}
                      error={!!questionnaireError}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">
                          {questionnaireAnswers[currentStepData.id]?.unit || 'ft'}
                        </InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2} sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">×</Typography>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Width"
                      value={questionnaireAnswers[currentStepData.id]?.width || ''}
                      onChange={(e) => handleQuestionnaireChange(
                        currentStepData.id, 
                        { 
                          ...questionnaireAnswers[currentStepData.id] || { unit: 'ft' }, 
                          width: parseFloat(e.target.value) 
                        }
                      )}
                      error={!!questionnaireError}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">
                          {questionnaireAnswers[currentStepData.id]?.unit || 'ft'}
                        </InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Unit</FormLabel>
                      <RadioGroup
                        row
                        value={questionnaireAnswers[currentStepData.id]?.unit || 'ft'}
                        onChange={(e) => handleQuestionnaireChange(
                          currentStepData.id, 
                          { 
                            ...questionnaireAnswers[currentStepData.id] || {}, 
                            unit: e.target.value 
                          }
                        )}
                      >
                        <FormControlLabel value="ft" control={<Radio />} label="Feet" />
                        <FormControlLabel value="m" control={<Radio />} label="Meters" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  {questionnaireError && (
                    <Grid item xs={12}>
                      <Typography color="error" variant="caption">
                        {questionnaireError}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
                
                {(questionnaireAnswers[currentStepData.id]?.length && questionnaireAnswers[currentStepData.id]?.width) ? (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="body1">
                      Total Area: {(
                        questionnaireAnswers[currentStepData.id].length * 
                        questionnaireAnswers[currentStepData.id].width
                      ).toFixed(2)} square {questionnaireAnswers[currentStepData.id].unit === 'ft' ? 'feet' : 'meters'}
                    </Typography>
                  </Box>
                ) : null}
              </Box>
            )}
            
            {currentStepData.type === 'materials' && (
              <Box>
                {materials.length > 0 ? (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      Your Saved Materials
                    </Typography>
                    <List>
                      {materials.map((material) => (
                        <ListItem key={material.id} divider>
                          <Checkbox
                            checked={selectedMaterials.some(m => m.id === material.id)}
                            onChange={(e) => handleMaterialSelect(material, e.target.checked)}
                          />
                          <ListItemText
                            primary={material.description}
                            secondary={`$${material.unitPrice.toFixed(2)} per unit`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No saved materials found. The AI will suggest appropriate materials for your project.
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePrevStep}>
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextStep}
          >
            {currentStep < questionnaireSteps.length - 1 ? 'Next' : 'Generate Estimate'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderStarterButton = () => {
    if (messages.length > 1) return null;
    
    return (
      <Box sx={{ textAlign: 'center', my: 3 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={startQuestionnaire}
          startIcon={<AutoFixHighIcon />}
        >
          Start Guided Estimate
        </Button>
      </Box>
    );
  };

  const handleNewClientInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewClientData({
      ...newClientData,
      [name]: value
    });
  };

  const handleCreateNewClient = async () => {
    // Validate required fields
    if (!newClientData.name || !newClientData.email || !newClientData.phone) {
      setClientError('Name, email, and phone are required');
      return;
    }
    
    if (!newClientData.address || !newClientData.city || !newClientData.state || !newClientData.zipCode) {
      setClientError('Complete address is required');
      return;
    }
    
    try {
      setCreatingClient(true);
      
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClientData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create client');
      }
      
      const client = await response.json();
      
      // Update clients list
      setClients([...clients, client]);
      
      // Select the new client
      if (currentEstimate) {
        setCurrentEstimate({
          ...currentEstimate,
          clientId: client.id
        });
      }
      
      // Close the dialog
      setNewClientDialogOpen(false);
      setClientError('');
      
      // Reset form
      setNewClientData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating client:', error);
      setClientError(error instanceof Error ? error.message : 'Failed to create client');
    } finally {
      setCreatingClient(false);
    }
  };

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: { xs: 8, sm: 8 },
          pb: 3,
          ml: { xs: 0, sm: '240px' },
          width: { xs: '100%', sm: 'calc(100% - 240px)' },
          minHeight: '100vh',
          background: '#f5f5f5',
          position: 'relative',
          zIndex: 0
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 2,
            maxWidth: 900,
            mx: 'auto',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 120px)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => router.push('/estimates')} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5" component="h1">
                AI Estimate Generator
              </Typography>
            </Box>
            <Box>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleOpenSaveDialog}
                disabled={!currentEstimate}
                sx={{ mr: 1 }}
              >
                Save Estimate
              </Button>
              <Button
                variant="outlined"
                startIcon={<CategoryIcon />}
                onClick={() => setMaterialsDrawerOpen(true)}
              >
                Materials
              </Button>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Describe the landscape job you need help with, and I'll create a detailed estimate for you.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {renderStarterButton()}
          
          {/* Chat messages */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
            <List>
              {messages.map((message, index) => (
                <ListItem
                  key={index}
                  alignItems="flex-start"
                  sx={{
                    flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                    gap: 1,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                      width: 32,
                      height: 32,
                    }}
                  >
                    {message.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                  </Avatar>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: message.role === 'user' ? 'primary.light' : 'background.paper',
                      borderRadius: 2,
                    }}
                  >
                    {message.loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        <Typography>{message.content}</Typography>
                      </Box>
                    ) : (
                      <>
                        <Typography
                          component="div"
                          variant="body1"
                          sx={{ whiteSpace: 'pre-wrap' }}
                        >
                          {message.content}
                        </Typography>
                        
                        {/* Display line items if they exist */}
                        {message.lineItems && message.lineItems.length > 0 && (
                          <Box sx={{ mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              {message.estimateTitle}
                            </Typography>
                            
                            <List sx={{ bgcolor: 'background.paper', mb: 2 }}>
                              {message.lineItems.map((item: any, idx: number) => (
                                <ListItem 
                                  key={idx} 
                                  divider={idx < message.lineItems!.length - 1}
                                  sx={{ flexDirection: 'column', alignItems: 'stretch' }}
                                >
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                                    <TextField
                                      fullWidth
                                      label="Description"
                                      value={item.description}
                                      onChange={(e) => {
                                        const updatedLineItems = [...message.lineItems!];
                                        updatedLineItems[idx] = {...item, description: e.target.value};
                                        
                                        // We need to update both the message and the current estimate
                                        setMessages(prevMessages => 
                                          prevMessages.map((msg, i) => 
                                            i === index ? {...msg, lineItems: updatedLineItems} : msg
                                          )
                                        );
                                        
                                        if (currentEstimate && message.lineItems === currentEstimate.lineItems) {
                                          setCurrentEstimate({
                                            ...currentEstimate,
                                            lineItems: updatedLineItems
                                          });
                                        }
                                      }}
                                      size="small"
                                      sx={{ mr: 1 }}
                                    />
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <TextField
                                      label="Quantity"
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => {
                                        const quantity = Number(e.target.value);
                                        const total = quantity * item.unitPrice;
                                        
                                        const updatedLineItems = [...message.lineItems!];
                                        updatedLineItems[idx] = {...item, quantity, total};
                                        
                                        setMessages(prevMessages => 
                                          prevMessages.map((msg, i) => 
                                            i === index ? {...msg, lineItems: updatedLineItems} : msg
                                          )
                                        );
                                        
                                        if (currentEstimate && message.lineItems === currentEstimate.lineItems) {
                                          setCurrentEstimate({
                                            ...currentEstimate,
                                            lineItems: updatedLineItems
                                          });
                                        }
                                      }}
                                      size="small"
                                      InputProps={{ inputProps: { min: 1 } }}
                                      sx={{ width: '100px', mr: 1 }}
                                    />
                                    
                                    <Typography sx={{ mx: 1 }}>×</Typography>
                                    
                                    <TextField
                                      label="Unit Price ($)"
                                      type="number"
                                      value={item.unitPrice}
                                      onChange={(e) => {
                                        const unitPrice = Number(e.target.value);
                                        const total = item.quantity * unitPrice;
                                        
                                        const updatedLineItems = [...message.lineItems!];
                                        updatedLineItems[idx] = {...item, unitPrice, total};
                                        
                                        setMessages(prevMessages => 
                                          prevMessages.map((msg, i) => 
                                            i === index ? {...msg, lineItems: updatedLineItems} : msg
                                          )
                                        );
                                        
                                        if (currentEstimate && message.lineItems === currentEstimate.lineItems) {
                                          setCurrentEstimate({
                                            ...currentEstimate,
                                            lineItems: updatedLineItems
                                          });
                                        }
                                      }}
                                      size="small"
                                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                                      sx={{ width: '150px', mr: 1 }}
                                    />
                                    
                                    <Typography sx={{ mx: 1 }}>=</Typography>
                                    
                                    <Typography sx={{ ml: 1, fontWeight: 'bold' }}>
                                      ${(item.quantity * item.unitPrice).toFixed(2)}
                                    </Typography>
                                    
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={() => {
                                        const updatedLineItems = message.lineItems!.filter((_, i) => i !== idx);
                                        
                                        setMessages(prevMessages => 
                                          prevMessages.map((msg, i) => 
                                            i === index ? {...msg, lineItems: updatedLineItems} : msg
                                          )
                                        );
                                        
                                        if (currentEstimate && message.lineItems === currentEstimate.lineItems) {
                                          setCurrentEstimate({
                                            ...currentEstimate,
                                            lineItems: updatedLineItems
                                          });
                                        }
                                      }}
                                      sx={{ ml: 'auto' }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </ListItem>
                              ))}
                            </List>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                  const newItem = {
                                    description: "New Item",
                                    quantity: 1,
                                    unitPrice: 0,
                                    total: 0
                                  };
                                  
                                  const updatedLineItems = [...message.lineItems!, newItem];
                                  
                                  setMessages(prevMessages => 
                                    prevMessages.map((msg, i) => 
                                      i === index ? {...msg, lineItems: updatedLineItems} : msg
                                    )
                                  );
                                  
                                  if (currentEstimate && message.lineItems === currentEstimate.lineItems) {
                                    setCurrentEstimate({
                                      ...currentEstimate,
                                      lineItems: updatedLineItems
                                    });
                                  }
                                }}
                              >
                                Add Item
                              </Button>
                              
                              <Typography variant="h6">
                                Total: ${message.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ContentCopyIcon />}
                                onClick={() => {
                                  const estimateText = `${message.estimateTitle}\n\n${
                                    message.lineItems.map((item: any, i: number) => 
                                      `${i+1}. ${item.description}: ${item.quantity} × $${item.unitPrice.toFixed(2)} = $${(item.quantity * item.unitPrice).toFixed(2)}`
                                    ).join('\n')
                                  }\n\nTotal: $${message.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}`;
                                  
                                  navigator.clipboard.writeText(estimateText);
                                }}
                              >
                                Copy
                              </Button>
                              
                              <Button
                                variant="contained"
                                size="small"
                                onClick={handleOpenSaveDialog}
                                startIcon={<SaveIcon />}
                              >
                                Save Estimate
                              </Button>
                            </Box>
                          </Box>
                        )}
                        
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </>
                    )}
                  </Paper>
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
          </Box>
          
          {/* Input box */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Describe your landscape job..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              disabled={loading}
              variant="outlined"
              size="medium"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              endIcon={<SendIcon />}
            >
              Send
            </Button>
          </Box>
        </Paper>
        
        {/* Saved Items Drawer */}
        <Drawer
          anchor="right"
          open={savedItemsDrawerOpen}
          onClose={() => setSavedItemsDrawerOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 } } }}
        >
          {/* Saved items content */}
        </Drawer>
        
        {/* Materials Drawer */}
        <Drawer
          anchor="right"
          open={materialsDrawerOpen}
          onClose={() => setMaterialsDrawerOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 } } }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Saved Materials</Typography>
              <IconButton onClick={() => setMaterialsDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {materials.length === 0 ? (
              <Typography align="center" sx={{ my: 4 }}>
                No saved materials found.
              </Typography>
            ) : (
              <List>
                {materials.map((material: any) => (
                  <ListItem key={material.id} divider>
                    <ListItemText
                      primary={material.description}
                      secondary={`$${material.unitPrice.toFixed(2)} per unit`}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        // Add this material to the chat
                        setInput((prev) => 
                          prev + `\nI need ${material.description} for my project.`
                        );
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
            
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setMaterialsDrawerOpen(false);
                router.push('/estimates/materials');
              }}
              sx={{ mt: 2 }}
            >
              Manage Materials
            </Button>
          </Box>
        </Drawer>
        
        {/* Save Estimate Dialog */}
        <Dialog
          open={saveDialogOpen}
          onClose={() => setSaveDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Save Estimate</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Estimate Title"
                value={currentEstimate?.title || ''}
                onChange={(e) => setCurrentEstimate({...currentEstimate!, title: e.target.value})}
                margin="normal"
                required
              />
              
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="client-select-label">Client</InputLabel>
                <Select
                  labelId="client-select-label"
                  value={currentEstimate?.clientId || ''}
                  onChange={handleClientChange}
                  label="Client"
                >
                  <MenuItem value="" disabled>
                    Select a client
                  </MenuItem>
                  {loadingClients ? (
                    <MenuItem disabled>Loading clients...</MenuItem>
                  ) : (
                    <>
                      {clients.map((client: any) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.name}
                        </MenuItem>
                      ))}
                      <Divider />
                      <MenuItem value="new" onClick={() => setNewClientDialogOpen(true)}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AddIcon fontSize="small" sx={{ mr: 1 }} />
                          Add New Client
                        </Box>
                      </MenuItem>
                    </>
                  )}
                </Select>
              </FormControl>
              
              {saveError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {saveError}
                </Alert>
              )}
              
              {currentEstimate && currentEstimate.lineItems && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Line Items ({currentEstimate.lineItems.length})
                  </Typography>
                  <List>
                    {currentEstimate.lineItems.map((item: any, index: number) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={item.description}
                          secondary={`${item.quantity} × $${item.unitPrice.toFixed(2)} = $${item.total.toFixed(2)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Typography variant="subtitle1">
                      Total: ${currentEstimate.lineItems.reduce((sum: number, item: any) => 
                        sum + (parseFloat(item.total) || 0), 0).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveEstimate}
              disabled={!currentEstimate || !currentEstimate.clientId}
            >
              Save Estimate
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* New Client Dialog */}
        <Dialog
          open={newClientDialogOpen}
          onClose={() => setNewClientDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add New Client</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Client Name"
                  name="name"
                  value={newClientData.name}
                  onChange={handleNewClientInputChange}
                  required
                  error={clientError.includes('Name')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={newClientData.email}
                  onChange={handleNewClientInputChange}
                  required
                  error={clientError.includes('email')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={newClientData.phone}
                  onChange={handleNewClientInputChange}
                  required
                  error={clientError.includes('phone')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={newClientData.address}
                  onChange={handleNewClientInputChange}
                  required
                  error={clientError.includes('address')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={newClientData.city}
                  onChange={handleNewClientInputChange}
                  required
                  error={clientError.includes('city')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={newClientData.state}
                  onChange={handleNewClientInputChange}
                  required
                  error={clientError.includes('state')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  name="zipCode"
                  value={newClientData.zipCode}
                  onChange={handleNewClientInputChange}
                  required
                  error={clientError.includes('zip')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={3}
                  value={newClientData.notes}
                  onChange={handleNewClientInputChange}
                />
              </Grid>
            </Grid>
            
            {clientError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {clientError}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewClientDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateNewClient}
              disabled={creatingClient}
              startIcon={creatingClient ? <CircularProgress size={20} /> : null}
            >
              {creatingClient ? 'Creating...' : 'Create Client'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {renderQuestionnaire()}
      </Box>
    </>
  );
} 