import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { Link } from "react-router-dom";

const useStyles = makeStyles({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: 0
  },
  title: {
    flexGrow: 1
  },
  header_appbar: {
    background: "#ffc605",
    color: "black"
  }
});

export default function Header() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.header_appbar}>
        <Toolbar className={classes.toolbarHeader}>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Link to="/">
            <Typography variant="h6" className={classes.title}>
              TFW Mazatlan Combat Club
            </Typography>
          </Link>
          <Link to="/newUser"><Typography variant="h6">New Client</Typography></Link>
          <Link to="/products"><Typography variant="h6">Products</Typography></Link>
          <Button color="inherit" className={classes.loginButton}>Login</Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}
