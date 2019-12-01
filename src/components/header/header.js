import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {AppBar, Toolbar, Typography, Button, IconButton} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { Link } from 'react-router-dom';

const styles = (theme) => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    header_appbar: {
        background: "#ffc605",
        color: "black"
    }
  });

class Header extends Component {
    render(){
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <AppBar position="static" className={classes.header_appbar}>
                    <Toolbar>
                    <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                        <MenuIcon />
                    </IconButton>
                    <Link to="/">
                        <Typography variant="h6" className={classes.title}>
                            TFW Mazatlan Combat Club
                        </Typography>
                    </Link>
                    <Link to="/newUser">New Client</Link>
                    <Button color="inherit">Login</Button>
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

export default withStyles(styles)(Header);
