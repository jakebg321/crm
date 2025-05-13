'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Box, Button, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';
import { UserRole } from '@prisma/client';

export default function RoleSwitcher() {
  const { data: session } = useSession();
  const [selectedRole, setSelectedRole] = useState<UserRole>(session?.user?.role as UserRole || 'STAFF');
  const [error, setError] = useState<string | null>(null);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleRoleChange = async (newRole: UserRole) => {
    try {
      setError(null);
      const response = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to switch role');
      }

      setSelectedRole(newRole);
      // Refresh the page to update the session
      window.location.reload();
    } catch (err) {
      setError('Failed to switch role. Please try again.');
      console.error('Role switch error:', err);
    }
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 20, 
      right: 20, 
      zIndex: 1000,
      backgroundColor: 'background.paper',
      padding: 2,
      borderRadius: 2,
      boxShadow: 3,
      minWidth: 200
    }}>
      <FormControl fullWidth size="small">
        <InputLabel>Debug: Switch Role</InputLabel>
        <Select
          value={selectedRole}
          label="Debug: Switch Role"
          onChange={(e) => handleRoleChange(e.target.value as UserRole)}
        >
          <MenuItem value="ADMIN">Admin</MenuItem>
          <MenuItem value="MANAGER">Manager</MenuItem>
          <MenuItem value="STAFF">Staff</MenuItem>
        </Select>
      </FormControl>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
} 