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
  Link as MuiLink,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import { Email, Lock, Person, ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

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
  const { status } = useSession();
  const [orgMode, setOrgMode] = useState("create"); // "create" or "join"
  const [companyName, setCompanyName] = useState("");
  const [companyId, setCompanyId] = useState("");

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

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
    let body: any = { name, email, password };
    if (orgMode === "create") {
      if (!companyName) {
        setError("Organization name is required.");
        setLoading(false);
        return;
      }
      body.companyName = companyName;
    } else {
      if (!companyId) {
        setError("Organization code is required.");
        setLoading(false);
        return;
      }
      body.companyId = companyId;
    }
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

  // Don't render the form if we're redirecting
  if (status === "authenticated") {
    return <Box sx={{ p: 6, textAlign: 'center' }}>Redirecting to dashboard...</Box>;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: (theme) => theme.palette.background.default,
        position: "relative",
      }}
    >
      <Box sx={{ position: "absolute", top: 20, left: 20 }}>
        <Button
          startIcon={<ArrowBack />}
          component={Link}
          href="/home"
          color="primary"
        >
          Back to Home
        </Button>
      </Box>
      
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
          GreenLead
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
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend">Organization</FormLabel>
            <RadioGroup
              row
              value={orgMode}
              onChange={(e) => setOrgMode(e.target.value)}
              name="orgMode"
            >
              <FormControlLabel value="create" control={<Radio />} label="Create New" />
              <FormControlLabel value="join" control={<Radio />} label="Join Existing" />
            </RadioGroup>
          </FormControl>
          {orgMode === "create" && (
            <TextField
              label="Organization Name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
          )}
          {orgMode === "join" && (
            <TextField
              label="Organization Code"
              type="text"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
          )}
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
            <MuiLink component={Link} href="/login" color="primary" underline="hover">
              Sign in
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
} 