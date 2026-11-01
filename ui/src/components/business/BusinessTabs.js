import { Link, useLocation } from "react-router-dom";
import { Box, Tab, Tabs } from "@mui/material";

// tabs: [{ label, path }]. The tab whose path the current URL starts with
// is selected, so the tabs stay right on reload and on the back button.
export default function BusinessTabs({ tabs }) {
  const { pathname } = useLocation();
  const currentTab = tabs.find((tab) => pathname.startsWith(tab.path));

  return (
    <Box sx={{ borderBottom: 1, borderColor: "rgba(255,255,255,0.3)" }}>
      <Tabs
        value={currentTab ? currentTab.path : false}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          "& .MuiTab-root": { color: "rgba(255,255,255,0.7)" },
          "& .MuiTab-root.Mui-selected": { color: "#BBE1FA" },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.path}
            label={tab.label}
            value={tab.path}
            component={Link}
            to={tab.path}
          />
        ))}
      </Tabs>
    </Box>
  );
}
