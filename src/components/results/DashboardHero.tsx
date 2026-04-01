"use client";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

type Props = {
  isStackedLayout: boolean;
};

export function DashboardHero({ isStackedLayout }: Props) {
  return (
    <Box
      sx={{
        background: (t) =>
          `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 45%, ${t.palette.primary.light} 100%)`,
        color: "primary.contrastText",
        pt: { xs: 1.25, md: 1.5 },
        pb: { xs: 1, md: 1 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,
          backgroundImage: `radial-gradient(circle at 20% 20%, ${alpha("#fff", 0.9)} 0%, transparent 45%),
              radial-gradient(circle at 80% 80%, ${alpha("#fff", 0.5)} 0%, transparent 40%)`,
        }}
      />
      <Container
        maxWidth={false}
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: { xs: "100%", sm: "min(100%, 1680px)" },
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
          <Box
            sx={{
              width: { xs: 44, sm: 48 },
              height: { xs: 44, sm: 48 },
              borderRadius: 2,
              bgcolor: alpha("#fff", 0.15),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
              flexShrink: 0,
            }}
          >
            <SchoolOutlinedIcon sx={{ fontSize: { xs: 26, sm: 28 } }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" component="h1" sx={{ fontSize: { xs: "1.35rem", sm: "1.5rem", md: "1.65rem" }, fontWeight: 700 }}>
              Test results dashboard
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                maxWidth: 720,
                opacity: 0.9,
                lineHeight: 1.45,
                display: { xs: "-webkit-box", sm: "block" },
                WebkitLineClamp: { xs: 2, sm: "unset" },
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              Record outcomes, apply pass/fee rules, and review the class grid — form and table stay on one screen on wide layouts.
            </Typography>
            {isStackedLayout ? (
              <Button
                component="a"
                href="#class-results"
                size="small"
                variant="outlined"
                color="inherit"
                endIcon={<KeyboardArrowDownIcon />}
                sx={{
                  mt: 1.5,
                  borderColor: alpha("#fff", 0.5),
                  color: "inherit",
                  "&:hover": { borderColor: alpha("#fff", 0.9), bgcolor: alpha("#fff", 0.08) },
                }}
              >
                Jump to class results
              </Button>
            ) : null}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
