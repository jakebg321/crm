'use client';

import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

interface SavedItemsDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (item: any) => void;
}

interface SavedItem {
  id: string;
  description: string;
  unitPrice: number;
  quantity?: number;
  category?: string;
  isTemplate?: boolean;
}

export default function SavedItemsDrawer({ open, onClose, onAddItem }: SavedItemsDrawerProps) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<SavedItem | null>(null);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  // Fetch saved items when drawer opens
  useEffect(() => {
    if (open) {
      fetchSavedItems();
      fetchTemplates();
    }
  }, [open]);

  const fetchSavedItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/saved-items');
      if (!response.ok) {
        throw new Error('Failed to fetch saved items');
      }
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError('Failed to load saved items');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/estimate-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error('Failed to load templates');
    }
  };

  const handleAddClick = () => {
    setCurrentItem({
      id: '',
      description: '',
      unitPrice: 0,
      quantity: 1,
      isTemplate: false,
    });
    setOpenAddDialog(true);
  };

  const handleEditItem = (item: SavedItem) => {
    setCurrentItem(item);
    setOpenEditDialog(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`/api/saved-items/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setItems(items.filter((item) => item.id !== id));
        }
      } catch (err) {
        setError('Failed to delete item');
      }
    }
  };

  const handleSaveItem = async (isNew: boolean) => {
    if (!currentItem || !currentItem.description || currentItem.unitPrice <= 0) {
      return;
    }

    try {
      const url = isNew 
        ? '/api/saved-items' 
        : `/api/saved-items/${currentItem.id}`;
      
      const method = isNew ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentItem),
      });

      if (response.ok) {
        fetchSavedItems(); // Refresh the list
        handleCloseDialogs();
      }
    } catch (err) {
      setError('Failed to save item');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'unitPrice' || name === 'quantity') {
      setCurrentItem({
        ...currentItem!,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setCurrentItem({
        ...currentItem!,
        [name]: value,
      });
    }
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenTemplateDialog(false);
    setCurrentItem(null);
  };

  const handleOpenTemplateDialog = () => {
    setOpenTemplateDialog(true);
  };

  const handleCreateTemplate = async () => {
    // Implementation for creating templates
    const templateName = prompt('Enter a name for this template:');
    if (!templateName) return;
    
    // Let the user select items to include in the template
    if (items.length === 0) {
      alert('You need to have saved items before creating a template.');
      return;
    }
    
    // Simple multi-select interface
    const selectedItems = [];
    const itemsToSelect = [...items];
    
    // Keep prompting until the user has selected all desired items
    let selecting = true;
    while (selecting && itemsToSelect.length > 0) {
      const itemOptions = itemsToSelect.map((item, index) => 
        `${index + 1}. ${item.description} - $${item.unitPrice.toFixed(2)}`
      ).join('\n');
      
      const selection = prompt(
        `Select an item to add to the template (enter the number, or cancel to finish):\n\n${itemOptions}`
      );
      
      if (!selection) {
        selecting = false;
      } else {
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < itemsToSelect.length) {
          const selectedItem = itemsToSelect[index];
          selectedItems.push(selectedItem);
          itemsToSelect.splice(index, 1);
          
          alert(`Added: ${selectedItem.description}`);
        }
      }
    }
    
    if (selectedItems.length === 0) {
      alert('No items selected for template.');
      return;
    }
    
    try {
      const response = await fetch('/api/estimate-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateName,
          description: `Template with ${selectedItems.length} items`,
          items: selectedItems.map(item => ({ savedItemId: item.id, quantity: item.quantity || 1 })),
        }),
      });
      
      if (response.ok) {
        alert(`Template "${templateName}" created successfully!`);
        fetchTemplates();
      } else {
        throw new Error('Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template. Please try again.');
    }
  };

  const handleUseTemplate = (template) => {
    // Add all template items to the estimate
    template.items.forEach(item => {
      onAddItem(item);
    });
    onClose();
  };

  // Get unique categories from items
  const categories = ['All', ...new Set(items.map(item => item.category || 'Other'))].sort();

  // Filter items by search query and category
  const filteredItems = items.filter(
    (item) => {
      const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }
  );

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 } },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Saved Items</Typography>
            <IconButton onClick={onClose} edge="end">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search saved items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
                size="small"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddClick}
                sx={{ mr: 1 }}
              >
                New Item
              </Button>
              <Button 
                variant="outlined"
                size="small"
                onClick={handleOpenTemplateDialog}
              >
                Templates
              </Button>
            </Box>
          </Box>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredItems.length === 0 ? (
            <Typography align="center" sx={{ my: 4 }}>
              No saved items found. Create your first item!
            </Typography>
          ) : (
            <List>
              {filteredItems.map((item) => (
                <ListItem 
                  key={item.id}
                  secondaryAction={
                    <Box>
                      <IconButton 
                        edge="end" 
                        size="small" 
                        onClick={() => handleEditItem(item)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }, 
                  }}
                >
                  <ListItemText
                    primary={item.description}
                    secondary={
                      <Box component="div">
                        <Typography variant="body2" component="span">
                          ${item.unitPrice.toFixed(2)}
                        </Typography>
                        {item.category && (
                          <Chip 
                            label={item.category} 
                            size="small" 
                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    onClick={() => onAddItem(item)}
                    sx={{ cursor: 'pointer' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>

      {/* Add Item Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="Description"
            name="description"
            value={currentItem?.description || ''}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            label="Unit Price"
            name="unitPrice"
            type="number"
            value={currentItem?.unitPrice || 0}
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
            value={currentItem?.quantity || 1}
            onChange={handleInputChange}
            inputProps={{ min: 1, step: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={() => handleSaveItem(true)}
            variant="contained"
            color="primary"
            disabled={!currentItem?.description || currentItem?.unitPrice <= 0}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="Description"
            name="description"
            value={currentItem?.description || ''}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            label="Unit Price"
            name="unitPrice"
            type="number"
            value={currentItem?.unitPrice || 0}
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
            value={currentItem?.quantity || 1}
            onChange={handleInputChange}
            inputProps={{ min: 1, step: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={() => handleSaveItem(false)}
            variant="contained"
            color="primary"
            disabled={!currentItem?.description || currentItem?.unitPrice <= 0}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog 
        open={openTemplateDialog} 
        onClose={handleCloseDialogs}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Estimate Templates</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Templates allow you to save a group of items that you frequently use together.
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={handleCreateTemplate}
              sx={{ mt: 1 }}
            >
              Create New Template
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {templates.length === 0 ? (
            <Typography align="center" sx={{ my: 4 }}>
              No templates found. Create your first template!
            </Typography>
          ) : (
            <List>
              {templates.map((template) => (
                <ListItem 
                  key={template.id}
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={template.name}
                    secondary={
                      <>
                        <Typography variant="body2">
                          {template.items.length} items | Total: ${template.totalPrice.toFixed(2)}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {template.items.slice(0, 3).map((item) => (
                            <Chip 
                              key={item.id} 
                              label={item.description} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          ))}
                          {template.items.length > 3 && (
                            <Chip 
                              label={`+${template.items.length - 3} more`} 
                              size="small" 
                              variant="outlined" 
                            />
                          )}
                        </Box>
                      </>
                    }
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleUseTemplate(template)}
                    sx={{ ml: 2 }}
                  >
                    Use
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 