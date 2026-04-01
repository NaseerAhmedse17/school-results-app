"use client";

import { Box, Container, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

export function ResultsPageFooter() {
  const theme = useTheme();
  return (
    <Box
      component="footer"
      sx={{
        py: 2.5,
        px: 2,
        mt: "auto",
        borderTop: 1,
        borderColor: "divider",
        bgcolor: alpha(theme.palette.primary.main, 0.04),
      }}
    >
      <Container
        maxWidth={false}
        sx={{ maxWidth: { xs: "100%", sm: "min(100%, 1680px)" }, mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}
      >
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
          School test results · Built for teachers and management reporting
        </Typography>
      </Container>
    </Box>
  );
}
