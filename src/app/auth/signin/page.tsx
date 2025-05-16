// Sign In Page - Alternative authentication page for handling user login
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  InputAdornment,
} from "@mui/material";
import { Email, Lock } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: searchParams.get("callbackUrl") || "/",
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push(res?.url || "/");
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
          GreenLead
        </Typography>
        <Typography variant="h6" mb={3} color="text.secondary">
          Sign in to your account
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            margin="normal"
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, fontWeight: 600, py: 1.5 }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            <b>Demo credentials:</b>
            <br />
            Email: <code>test1@gmail.com</code>
            <br />
            Password: <code>test123</code>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
} 