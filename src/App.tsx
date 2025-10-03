import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Box } from "@mui/material";
import Navbar from "./components/navbar/Navbar";
import Content from "./components/content/Content";
import Footerbar from "./components/footerbar/Footerbar";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Box>
        <Navbar />
        <Content />
        <Footerbar />
      </Box>
    </>
  );
}

export default App;
