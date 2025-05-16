// Job Details Route - Displays and manages individual job information and its associated details
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Layout from '../../../components/Layout';
import {
  Box, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert, CircularProgress,
  Divider
} from '@mui/material';
import { AlertColor, SelectChangeEvent } from '@mui/material';
import JobNotes from '../components/JobNotes';
import JobPhotos from '../components/JobPhotos';

const JOB_TYPES = [
  'LAWN_MAINTENANCE',
  'LANDSCAPE_DESIGN',
  'TREE_SERVICE',
  'IRRIGATION',
  'HARDSCAPING',
  'CLEANUP',
  'PLANTING',
  'FERTILIZATION',
];
const JOB_STATUSES = [
  'PENDING',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  startDate: string;
  endDate?: string;
  price: number;
  client: {
    name: string;
    address: string;
  };
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
  completed: boolean;
  completedAt?: string;
  createdBy: {
    name: string;
  };
}

export default function JobDetails() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const jobId = params.id;
  const [job, setJob] = useState<Job | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: '',
    status: '',
    startDate: '',
    endDate: '',
    price: '',
    clientId: '',
    assignedToId: '',
  });
  const [clients, setClients] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: AlertColor }>({ open: false, message: '', severity: 'success' });
  const [notes, setNotes] = useState<Note[]>([]);

  // Fetch job details
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchJobDetails();
      fetchNotes();
    }
  }, [status, jobId]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedule/${jobId}`);
      if (!res.ok) throw new Error('Failed to fetch job');
      const data = await res.json();
      setJob(data);
      setForm({
        title: data.title || '',
        description: data.description || '',
        type: data.type || '',
        status: data.status || '',
        startDate: data.startDate ? data.startDate.slice(0, 10) : '',
        endDate: data.endDate ? data.endDate.slice(0, 10) : '',
        price: data.price || '',
        clientId: data.clientId || '',
        assignedToId: data.assignedToId || '',
      });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch clients and users for dropdowns
  useEffect(() => {
    async function fetchClients() {
      const res = await fetch('/api/clients');
      if (res.ok) setClients(await res.json());
    }
    async function fetchUsers() {
      const res = await fetch('/api/auth/users'); // You may need to implement this endpoint
      if (res.ok) setUsers(await res.json());
    }
    fetchClients();
    // fetchUsers(); // Uncomment if you have a users endpoint
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/schedule/${jobId}/notes`);
      if (!res.ok) throw new Error('Failed to fetch notes');
      const data = await res.json();
      setNotes(data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name as string]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/schedule/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
        }),
      });
      if (!res.ok) throw new Error('Failed to update job');
      setSnackbar({ open: true, message: 'Job updated successfully', severity: 'success' });
      router.refresh();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleNoteAdd = async (jobId: string, content: string) => {
    try {
      const res = await fetch(`/api/schedule/${jobId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Failed to add note');
      const newNote = await res.json();
      setNotes(prev => [newNote, ...prev]);
      setSnackbar({
        open: true,
        message: 'Note added successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to add note:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add note',
        severity: 'error'
      });
    }
  };

  const handleNoteComplete = async (jobId: string, noteId: string) => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) return;

      const res = await fetch(`/api/schedule/${jobId}/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !note.completed }),
      });
      if (!res.ok) throw new Error('Failed to update note');
      const updatedNote = await res.json();
      setNotes(prev => prev.map(n => n.id === noteId ? updatedNote : n));
    } catch (error) {
      throw error;
    }
  };

  const handleNoteDelete = async (jobId: string, noteId: string) => {
    try {
      const res = await fetch(`/api/schedule/${jobId}/notes/${noteId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete note');
      setNotes(prev => prev.filter(n => n.id !== noteId));
      setSnackbar({
        open: true,
        message: 'Note deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      throw error;
    }
  };

  const handleNoteEdit = async (jobId: string, noteId: string, content: string) => {
    try {
      const res = await fetch(`/api/schedule/${jobId}/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Failed to update note');
      const updatedNote = await res.json();
      setNotes(prev => prev.map(n => n.id === noteId ? updatedNote : n));
      setSnackbar({
        open: true,
        message: 'Note updated successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update note',
        severity: 'error'
      });
    }
  };

  if (loading) return <Layout><Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box></Layout>;
  if (!job) return <Layout><Box sx={{ p: 4 }}><Typography>Job not found.</Typography></Box></Layout>;

  return (
    <Layout>
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Typography variant="h4" gutterBottom>Job Details</Typography>
        <TextField
          label="Title"
          name="title"
          value={form.title}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Type</InputLabel>
          <Select name="type" value={form.type} onChange={handleSelectChange} label="Type">
            {JOB_TYPES.map(type => <MenuItem key={type} value={type}>{type.replace(/_/g, ' ')}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select name="status" value={form.status} onChange={handleSelectChange} label="Status">
            {JOB_STATUSES.map(status => <MenuItem key={status} value={status}>{status.replace(/_/g, ' ')}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField
          label="Start Date"
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Price"
          name="price"
          type="number"
          value={form.price}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Client</InputLabel>
          <Select name="clientId" value={form.clientId} onChange={handleSelectChange} label="Client">
            {clients.map(client => <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>)}
          </Select>
        </FormControl>
        {/* Uncomment if you have a users endpoint
        <FormControl fullWidth margin="normal">
          <InputLabel>Assigned To</InputLabel>
          <Select name="assignedToId" value={form.assignedToId} onChange={handleSelectChange} label="Assigned To">
            {users.map(user => <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>)}
          </Select>
        </FormControl>
        */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        <JobNotes
          jobId={job.id}
          notes={notes}
          onNoteAdd={handleNoteAdd}
          onNoteComplete={handleNoteComplete}
          onNoteDelete={handleNoteDelete}
          onNoteEdit={handleNoteEdit}
        />
        
        <Divider sx={{ my: 4 }} />
        
        <JobPhotos jobId={job.id} />
        
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
} 