import React, { useState } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import bcrypt from "bcryptjs";
import axios from "axios";
import { User } from "../../types/users";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000/users";

const Login = () => {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleLogin = async () => {
    if (!form.identifier.trim() || !form.password.trim()) {
      setError("Tüm alanlar zorunludur.");
      return;
    }

    try {
      const res = await axios.get<User[]>(API_BASE_URL);
      const user = res.data.find(
        (u) =>
          u.email.toLowerCase() === form.identifier.toLowerCase() ||
          u.username.toLowerCase() === form.identifier.toLowerCase()
      );

      if (!user) {
        setError(
          "Bu kullanıcı adı veya email ile eşleşen bir kullanıcı bulunamadı."
        );
        return;
      }

      const isPasswordValid = await bcrypt.compare(
        form.password,
        user.passwordHash
      );
      if (!isPasswordValid) {
        setError("Şifre hatalı.");
        return;
      }

      // Giriş başarılı → kullanıcıyı localStorage'a kaydet
      localStorage.setItem("currentUser", JSON.stringify(user));
      setSuccess(true);
      navigate("/");
      window.location.reload();
    } catch (err) {
      setError("Giriş sırasında bir hata oluştu.");
      console.error(err);
    }
  };

  return (
    <Box sx={{ pt: 5 }}>
      <Box
        sx={{
          maxWidth: 400,
          mx: "auto",
          pt: 4,
          p: 3,
          bgcolor: "white",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" mb={3} textAlign="center">
          Login
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Giriş başarılı! 🎉
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            label="Email or Username"
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
          />
          <Button variant="contained" fullWidth onClick={handleLogin}>
            Login
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default Login;
