
import {
  Box,
  Typography,
} from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        minHeight: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 2,
        py: 1.5,
        boxSizing: "border-box",
        backgroundColor: "#101d34",
        color: "#c4d0e2",
        borderTop:
          "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: "inherit",
          lineHeight: 1.6,
        }}
      >
        © 2026 WorkTrack. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;