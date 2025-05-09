// Registration Page - Handles new user account creation
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  InputAdornment,
} from "@mui/material";
import { Email, Lock, Person } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const AUTOSAVE_KEY = "registerFormDraft";
const AUTOSAVE_DEBOUNCE = 500; // ms

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Restore draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(AUTOSAVE_KEY);
    if (draft) {
      try {
        const { name, email, password } = JSON.parse(draft);
        if (name) setName(name);
        if (email) setEmail(email);
        if (password) setPassword(password);
      } catch {}
    }
  }, []);

  // Autosave to localStorage (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      localStorage.setItem(
        AUTOSAVE_KEY,
        JSON.stringify({ name, email, password })
      );
    }, AUTOSAVE_DEBOUNCE);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [name, email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess("Account created! Redirecting to login...");
      localStorage.removeItem(AUTOSAVE_KEY); // Clear draft on success
      setTimeout(() => router.push("/login"), 1500);
    } else {
      const data = await res.json();
      setError(data.error || "Registration failed");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: (theme) => theme.palette.background.default,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 5,
          borderRadius: 4,
          minWidth: 350,
          maxWidth: 400,
          boxShadow: (theme) => `0px 8px 32px ${theme.palette.primary.main}22`,
        }}
      >
        <Typography variant="h4" fontWeight={700} mb={2} color="primary">
          YardBase CRM
        </Typography>
        <Typography variant="h6" mb={3} color="text.secondary">
          Create your account
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            margin="normal"
            autoComplete="username"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
            autoComplete="new-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
            }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, fontWeight: 600, py: 1.5 }}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <a href="/login" style={{ color: '#389757', textDecoration: 'underline' }}>
              Sign in
            </a>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
} 