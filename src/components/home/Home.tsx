import { Box, Button, Typography, Stack, Card, CardContent } from "@mui/material";
import { Link } from "react-router-dom";

import { categories } from "../../types/categories";
import { LaptopMac, Brush, MusicNote, Campaign } from "@mui/icons-material";
import { useEffect } from "react";
import getMyUserId from "../../utils/userIdProvider.tsx";

const categoryIcons = [
  <LaptopMac fontSize="large" />,
  <Brush fontSize="large" />,
  <MusicNote fontSize="large" />,
  <Campaign fontSize="large" />,
];

const Home = () => {
  const isLoggedIn = !!localStorage.getItem("currentUser");

  useEffect(() => {
    console.log(isLoggedIn);
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", pt: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          maxWidth: "1000px",
          mx: "auto",
          px: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h3" fontWeight={700} mb={2}>
          Bilgiye Açılan Kapınız
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={4}>
          Kurslara katılarak öğrenmeye hemen başlayabilir, kendi kurslarınızı
          oluşturarak topluluğa katkıda bulunabilirsiniz.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" mb={6}>
          <Button variant="outlined" size="large" component={Link} to="/signUp">
            Hemen Başla
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => {
              if (!isLoggedIn) {
                window.location.href = "/login";
              }
            }}
          >
            Zaten Üyeyim
          </Button>
        </Stack>
      </Box>

      {/* Category Section */}
      {getMyUserId() && (
        <Box
          sx={{
            maxWidth: "1100px",
            mx: "auto",
            px: 4,
            py: 4,
          }}
        >
          <Typography variant="h5" textAlign="center" fontWeight={600} mb={4}>
            Popüler Kategoriler
          </Typography>

          <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={3}>
            {categories.slice(0, 4).map(({ name, id }, index) => (
              <Card
                key={id}
                component={Link}
                to={`/course/${id}`}
                sx={{
                  width: 220,
                  minHeight: 180,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: "all 0.3s",
                  textDecoration: "none", // Link çizgisini kaldır
                  color: "inherit", // yazı rengini bozmamak için
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  {categoryIcons[index]}
                  <Typography mt={2} fontWeight={600}>
                    {name}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Home;
