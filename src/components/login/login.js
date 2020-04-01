import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import {
  Card,
  Grid,
  TextField,
  Button,
  CardContent,
  CardActions,
  Snackbar,
  CircularProgress
} from "@material-ui/core";
import TFWLogo from "../../assets/images/logo.png";
import { useLazyQuery, useQuery } from "@apollo/react-hooks";
import { GET_USER, GET_USER_BY_ID_AUTH } from "../../database/queries";
import NotFound from "../notFound/notFound";
import { comparePassword } from "../../auth/methods";
import jwt from "jsonwebtoken";

const useStyles = makeStyles(theme => ({
  container: {
    marginTop: theme.spacing(3)
  },
  root: {
    padding: theme.spacing(3, 2)
  },
  textFields: {
    width: "100%"
  },
  logo: {
    width: "70%",
    padding: "10px"
  }
}));

export default function Login(props) {
  const classes = useStyles();
  const setUserAuthHeader = props.setUserAuth;
  const [userAuth, setUserAuth] = useState(false);
  const [userIdAuth, setUserIdAuth] = useState(0);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [disabledButton, setDisabledButton] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    openSnackbar: false,
    vertical: "bottom",
    horizontal: "right",
    snackBarText: "",
    snackbarColor: ""
  });
  const {
    vertical,
    horizontal,
    openSnackbar,
    snackBarText,
    snackbarColor
  } = snackbarState;
  const [
    userQuery,
    { data: userData, loading: userLoading, error: userError }
  ] = useLazyQuery(GET_USER);
  const {
    data: userAuthData,
    loading: userAuthLoading,
    error: userAuthError
  } = useQuery(GET_USER_BY_ID_AUTH, {
    variables: {
      id: userIdAuth
    },
    onCompleted: () => {
      if (userAuthData.users.length > 0) {
        setUserAuth(true);
        setUserAuthHeader(true);
      } else {
        if (userIdAuth !== 0) {
          localStorage.removeItem("token");
        }
      }
    }
  });

  useEffect(() => {
    function userAuth() {
      try {
        if (localStorage.getItem("token")) {
          const decodedToken = jwt.verify(
            localStorage.getItem("token"),
            "mysecretpassword"
          );
          setUserIdAuth(decodedToken.id);
        }
      } catch (err) {
        localStorage.removeItem("token");
      }
    }
    userAuth();
  });

  useEffect(() => {
    function login() {
      if (userData) {
        if (userData.users.length > 0) {
          if (comparePassword(password, userData.users[0].password)) {
            setSnackbarState({
              vertical: "bottom",
              horizontal: "right",
              openSnackbar: true,
              snackBarText: "Bienvenido",
              snackbarColor: "#d32f2f"
            });
            setDisabledButton(false);
            const token = jwt.sign(
                  { id: userData.users[0].id },
                  "mysecretpassword",
                  {
                    expiresIn: 60 * 60 * 24
                  }
                );
                localStorage.setItem("token", token);
          } else {
            setSnackbarState({
              vertical: "bottom",
              horizontal: "right",
              openSnackbar: true,
              snackBarText: "Usuario y/o contraseña incorrecta",
              snackbarColor: "#d32f2f"
            });
            setDisabledButton(false);
          }
        } else {
          setSnackbarState({
            vertical: "bottom",
            horizontal: "right",
            openSnackbar: true,
            snackBarText: "Usuario y/o contraseña incorrecta",
            snackbarColor: "#d32f2f"
          });
          setDisabledButton(false);
        }
      }
    }

    if(disabledButton) {
        login();
    }

  }, [userData, password, disabledButton]);

  if (userLoading || userAuthLoading) {
    return <CircularProgress />;
  }

  if (userError || userAuthError) {
    return <NotFound />;
  }

  const login = () => {
    if (user.trim() === "" || password.trim() === "") {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "Ingresa el usuario y la contraseña",
        snackbarColor: "#d32f2f"
      });
    } else {
      setDisabledButton(true);
      userQuery({
        variables: {
          user: user.trim()
        }
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarState({ ...snackbarState, openSnackbar: false });
  };

  return userAuth ? (
    <Redirect to="/" />
  ) : (
    <Grid container justify="center" className={classes.container}>
      <Grid item xs={10} sm={6} md={3}>
        <Card className={classes.root}>
          <center>
            <img src={TFWLogo} alt="TFW logo" className={classes.logo} />
          </center>
          <CardContent>
            <TextField
              className={classes.textFields}
              required
              id="user"
              label="Usuario"
              margin="normal"
              value={user}
              inputProps={{
                maxLength: 20
              }}
              onChange={e => {
                setUser(e.target.value);
              }}
            />
            <TextField
              className={classes.textFields}
              required
              id="password"
              label="Contraseña"
              margin="normal"
              value={password}
              inputProps={{
                maxLength: 20,
                type: "password"
              }}
              onKeyPress={e => {
                const pressKey = e.keyCode ? e.keyCode : e.which;
                if (pressKey === 13) {
                  login();
                }
              }}
              onChange={e => {
                setPassword(e.target.value);
              }}
            />
          </CardContent>
          <CardActions>
            <Grid container justify="center">
              <Button
                variant="contained"
                color="primary"
                disabled={disabledButton}
                onClick={() => {
                  login();
                }}
              >
                Ingresar
              </Button>
            </Grid>
          </CardActions>
        </Card>
      </Grid>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        key={`${vertical},${horizontal}`}
        open={openSnackbar}
        onClose={handleCloseSnackbar}
        ContentProps={{
          "aria-describedby": "message-id",
          style: { background: snackbarColor }
        }}
        message={<span id="message-id">{snackBarText}</span>}
      />
    </Grid>
  );
}
