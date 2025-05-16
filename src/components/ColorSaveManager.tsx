'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';

// Define the structure of a color scheme
interface ColorScheme {
  id: string;
  name: string;
  timestamp: number;
  colors: Record<string, Record<string, string>>;
}

interface ColorSaveManagerProps {
  currentColors: Record<string, Record<string, string>>;
  onLoad: (colors: Record<string, Record<string, string>>) => void;
}

export default function ColorSaveManager({ currentColors, onLoad }: ColorSaveManagerProps) {
  const [savedSchemes, setSavedSchemes] = useState<ColorScheme[]>([]);
  const [newSchemeName, setNewSchemeName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [exportText, setExportText] = useState('');
  const [importText, setImportText] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [error, setError] = useState('');

  // Load saved schemes from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('colorSchemes');
    if (savedData) {
      try {
        setSavedSchemes(JSON.parse(savedData));
      } catch (e) {
        console.error('Faileed to parse saved color schemes:', e);
      }
    }
  }, []);

  // Save schemes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('colorSchemes', JSON.stringify(savedSchemes));
  }, [savedSchemes]);

  const handleSaveScheme = () => {
    if (!newSchemeName.trim()) {
      setError('Please enter a name for your color scheme');
      return;
    }

    const newScheme: ColorScheme = {
      id: Date.now().toString(),
      name: newSchemeName,
      timestamp: Date.now(),
      colors: { ...currentColors },
    };

    setSavedSchemes([...savedSchemes, newScheme]);
    setNewSchemeName('');
    setSaveDialogOpen(false);
    setError('');
  };

  const handleDeleteScheme = (id: string) => {
    setSavedSchemes(savedSchemes.filter(scheme => scheme.id !== id));
  };

  const handleLoadScheme = (scheme: ColorScheme) => {
    onLoad(scheme.colors);
  };

  const handleExport = () => {
    setExportText(JSON.stringify(savedSchemes, null, 2));
    setExportDialogOpen(true);
  };

  const handleImport = () => {
    try {
      const importedData = JSON.parse(importText);
      if (Array.isArray(importedData)) {
        setSavedSchemes([...savedSchemes, ...importedData]);
        setImportDialogOpen(false);
        setImportText('');
        setError('');
      } else {
        setError('Invalid format: Expected an array of color schemes');
      }
    } catch (e) {
      setError('Invalid JSON format');
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Saved Color Schemes</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />}
          onClick={() => setSaveDialogOpen(true)}
        >
          Save Current
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<FileDownloadIcon />}
          onClick={handleExport}
          disabled={savedSchemes.length === 0}
        >
          Export
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<FileUploadIcon />}
          onClick={() => setImportDialogOpen(true)}
        >
          Import
        </Button>
      </Box>
      
      {savedSchemes.length === 0 ? (
        <Typography color="text.secondary">No saved color schemes yet.</Typography>
      ) : (
        <List>
          {savedSchemes.map((scheme) => (
            <React.Fragment key={scheme.id}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteScheme(scheme.id)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={scheme.name}
                  secondary={new Date(scheme.timestamp).toLocaleString()}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleLoadScheme(scheme)}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}
      
      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Color Scheme</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Scheme Name"
            fullWidth
            value={newSchemeName}
            onChange={(e) => setNewSchemeName(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSaveDialogOpen(false);
            setError('');
          }}>Cancel</Button>
          <Button onClick={handleSaveScheme}>Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Export Color Schemes</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Copy this JSON to save your color schemes for later or to share with others:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={12}
            value={exportText}
            InputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Close</Button>
          <Button onClick={() => {
            navigator.clipboard.writeText(exportText);
          }}>Copy to Clipboard</Button>
        </DialogActions>
      </Dialog>
      
      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Import Color Schemes</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Paste previously exported color scheme JSON:
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          <TextField
            fullWidth
            multiline
            rows={12}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            error={!!error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setImportDialogOpen(false);
            setError('');
            setImportText('');
          }}>Cancel</Button>
          <Button onClick={handleImport}>Import</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 