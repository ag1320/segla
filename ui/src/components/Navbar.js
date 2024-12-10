import { Link } from "react-router-dom";
import { useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import FeedIcon from "@mui/icons-material/Feed";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeIcon from "@mui/icons-material/Home";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SchoolIcon from '@mui/icons-material/School';
import logo from "../images/Segla.ico";
import {
  Box,
  Toolbar,
  Typography,
  Button,
  Drawer,
  CssBaseline,
  List,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function Navbar() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex", height: "7vh" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        open={open}
        style={{ backgroundColor: "#0F4C75", height: "7vh" }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Link to="/">
            <Button color="inherit">
              <img src={logo} alt="" style={{maxHeight: 50}} />
            </Button>
          </Link>
          <Typography component={"span"} style={{ marginLeft: 20 }}>
            Hi Gettemys, welcome to Segla!
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <Link
            to="/"
            onClick={handleDrawerClose}
            style={{ textDecoration: "none", color: "black" }}
          >
            <ListItem button>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
          </Link>
          <Link
            to="/budget"
            onClick={handleDrawerClose}
            style={{ textDecoration: "none", color: "black" }}
          >
            <ListItem button>
              <ListItemIcon>
                <FeedIcon />
              </ListItemIcon>
              <ListItemText primary="Budget" />
            </ListItem>
          </Link>
        </List>
        <Divider />
        <List>
          <Link
            to="/retirement"
            onClick={handleDrawerClose}
            style={{ textDecoration: "none", color: "black" }}
          >
            <ListItem button>
              <ListItemIcon>
                <AccountBalanceIcon style={{ fill: "orange" }}/>
              </ListItemIcon>
              <ListItemText primary="Retirment" />
            </ListItem>
          </Link>
          <Link
            to="/investments"
            onClick={handleDrawerClose}
            style={{ textDecoration: "none", color: "black" }}
          >
            <ListItem button>
              <ListItemIcon>
                <ShowChartIcon style={{ fill: "purple" }}/>
              </ListItemIcon>
              <ListItemText primary="Other Investments" />
            </ListItem>
          </Link>
          <Link
            to="/reserve"
            onClick={handleDrawerClose}
            style={{ textDecoration: "none", color: "black" }}
          >
            <ListItem button>
              <ListItemIcon>
                <SavingsIcon style={{ fill: "green" }}/>
              </ListItemIcon>
              <ListItemText primary="Emergency Fund" />
            </ListItem>
          </Link>
          <Link
            to="/loans"
            onClick={handleDrawerClose}
            style={{ textDecoration: "none", color: "black" }}
          >
            <ListItem button>
              <ListItemIcon>
                <SchoolIcon style={{ fill: "#0F4C75" }}/>
              </ListItemIcon>
              <ListItemText primary="Loans" />
            </ListItem>
          </Link>
        </List>
        <p style={{ marginTop: "auto", textAlign: "center", marginBottom: 0 }}>
          - Segla from Segullah -
        </p>
        <p style={{ textAlign: "center", marginBottom: 0 }}>
          Hebrew for valued treasure,
        </p>
        <p style={{ textAlign: "center", marginBottom: 0 }}>
          often referring to
        </p>
        <p style={{ textAlign: "center" }}>God's people or wealth</p>
      </Drawer>
      <Main open={open}></Main>
    </Box>
  );
}
