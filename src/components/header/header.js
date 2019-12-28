import React from 'react';
import { Switch, Route, NavLink } from "react-router-dom";
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
    Home as HomeIcon,
    Group as GroupIcon,
    AccountBox as AccountBoxIcon,
    SportsKabaddi as SportsKabaddiIcon,
    MonetizationOn as MonetizationOnIcon
  } from "@material-ui/icons";
import TFWLogo from "../../assets/images/logo.png";
import Home from '../home/home';
import Users from '../users/users';
import NewUser from '../users/newUser';
import UserTypes from '../userTypes/userTypes';
import Lessons from '../lessons/lessons';
import Products from '../products/products';
import User from '../users/user';
import Assists from '../assists/assists';
import NewUserType from '../userTypes/newUserType';
import UserType from '../userTypes/userType';
import NotFound from '../notFound/notFound';
import NewLesson from '../lessons/newLesson';
import Lesson from '../lessons/lesson';
import Packages from '../classPackages/packages';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth
    },
    background: "#ffc605",
      color: "#000000"
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
    background: "#ffc605",
    color: "#000000"
  },
  content: {
    maxWidth: "100%",
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  navLink: {
      textDecoration: "none",
      color: "#000000",
      '&:hover':{
        textDecoration: "none",
        color: "#000000"
      }
  },
  logo: {
    width: "100%", 
    height: "200px",
    padding: "10px"
  },
  icons: {
    color: "black"
  }
}));

export default function Header() {
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      {/*<div className={classes.toolbar} /> */}
      <img src={TFWLogo} alt="TFW logo" className={classes.logo}/>
      <Divider />
      <List>
      <NavLink to="/" className={classes.navLink}>
        <ListItem button>
          <ListItemIcon>
            <HomeIcon className={classes.icons} />
          </ListItemIcon>
          <ListItemText primary="Home"></ListItemText>
        </ListItem>
      </NavLink>
      <NavLink to="/users" className={classes.navLink}>
        <ListItem button>
          <ListItemIcon>
            <GroupIcon className={classes.icons} />
          </ListItemIcon>
          <ListItemText primary="Users" />
        </ListItem>
      </NavLink>
      <NavLink to="/userTypes" className={classes.navLink}>
        <ListItem button>
          <ListItemIcon>
            <AccountBoxIcon className={classes.icons} />
          </ListItemIcon>
          <ListItemText primary="Users type" />
        </ListItem>
      </NavLink>
      <NavLink to="/lessons" className={classes.navLink}>
        <ListItem button>
          <ListItemIcon>
            <SportsKabaddiIcon className={classes.icons} />
          </ListItemIcon>
          <ListItemText primary="Classes" />
        </ListItem>
      </NavLink>
      <NavLink to="/packages" className={classes.navLink}>
        <ListItem button>
          <ListItemIcon>
            <MonetizationOnIcon className={classes.icons} />
          </ListItemIcon>
          <ListItemText primary="Packages" />
        </ListItem>
      </NavLink>
      </List>
    </div>
  );

    return (
        <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
          TFW Mazatlan Combat Club
          </Typography>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/users" component={Users} />
            <Route exact path="/newUser" component={NewUser} />
            <Route exact path="/user/:userId" component={User} />
            <Route exact path="/userTypes" component={UserTypes} />
            <Route exact path="/newUserType" component={NewUserType} />
            <Route exact path="/userType/:userTypeId" component={UserType} />
            <Route exact path="/lessons" component={Lessons} />
            <Route exact path="/newLesson" component={NewLesson} />
            <Route exact path="/lesson/:classId" component={Lesson} />
            <Route exact path="/assists/:userId" component={Assists} />
            <Route exact path="/products" component={Products} />	
            <Route exact path="/packages" component={Packages} />	
            <Route exact path="*" component={NotFound}></Route>
        </Switch>
      </main>
    </div>
    )
}