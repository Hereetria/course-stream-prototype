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

// Kullanıcı tipi
export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

// json-server endpoint
const API_BASE_URL = "http://localhost:3000/users"; // burayı kendi server adresine göre ayarla

// Generic create method
const createAsync = async <T extends object>(data: T) => {
  try {
    const response = await axios.post(`${API_BASE_URL}`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create entity");
  }
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const SignUp = () => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    username?: string;
    email?: string;
    password?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};

    if (!form.name.trim()) newErrors.name = "Bu alan boş bırakılamaz.";
    if (!form.username.trim()) newErrors.username = "Bu alan boş bırakılamaz.";
    if (!form.email.trim()) {
      newErrors.email = "Bu alan boş bırakılamaz.";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Geçerli bir email adresi giriniz.";
    }

    if (!form.password.trim()) {
      newErrors.password = "Bu alan boş bırakılamaz.";
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password =
        "Şifre en az 8 karakter, 1 büyük harf, 1 küçük harf, 1 sayı ve 1 özel karakter içermelidir.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccess(false);
      return;
    }

    try {
      const passwordHash = await bcrypt.hash(form.password, 10);

      const newUser: User = {
        id: Date.now().toString(), // json-server otomatik id atıyorsa bunu kaldırabilirsin
        name: form.name,
        username: form.username,
        email: form.email,
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      await createAsync<User>(newUser); // json-server'a gönder
      setSuccess(true);

      setForm({ name: "", username: "", email: "", password: "" });
      setErrors({});
    } catch (err) {
      console.error("Kayıt başarısız:", err);
      setSuccess(false);
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
          Sign Up
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Kullanıcı başarıyla oluşturuldu.
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            error={!!errors.username}
            helperText={errors.username}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            error={!!errors.password}
            helperText={errors.password}
          />
          <Button variant="contained" fullWidth onClick={handleSubmit}>
            Register
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default SignUp;
