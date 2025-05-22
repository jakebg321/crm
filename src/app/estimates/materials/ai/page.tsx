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
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Divider,
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
  InputAdornment,
  FormLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Snackbar,
  Checkbox,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import { JobType } from '@prisma/client';
import { formatCurrency } from '@/utils/formatters';

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

interface MaterialItem {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  unitPrice?: number;
  total?: number;
  savedMaterialId?: string;
  isEditing?: boolean;
  isSelected?: boolean;
}

export default function AIMaterialsEstimatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedMaterials, setSavedMaterials] = useState<any[]>([]);
  const [materialResults, setMaterialResults] = useState<MaterialItem[]>([]);
  const [editableMaterialResults, setEditableMaterialResults] = useState<MaterialItem[]>([]);
  const [bulkSaveMode, setBulkSaveMode] = useState(false);
  const [savingAllMaterials, setSavingAllMaterials] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [lastSavedProject, setLastSavedProject] = useState<{
    jobType: string;
    description: string;
    area: any;
  } | null>(null);
  const [questionnaireActive, setQuestionnaireActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, any>>({});
  const [questionnaireError, setQuestionnaireError] = useState('');
  const [savingToLibrary, setSavingToLibrary] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    description: '',
    unitPrice: 0,
    quantity: 1,
    category: 'Other',
  });
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const questionnaireSteps: QuestionnaireStep[] = [
    {
      id: 'jobType',
      question: 'What type of landscaping work are you planning?',
      type: 'multiselect',
      options: [
        ...Object.values(JobType).map(type => ({
          value: type,
          label: type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        })),
        { value: 'CUSTOM', label: 'Custom (Specify Below)' }
      ],
      required: true,
      subtitle: 'Select all applicable types of landscaping work'
    },
    {
      id: 'customJobType',
      question: 'Describe your custom work type',
      type: 'text',
      placeholder: 'Enter details about the custom work type',
      required: false,
      subtitle: 'Only needed if you selected "Custom" above',
      defaultValue: ''
    },
    {
      id: 'description',
      question: 'Describe the project in detail',
      type: 'text',
      placeholder: 'Please provide specifics about what you want to build or install',
      required: true,
      subtitle: 'Include information about the materials you think you might need'
    },
    {
      id: 'area',
      question: 'What is the approximate area to be worked on?',
      type: 'area',
      required: true,
      subtitle: 'This helps us calculate material quantities more accurately'
    }
  ];

  // Fetch materials when component mounts
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSavedMaterials();
    }
  }, [status]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchSavedMaterials = async () => {
    try {
      const response = await fetch('/api/saved-items');
      if (response.ok) {
        const data = await response.json();
        setSavedMaterials(data);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const startQuestionnaire = () => {
    setQuestionnaireActive(true);
    setQuestionnaireAnswers({});
    setCurrentStep(0);
  };

  const handleQuestionnaireChange = (stepId: string, value: any) => {
    setQuestionnaireAnswers(prev => ({
      ...prev,
      [stepId]: value
    }));
  };

  const handleNextStep = () => {
    const currentQuestionStep = questionnaireSteps[currentStep];
    
    if (currentQuestionStep.required && !questionnaireAnswers[currentQuestionStep.id]) {
      setQuestionnaireError(`Please answer this question before continuing`);
      return;
    }
    
    setQuestionnaireError('');
    
    // Get the next step index
    let nextStepIndex = currentStep + 1;
    
    // Skip customJobType step if CUSTOM wasn't selected
    if (currentQuestionStep.id === 'jobType' && 
        nextStepIndex < questionnaireSteps.length && 
        questionnaireSteps[nextStepIndex].id === 'customJobType') {
      
      const selectedJobTypes = questionnaireAnswers.jobType || [];
      const hasCustomType = Array.isArray(selectedJobTypes) ? 
        selectedJobTypes.includes('CUSTOM') : 
        selectedJobTypes === 'CUSTOM';
      
      if (!hasCustomType) {
        // Skip to the step after customJobType
        nextStepIndex += 1;
      }
    }
    
    if (nextStepIndex < questionnaireSteps.length) {
      setCurrentStep(nextStepIndex);
    } else {
      // Last step - generate materials estimate
      generateMaterialsEstimate();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      // First step - cancel questionnaire
      setQuestionnaireActive(false);
    }
  };

  const generateMaterialsEstimate = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Handle multiple job types and custom type
      let jobTypes = questionnaireAnswers.jobType || ['GENERAL'];
      let jobTypeString = '';
      
      if (Array.isArray(jobTypes)) {
        // Check if custom is included
        if (jobTypes.includes('CUSTOM') && questionnaireAnswers.customJobType) {
          jobTypeString = `${jobTypes.filter(t => t !== 'CUSTOM').join(', ')}${jobTypes.length > 1 ? ', and ' : ''}${questionnaireAnswers.customJobType}`;
        } else {
          jobTypeString = jobTypes.join(', ').replace(/_/g, ' ');
        }
      } else {
        jobTypeString = jobTypes;
      }
      
      const description = questionnaireAnswers.description || '';
      const area = questionnaireAnswers.area?.value || 100;
      const unit = questionnaireAnswers.area?.unit || 'ft';
      
      // Convert to square feet if necessary
      const areaInSqFt = unit === 'm' ? area * 10.764 : area;
      
      const response = await fetch('/api/ai/material-requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: description,
          jobType: jobTypeString,
          area: areaInSqFt,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to generate materials estimate`);
      }
      
      const data = await response.json();
      
      if (!data.materials || data.materials.length === 0) {
        throw new Error('No materials were generated. Please try a more detailed description.');
      }
      
      // Process materials to add pricing from saved materials where possible
      const processedMaterials = data.materials.map((material: MaterialItem) => {
        // Try to find matching saved material
        const matchedMaterial = findMatchingSavedMaterial(material.name);
        
        return {
          ...material,
          unitPrice: matchedMaterial ? matchedMaterial.unitPrice : 0,
          total: matchedMaterial ? matchedMaterial.unitPrice * material.quantity : 0,
          savedMaterialId: matchedMaterial?.id,
          isEditing: false,
          isSelected: false,
        };
      });
      
      setMaterialResults(processedMaterials);
      setEditableMaterialResults(processedMaterials);
      
      // Save the project details for potential reuse
      setLastSavedProject({
        jobType: jobTypeString,
        description,
        area: questionnaireAnswers.area
      });
      
      setQuestionnaireActive(false);
    } catch (error) {
      console.error('Error generating materials estimate:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const findMatchingSavedMaterial = (description: string): any | null => {
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
  };

  const handleSaveToLibrary = (material: MaterialItem) => {
    setNewMaterial({
      description: material.name,
      unitPrice: material.unitPrice || 0,
      quantity: material.quantity || 1,
      category: getCategoryFromMaterial(material),
    });
    setSaveDialogOpen(true);
  };

  const getCategoryFromMaterial = (material: MaterialItem): string => {
    // Simple logic to determine category based on material name or unit
    const name = material.name.toLowerCase();
    
    if (name.includes('wood') || name.includes('lumber') || name.includes('timber')) return 'Wood';
    if (name.includes('stone') || name.includes('paver') || name.includes('rock')) return 'Stone';
    if (name.includes('plant') || name.includes('shrub') || name.includes('tree')) return 'Plants';
    if (name.includes('soil') || name.includes('mulch') || name.includes('dirt')) return 'Soil';
    if (name.includes('tool')) return 'Tools';
    if (name.includes('concrete') || name.includes('cement')) return 'Concrete';
    
    return 'Other';
  };

  const handleSaveMaterial = async () => {
    setSavingToLibrary(true);
    
    try {
      const response = await fetch('/api/saved-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: newMaterial.description,
          unitPrice: newMaterial.unitPrice,
          quantity: newMaterial.quantity,
          category: newMaterial.category,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save material');
      }

      // Refresh saved materials
      await fetchSavedMaterials();
      setSaveDialogOpen(false);
    } catch (err) {
      setError('Failed to save material to library');
    } finally {
      setSavingToLibrary(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (name === 'unitPrice' || name === 'quantity') {
      setNewMaterial({
        ...newMaterial,
        [name]: parseFloat(value as string) || 0,
      });
    } else {
      setNewMaterial({
        ...newMaterial,
        [name as string]: value,
      });
    }
  };

  const calculateTotalCost = (): number => {
    return materialResults.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const renderQuestionnaire = () => {
    const currentQuestion = questionnaireSteps[currentStep];
    
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Step {currentStep + 1} of {questionnaireSteps.length}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => setQuestionnaireActive(false)}
            >
              Cancel
            </Button>
          </Box>
          
          <Typography variant="h5" gutterBottom>
            {currentQuestion.question}
          </Typography>
          
          {currentQuestion.subtitle && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              {currentQuestion.subtitle}
            </Typography>
          )}
          
          {questionnaireError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {questionnaireError}
            </Alert>
          )}
          
          {currentQuestion.type === 'text' && (
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder={currentQuestion.placeholder}
              value={questionnaireAnswers[currentQuestion.id] || ''}
              onChange={(e) => handleQuestionnaireChange(currentQuestion.id, e.target.value)}
              sx={{ mb: 3 }}
            />
          )}
          
          {currentQuestion.type === 'select' && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select an option</InputLabel>
              <Select
                value={questionnaireAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleQuestionnaireChange(currentQuestion.id, e.target.value)}
                label="Select an option"
              >
                {currentQuestion.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          {currentQuestion.type === 'area' && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  type="number"
                  label="Area"
                  variant="outlined"
                  value={questionnaireAnswers[currentQuestion.id]?.value || ''}
                  onChange={(e) => handleQuestionnaireChange(currentQuestion.id, {
                    value: parseFloat(e.target.value) || 0,
                    unit: questionnaireAnswers[currentQuestion.id]?.unit || 'ft'
                  })}
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={questionnaireAnswers[currentQuestion.id]?.unit || 'ft'}
                    onChange={(e) => handleQuestionnaireChange(currentQuestion.id, {
                      value: questionnaireAnswers[currentQuestion.id]?.value || 0,
                      unit: e.target.value
                    })}
                    label="Unit"
                  >
                    <MenuItem value="ft">Square Feet</MenuItem>
                    <MenuItem value="m">Square Meters</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
          
          {currentQuestion.type === 'multiselect' && (
            <Box>
              {currentQuestion.options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={Array.isArray(questionnaireAnswers[currentQuestion.id]) && 
                        questionnaireAnswers[currentQuestion.id]?.includes(option.value)}
                      onChange={(e) => {
                        const currentValues = Array.isArray(questionnaireAnswers[currentQuestion.id]) 
                          ? [...questionnaireAnswers[currentQuestion.id]] 
                          : [];
                        
                        if (e.target.checked) {
                          handleQuestionnaireChange(
                            currentQuestion.id, 
                            [...currentValues, option.value]
                          );
                        } else {
                          handleQuestionnaireChange(
                            currentQuestion.id, 
                            currentValues.filter(v => v !== option.value)
                          );
                        }
                      }}
                    />
                  }
                  label={option.label}
                />
              ))}
              {questionnaireError && (
                <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                  {questionnaireError}
                </Typography>
              )}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
            <Button
              variant="outlined"
              onClick={handlePrevStep}
            >
              {currentStep === 0 ? 'Cancel' : 'Previous'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNextStep}
            >
              {currentStep === questionnaireSteps.length - 1 ? 'Generate Materials List' : 'Next'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderMaterialResults = () => {
    if (editableMaterialResults.length === 0) return null;
    
    const totalCost = editableMaterialResults.reduce((sum, item) => sum + (item.total || 0), 0);
    const hasSelectedItems = editableMaterialResults.some(material => material.isSelected);
    
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Recommended Materials
          </Typography>
          <Box>
            {bulkSaveMode ? (
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setBulkSaveMode(false)}
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={savingAllMaterials ? <CircularProgress size={20} /> : <LibraryAddCheckIcon />}
                  onClick={saveAllSelectedMaterials}
                  disabled={savingAllMaterials || !hasSelectedItems}
                >
                  Save Selected
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={() => setBulkSaveMode(true)}
                sx={{ mr: 1 }}
              >
                Bulk Save
              </Button>
            )}
          </Box>
        </Box>
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          Based on your project description, here are the materials you'll need.
          {totalCost > 0 && ` Estimated total cost: ${formatCurrency(totalCost)}`}
        </Typography>
        
        {/* Display the job types */}
        {lastSavedProject?.jobType && (
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={`Job Type: ${lastSavedProject.jobType}`} 
              color="primary" 
              variant="outlined"
            />
          </Box>
        )}
        
        <TableContainer sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                {bulkSaveMode && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        editableMaterialResults.some(m => m.isSelected) && 
                        !editableMaterialResults.every(m => m.isSelected)
                      }
                      checked={editableMaterialResults.every(m => m.isSelected)}
                      onChange={(e) => toggleAllSelections(e.target.checked)}
                    />
                  </TableCell>
                )}
                <TableCell>Material</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {editableMaterialResults.map((material, index) => (
                <TableRow key={index}>
                  {bulkSaveMode && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={!!material.isSelected}
                        onChange={() => toggleMaterialSelection(index)}
                        disabled={!!material.savedMaterialId}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    {material.isEditing ? (
                      <TextField
                        fullWidth
                        size="small"
                        value={material.name}
                        onChange={(e) => handleMaterialEdit(index, 'name', e.target.value)}
                      />
                    ) : (
                      <>
                        {material.name}
                        {material.notes && (
                          <Typography variant="caption" display="block" color="textSecondary">
                            {material.notes}
                          </Typography>
                        )}
                        {material.savedMaterialId && (
                          <Chip size="small" label="Saved" color="success" sx={{ mt: 0.5 }} />
                        )}
                      </>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {material.isEditing ? (
                      <TextField
                        size="small"
                        type="number"
                        value={material.quantity}
                        onChange={(e) => handleMaterialEdit(index, 'quantity', parseFloat(e.target.value) || 0)}
                        InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                        sx={{ width: '80px' }}
                      />
                    ) : (
                      material.quantity
                    )}
                  </TableCell>
                  <TableCell>
                    {material.isEditing ? (
                      <TextField
                        size="small"
                        value={material.unit}
                        onChange={(e) => handleMaterialEdit(index, 'unit', e.target.value)}
                        sx={{ width: '80px' }}
                      />
                    ) : (
                      material.unit
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {material.isEditing ? (
                      <TextField
                        size="small"
                        type="number"
                        value={material.unitPrice || 0}
                        onChange={(e) => handleMaterialEdit(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        InputProps={{ 
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: { min: 0, step: 0.01 }
                        }}
                        sx={{ width: '120px' }}
                      />
                    ) : (
                      material.unitPrice ? formatCurrency(material.unitPrice) : 'N/A'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {material.total ? formatCurrency(material.total) : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {material.isEditing ? (
                        <Tooltip title="Save Changes">
                          <IconButton 
                            size="small" 
                            onClick={() => toggleEditMode(index)}
                            color="primary"
                          >
                            <SaveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => toggleEditMode(index)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {!bulkSaveMode && (
                        <Tooltip title={material.savedMaterialId ? "Already Saved" : "Save to Library"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleSaveToLibrary(material)}
                              disabled={!!material.savedMaterialId}
                              color={material.savedMaterialId ? "default" : "primary"}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Copy to Clipboard">
                        <IconButton
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${material.name}: ${material.quantity} ${material.unit} - ${formatCurrency(material.unitPrice || 0)}`
                            );
                            setSnackbarMessage('Material copied to clipboard');
                            setSnackbarOpen(true);
                          }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => {
                setEditableMaterialResults([]);
                setMaterialResults([]);
                startQuestionnaire();
              }}
              sx={{ mr: 1 }}
            >
              New Estimate
            </Button>
            
            {lastSavedProject && (
              <Button
                variant="outlined"
                onClick={reusePreviousProject}
              >
                Reuse Previous Project
              </Button>
            )}
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/estimates/materials')}
          >
            Go to Materials Library
          </Button>
        </Box>
      </Paper>
    );
  };

  const renderStarterButton = () => {
    if (questionnaireActive || materialResults.length > 0) return null;
    
    return (
      <Box sx={{ textAlign: 'center', p: 5 }}>
        <Typography variant="h5" gutterBottom>
          AI Materials Estimator
        </Typography>
        <Typography variant="body1" paragraph>
          Get an AI-generated list of materials needed for your landscaping project
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={startQuestionnaire}
          sx={{ mt: 2 }}
        >
          Start Materials Estimate
        </Button>
      </Box>
    );
  };

  // New function to handle editing material fields
  const handleMaterialEdit = (index: number, field: string, value: any) => {
    setEditableMaterialResults(prev => {
      const updatedMaterials = [...prev];
      
      // Update the specific field
      updatedMaterials[index] = {
        ...updatedMaterials[index],
        [field]: value
      };
      
      // Recalculate total if quantity or unitPrice changed
      if (field === 'quantity' || field === 'unitPrice') {
        const quantity = field === 'quantity' ? value : updatedMaterials[index].quantity;
        const unitPrice = field === 'unitPrice' ? value : updatedMaterials[index].unitPrice;
        updatedMaterials[index].total = quantity * unitPrice;
      }
      
      return updatedMaterials;
    });
  };

  // New function to toggle edit mode for a material
  const toggleEditMode = (index: number) => {
    setEditableMaterialResults(prev => {
      const updatedMaterials = [...prev];
      updatedMaterials[index] = {
        ...updatedMaterials[index],
        isEditing: !updatedMaterials[index].isEditing
      };
      return updatedMaterials;
    });
  };

  // New function to toggle selection for bulk save
  const toggleMaterialSelection = (index: number) => {
    setEditableMaterialResults(prev => {
      const updatedMaterials = [...prev];
      updatedMaterials[index] = {
        ...updatedMaterials[index],
        isSelected: !updatedMaterials[index].isSelected
      };
      return updatedMaterials;
    });
  };

  // New function to toggle all selections
  const toggleAllSelections = (selected: boolean) => {
    setEditableMaterialResults(prev => 
      prev.map(material => ({
        ...material,
        isSelected: selected
      }))
    );
  };

  // New function to save all selected materials
  const saveAllSelectedMaterials = async () => {
    const selectedMaterials = editableMaterialResults.filter(material => material.isSelected);
    
    if (selectedMaterials.length === 0) {
      setSnackbarMessage('No materials selected');
      setSnackbarOpen(true);
      return;
    }
    
    setSavingAllMaterials(true);
    
    try {
      let savedCount = 0;
      
      for (const material of selectedMaterials) {
        // Skip already saved materials
        if (material.savedMaterialId) continue;
        
        const materialToSave = {
          description: material.name,
          unitPrice: material.unitPrice || 0,
          quantity: material.quantity || 1,
          category: getCategoryFromMaterial(material),
        };
        
        const response = await fetch('/api/saved-items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(materialToSave),
        });
        
        if (response.ok) savedCount++;
      }
      
      // Refresh saved materials
      await fetchSavedMaterials();
      
      // Update the UI to reflect saved status
      const savedMaterialsData = await (await fetch('/api/saved-items')).json();
      
      setEditableMaterialResults(prev => 
        prev.map(material => {
          if (!material.isSelected || material.savedMaterialId) return material;
          
          // Try to find the newly saved material by name
          const savedMaterial = savedMaterialsData.find(
            (sm: any) => sm.description.toLowerCase() === material.name.toLowerCase()
          );
          
          return {
            ...material,
            savedMaterialId: savedMaterial?.id,
            isSelected: false,
          };
        })
      );
      
      setSnackbarMessage(`Successfully saved ${savedCount} materials to your library`);
      setSnackbarOpen(true);
      setBulkSaveMode(false);
    } catch (err) {
      setError('Failed to save materials to library');
    } finally {
      setSavingAllMaterials(false);
    }
  };

  // New function to reuse a previous project
  const reusePreviousProject = () => {
    if (!lastSavedProject) return;
    
    setQuestionnaireAnswers(prev => ({
      ...prev,
      jobType: lastSavedProject.jobType,
      description: lastSavedProject.description,
      area: lastSavedProject.area
    }));
    
    setCurrentStep(0);
    setQuestionnaireActive(true);
  };

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          AI Materials Estimator
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/estimates/materials')}
        >
          Back to Materials
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Analyzing your project and calculating materials...</Typography>
        </Box>
      )}

      {!loading && (
        <>
          {questionnaireActive && renderQuestionnaire()}
          {editableMaterialResults.length > 0 && renderMaterialResults()}
          {!questionnaireActive && editableMaterialResults.length === 0 && renderStarterButton()}
        </>
      )}

      {/* Save Material Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Material to Library</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            fullWidth
            label="Description"
            name="description"
            value={newMaterial.description}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            label="Unit Price"
            name="unitPrice"
            type="number"
            value={newMaterial.unitPrice}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              inputProps: { min: 0, step: 0.01 }
            }}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            label="Default Quantity"
            name="quantity"
            type="number"
            value={newMaterial.quantity}
            onChange={handleInputChange}
            InputProps={{
              inputProps: { min: 0.1, step: 0.1 }
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={newMaterial.category}
              name="category"
              label="Category"
              onChange={handleInputChange}
            >
              {['Wood', 'Stone', 'Plants', 'Soil', 'Concrete', 'Tools', 'Equipment', 'Labor', 'Other'].map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveMaterial} 
            color="primary" 
            disabled={savingToLibrary || !newMaterial.description || newMaterial.unitPrice <= 0}
            startIcon={savingToLibrary ? <CircularProgress size={24} /> : <SaveIcon />}
          >
            Save to Library
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/info snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
} 