'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Tab,
  Tabs,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { formatCurrency } from '@/utils/formatters';

// Predefined categories for materials
const CATEGORIES = [
  'Wood',
  'Drywall',
  'Paint',
  'Hardware',
  'Tools',
  'Plants',
  'Soil',
  'Stone',
  'Concrete',
  'Labor',
  'Equipment',
  'Other',
];

export default function MaterialsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState({
    id: '',
    description: '',
    unitPrice: 0,
    quantity: 1,
    category: 'Other',
  });
  const [bulkAddMode, setBulkAddMode] = useState(false);
  const [bulkItems, setBulkItems] = useState('');

  // Fetch materials from API
  useEffect(() => {
    if (status === 'authenticated') {
      fetchMaterials();
    }
  }, [status]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/saved-items');
      if (!response.ok) {
        throw new Error('Failed to fetch materials');
      }
      const data = await response.json();
      
      // Add category if not present (for backward compatibility)
      const enhancedData = data.map(item => ({
        ...item,
        category: item.category || 'Other'
      }));
      
      setMaterials(enhancedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'unitPrice' || name === 'quantity') {
      setCurrentMaterial({
        ...currentMaterial,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setCurrentMaterial({
        ...currentMaterial,
        [name]: value,
      });
    }
  };

  const handleAddClick = () => {
    setCurrentMaterial({
      id: '',
      description: '',
      unitPrice: 0,
      quantity: 1,
      category: 'Other',
    });
    setOpenAddDialog(true);
    setBulkAddMode(false);
  };

  const handleBulkAddClick = () => {
    setCurrentMaterial({
      id: '',
      description: '',
      unitPrice: 0,
      quantity: 1,
      category: 'Other',
    });
    setBulkItems('');
    setBulkAddMode(true);
    setOpenAddDialog(true);
  };

  const handleEditItem = (material) => {
    setCurrentMaterial({
      id: material.id,
      description: material.description,
      unitPrice: material.unitPrice,
      quantity: material.quantity || 1,
      category: material.category || 'Other',
    });
    setOpenEditDialog(true);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        const response = await fetch(`/api/saved-items/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchMaterials();
        } else {
          throw new Error('Failed to delete material');
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
  };

  const handleSaveMaterial = async () => {
    try {
      const response = await fetch('/api/saved-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: currentMaterial.description,
          unitPrice: currentMaterial.unitPrice,
          quantity: currentMaterial.quantity,
          category: currentMaterial.category,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create material');
      }

      fetchMaterials();
      handleCloseDialogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateMaterial = async () => {
    try {
      const response = await fetch(`/api/saved-items/${currentMaterial.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: currentMaterial.description,
          unitPrice: currentMaterial.unitPrice,
          quantity: currentMaterial.quantity,
          category: currentMaterial.category,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update material');
      }

      fetchMaterials();
      handleCloseDialogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBulkSave = async () => {
    if (!bulkItems.trim()) {
      return;
    }

    const lines = bulkItems.split('\n').filter(line => line.trim());
    
    try {
      // Process each line (e.g., "Description, 10.99, Category")
      for (const line of lines) {
        const parts = line.split(',').map(part => part.trim());
        
        // Need at least description and price
        if (parts.length >= 2) {
          const description = parts[0];
          const unitPrice = parseFloat(parts[1]) || 0;
          const category = parts[2] || currentMaterial.category;
          
          if (description && unitPrice > 0) {
            await fetch('/api/saved-items', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                description,
                unitPrice,
                quantity: 1,
                category,
              }),
            });
          }
        }
      }
      
      fetchMaterials();
      handleCloseDialogs();
    } catch (err) {
      setError(err.message);
    }
  };

  // Get unique categories
  const uniqueCategories = ['all', ...new Set(materials.map(item => item.category || 'Other'))].sort();

  // Filter materials by search query and tab
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = currentTab === 'all' || material.category === currentTab;
    return matchesSearch && matchesCategory;
  });

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (loading && status !== 'loading') {
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
          Materials & Items
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<AutoFixHighIcon />}
            onClick={() => router.push('/estimates/materials/ai')}
            sx={{ mr: 1 }}
          >
            AI Materials Estimator
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleBulkAddClick}
            sx={{ mr: 1 }}
          >
            Bulk Add
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            New Material
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: '40%' }}
          />
          <Button
            variant="outlined"
            onClick={() => router.push('/estimates')}
          >
            Back to Estimates
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          {uniqueCategories.map((category) => (
            <Tab
              key={category}
              label={category === 'all' ? 'All Categories' : category}
              value={category}
            />
          ))}
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Default Qty</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMaterials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>{material.description}</TableCell>
                  <TableCell>
                    <Chip 
                      label={material.category || 'Other'} 
                      size="small" 
                      icon={<CategoryIcon fontSize="small" />}
                    />
                  </TableCell>
                  <TableCell align="right">{formatCurrency(material.unitPrice)}</TableCell>
                  <TableCell align="right">{material.quantity || 1}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <span>
                        <IconButton size="small" onClick={() => handleEditItem(material)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <span>
                        <IconButton size="small" onClick={() => handleDeleteItem(material.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMaterials.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No materials found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Material Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>
          {bulkAddMode ? 'Bulk Add Materials' : 'Add New Material'}
        </DialogTitle>
        <DialogContent>
          {bulkAddMode ? (
            <>
              <Typography variant="body2" gutterBottom sx={{ mt: 1 }}>
                Enter one material per line in the format: Description, Price, Category (optional)
              </Typography>
              <TextField
                autoFocus
                fullWidth
                multiline
                rows={8}
                placeholder="Wood planks, 24.99, Wood
Drywall sheets, 15.50, Drywall
Screws, 5.99, Hardware"
                value={bulkItems}
                onChange={(e) => setBulkItems(e.target.value)}
                sx={{ mt: 1 }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Default Category</InputLabel>
                <Select
                  value={currentMaterial.category}
                  name="category"
                  label="Default Category"
                  onChange={handleInputChange}
                >
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          ) : (
            <>
              <TextField
                autoFocus
                margin="normal"
                fullWidth
                label="Description"
                name="description"
                value={currentMaterial.description}
                onChange={handleInputChange}
                required
              />
              <TextField
                margin="normal"
                fullWidth
                label="Unit Price"
                name="unitPrice"
                type="number"
                value={currentMaterial.unitPrice}
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
                value={currentMaterial.quantity}
                onChange={handleInputChange}
                inputProps={{ min: 1, step: 1 }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={currentMaterial.category}
                  name="category"
                  label="Category"
                  onChange={handleInputChange}
                >
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          {bulkAddMode ? (
            <Button
              onClick={handleBulkSave}
              variant="contained"
              color="primary"
            >
              Save All
            </Button>
          ) : (
            <Button
              onClick={handleSaveMaterial}
              variant="contained"
              color="primary"
              disabled={!currentMaterial.description || currentMaterial.unitPrice <= 0}
            >
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Material Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Material</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            fullWidth
            label="Description"
            name="description"
            value={currentMaterial.description}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            label="Unit Price"
            name="unitPrice"
            type="number"
            value={currentMaterial.unitPrice}
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
            value={currentMaterial.quantity}
            onChange={handleInputChange}
            inputProps={{ min: 1, step: 1 }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={currentMaterial.category}
              name="category"
              label="Category"
              onChange={handleInputChange}
            >
              {CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button
            onClick={handleUpdateMaterial}
            variant="contained"
            color="primary"
            disabled={!currentMaterial.description || currentMaterial.unitPrice <= 0}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 