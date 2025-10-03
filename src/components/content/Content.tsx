import { Box } from "@mui/material";
import React from "react";
import { Route, Routes } from "react-router-dom";
import MyCourses from "../myCourses/MyCourses";
import MyTeaching from "../myTeaching/MyTeaching";
import SignUp from "../signUp/SignUp";
import Login from "../login/Login";
import Home from "../home/Home";
import CourseWrapper from "../courseWrapper/CourseWrapper";

const Content = () => {
  return (
    <Box sx={{ width: "100%", minHeight: "640px", backgroundColor: "#e0e0e0" }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/my-teaching" element={<MyTeaching />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/course/:categoryId" element={<CourseWrapper />} />
        <Route
          path="*"
          element={<h2 style={{ color: "white" }}>404 Not Found</h2>}
        />
      </Routes>
    </Box>
  );
};

export default Content;
