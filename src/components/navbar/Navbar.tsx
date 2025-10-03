import {
  AppBar,
  Box,
  ButtonBase,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { categories } from "../../types/categories";
import { Home } from "@mui/icons-material";

const Navbar = () => {
  const [course, setCourse] = React.useState("course1");

  const handleChange = (event: SelectChangeEvent) => {
    setCourse(event.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.location.reload(); // sayfayı yenile, çıkış yapılmış olsun
  };

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  const leftNavItems = [
    { label: "My Courses", to: "/my-courses" },
    { label: "My Teaching", to: "/my-teaching" },
  ];

  const rightNavItems = [
    { label: "SignUp", to: "/signUp" },
    { label: "Login", to: "/login" },
    { label: "Logout" },
  ];

  const buttonStyles = {
    borderRadius: 1,
    px: 1,
    textAlign: "left",
    p: 1,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  };

  return (
    <Box sx={{ width: "100%", height: "63px", backgroundColor: "#1976d2" }}>
      <AppBar position="static">
        <Toolbar>
          {/* Sol kısım */}

          <Box sx={{ display: "flex", alignItems: "center" }} gap={1}>
            <ButtonBase component={Link} to="/" sx={{ ...buttonStyles, px: 1 }}>
              <Home sx={{ color: "white", fontSize: 28 }} />
            </ButtonBase>

            <FormControl variant="outlined" sx={{ minWidth: 120 }}>
              <Select
                value={course}
                onChange={handleChange}
                displayEmpty
                renderValue={() => "Courses"}
                sx={{
                  border: "none",
                  color: "inherit",
                  fontSize: "19px",
                  boxShadow: "none",
                  ".MuiOutlinedInput-notchedOutline": { border: 0 },
                  "& .MuiSelect-icon": {
                    color: "inherit",
                  },
                }}
              >
                {categories.map((category) => (
                  <MenuItem
                    key={category.id}
                    component={Link}
                    to={`/course/${category.id}`}
                  >
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {currentUser !== null &&
              leftNavItems.map(({ label, to }) => (
                <ButtonBase
                  key={label}
                  component={Link}
                  to={to}
                  sx={buttonStyles}
                >
                  <Typography
                    fontSize="19px"
                    variant="h6"
                    component="div"
                    sx={{ color: "inherit", textDecoration: "none" }}
                  >
                    {label}
                  </Typography>
                </ButtonBase>
              ))}
          </Box>

          {/* Sağ kısım */}
          <Box
            sx={{ display: "flex", alignItems: "center", ml: "auto" }}
            gap={1}
          >
            {rightNavItems
              .filter(({ label }) => {
                if (label.toLowerCase() === "login" && currentUser)
                  return false;
                if (label.toLowerCase() === "logout" && !currentUser)
                  return false;
                return true;
              })
              .map(({ label, to }) => {
                const isLogout = label.toLowerCase() === "logout";

                return isLogout ? (
                  <ButtonBase
                    key={label}
                    onClick={handleLogout}
                    sx={buttonStyles}
                  >
                    <Typography
                      fontSize="19px"
                      variant="h6"
                      component="div"
                      sx={{
                        cursor: "pointer",
                        color: "inherit",
                        textDecoration: "none",
                      }}
                    >
                      {label}
                    </Typography>
                  </ButtonBase>
                ) : (
                  <ButtonBase
                    key={label}
                    component={Link}
                    to={to!}
                    sx={buttonStyles}
                  >
                    <Typography
                      fontSize="19px"
                      variant="h6"
                      component="div"
                      sx={{
                        cursor: "pointer",
                        color: "inherit",
                        textDecoration: "none",
                      }}
                    >
                      {label}
                    </Typography>
                  </ButtonBase>
                );
              })}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
