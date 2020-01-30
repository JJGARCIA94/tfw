import React, { useEffect } from "react";
import { Switch, Route, NavLink, Redirect } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MenuIcon from "@material-ui/icons/Menu";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Home as HomeIcon,
  Group as GroupIcon,
  AccountBox as AccountBoxIcon,
  HourglassEmpty as HourglassEmptyIcon,
  SportsKabaddi as SportsKabaddiIcon,
  MonetizationOn as MonetizationOnIcon,
  Https as HttpsIcon
} from "@material-ui/icons";
import TFWLogo from "../../assets/images/logo.png";
import Login from "../login/login";
import Home from "../home/home";
import Users from "../users/users";
import NewUser from "../users/newUser";
import UserTypes from "../userTypes/userTypes";
import Lessons from "../lessons/lessons";
import Products from "../products/products";
import User from "../users/user";
import Assists from "../assists/assists";
import NewUserType from "../userTypes/newUserType";
import NewUserPayment from "../usersPayment/newUserPayment";
import UserPayments from "../usersPayment/userPayments";
import UserType from "../userTypes/userType";
import PaymentPeriods from "../paymentPeriods/paymentPeriods";
import NewPaymentPeriod from "../paymentPeriods/newPaymentPeriod";
import PaymentPeriod from "../paymentPeriods/paymentPeriod";
import NotFound from "../notFound/notFound";
import NewLesson from "../lessons/newLesson";
import Lesson from "../lessons/lesson";
import ClassesPrice from "../classesPrice/classesPrice";
import NewClassPrice from "../classesPrice/newClassPrice";
import ClassesClassPrice from "../classesPrice/classesClassPrice";
import PaymentsClassPrice from "../classesPrice/paymentsClassPrice";
import Lockers from "../lockers/lockers";
import SelectUserToLocker from "../lockers/selectUserToLocker";
import { Button, CircularProgress } from "@material-ui/core";
import { useQuery } from "@apollo/react-hooks";
import { GET_USER_BY_ID_AUTH } from "../../database/queries";
const jwt = require("jsonwebtoken");

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0
    }
  },
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth
    },
    background: "#ffc605",
    color: "#000000"
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none"
    }
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
    padding: theme.spacing(3)
  },
  navLink: {
    textDecoration: "none",
    color: "#000000",
    "&:hover": {
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
  const [userAuth, setUserAuth] = React.useState(true);
  const [userIdAuth, setUserIdAuth] = React.useState(0);
  const {
    data: userAuthData,
    loading: userAuthLoading,
    error: userAuthError
  } = useQuery(GET_USER_BY_ID_AUTH, {
    variables: {
      id: userIdAuth
    },
    onCompleted: () => {
      if (userAuthData.users.length === 0 && userIdAuth !== 0) {
        localStorage.removeItem("token");
        setUserAuth(false);
      }
    }
  });

  useEffect(() => {
    function isUserAuth() {
      try {
        if (localStorage.getItem("token")) {
          const decodedToken = jwt.verify(
            localStorage.getItem("token"),
            "mysecretpassword"
          );
          setUserIdAuth(decodedToken.id);
        } else {
          setUserAuth(false);
        }
      } catch (err) {
        localStorage.removeItem("token");
        setUserAuth(false);
      }
    }

    isUserAuth();
  });

  if (userAuthLoading) {
    return <CircularProgress />;
  }

  if (userAuthError) {
    return <NotFound />;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      {/*<div className={classes.toolbar} /> */}
      <img src={TFWLogo} alt="TFW logo" className={classes.logo} />
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
            <ListItemText primary="Usuarios" />
          </ListItem>
        </NavLink>
        <NavLink to="/userTypes" className={classes.navLink}>
          <ListItem button>
            <ListItemIcon>
              <AccountBoxIcon className={classes.icons} />
            </ListItemIcon>
            <ListItemText primary="Tipos de usuario" />
          </ListItem>
        </NavLink>
        <NavLink to="/paymentPeriods" className={classes.navLink}>
          <ListItem button>
            <ListItemIcon>
              <HourglassEmptyIcon className={classes.icons} />
            </ListItemIcon>
            <ListItemText primary="Períodos de pago" />
          </ListItem>
        </NavLink>
        <NavLink to="/lessons" className={classes.navLink}>
          <ListItem button>
            <ListItemIcon>
              <SportsKabaddiIcon className={classes.icons} />
            </ListItemIcon>
            <ListItemText primary="Clases" />
          </ListItem>
        </NavLink>
        <NavLink to="/classesPrice" className={classes.navLink}>
          <ListItem button>
            <ListItemIcon>
              <MonetizationOnIcon className={classes.icons} />
            </ListItemIcon>
            <ListItemText primary="Precios de clases y paquetes" />
          </ListItem>
        </NavLink>
        <NavLink to="/lockers" className={classes.navLink}>
          <ListItem button>
            <ListItemIcon>
              <HttpsIcon className={classes.icons} />
            </ListItemIcon>
            <ListItemText primary="Casilleros" />
          </ListItem>
        </NavLink>
      </List>
    </div>
  );

  const closeSesion = () => {
    localStorage.removeItem("token");
    setUserAuth(false);
  };

  return (
    <div className={classes.root}>
      {userAuth ? (
        <div>
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
              <Button
                color="secondary"
                variant="contained"
                style={{ float: "right" }}
                onClick={() => {
                  closeSesion();
                }}
              >
                Cerrar sesión
              </Button>
            </Toolbar>
          </AppBar>
          <nav className={classes.drawer} aria-label="mailbox folders">
            {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
            <Hidden smUp implementation="css">
              <Drawer
                variant="temporary"
                anchor={theme.direction === "rtl" ? "right" : "left"}
                open={mobileOpen}
                onClose={handleDrawerToggle}
                classes={{
                  paper: classes.drawerPaper
                }}
                ModalProps={{
                  keepMounted: true // Better open performance on mobile.
                }}
              >
                {drawer}
              </Drawer>
            </Hidden>
            <Hidden xsDown implementation="css">
              <Drawer
                classes={{
                  paper: classes.drawerPaper
                }}
                variant="permanent"
                open
              >
                {drawer}
              </Drawer>
            </Hidden>
          </nav>
        </div>
      ) : (
        <Redirect to="/login" />
      )}
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Switch>
          <Route exact path="/login">
            <Login setUserAuth={setUserAuth} />
          </Route>
          <Route exact path="/" component={Home} />
          <Route exact path="/users" component={Users} />
          <Route exact path="/newUser" component={NewUser} />
          <Route exact path="/user/:userId" component={User} />
          <Route exact path="/userTypes" component={UserTypes} />
          <Route exact path="/newUserType" component={NewUserType} />
          <Route
            exact
            path="/newUserPayment/:userId"
            component={NewUserPayment}
          />
          <Route exact path="/userPayments/:userId" component={UserPayments} />
          <Route exact path="/userType/:userTypeId" component={UserType} />
          <Route exact path="/paymentPeriods" component={PaymentPeriods} />
          <Route exact path="/newPaymentPeriod" component={NewPaymentPeriod} />
          <Route
            exact
            path="/paymentPeriod/:paymentPeriodId"
            component={PaymentPeriod}
          />
          <Route exact path="/lessons" component={Lessons} />
          <Route exact path="/newLesson" component={NewLesson} />
          <Route exact path="/lesson/:classId" component={Lesson} />
          <Route exact path="/assists/:userId" component={Assists} />
          <Route exact path="/products" component={Products} />
          <Route exact path="/classesPrice" component={ClassesPrice} />
          <Route exact path="/newClassPrice" component={NewClassPrice} />
          <Route
            exact
            path="/classesClassPrice/:classPriceId"
            component={ClassesClassPrice}
          />
          <Route
            exact
            path="/paymentsClassPrice/:classPriceId"
            component={PaymentsClassPrice}
          />
          <Route exact path="/lockers" component={Lockers} />
          <Route
            exact
            path="/selectUserToLocker/:lockerId"
            component={SelectUserToLocker}
          />
          <Route exact path="*" component={NotFound}></Route>
        </Switch>
      </main>
    </div>
  );
}
