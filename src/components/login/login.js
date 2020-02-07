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
import { useQuery, useLazyQuery } from "@apollo/react-hooks";
import { GET_USER_BY_ID_AUTH, GET_USER } from "../../database/queries";
import NotFound from "../notFound/notFound";
import { comparePassword } from "../../auth/methods";
const jwt = require("jsonwebtoken");

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
  const [clickValidationState, setClickValidationState] = useState(false);
  const [userAuth, setUserAuth] = useState(false);
  const [userIdAuth, setUserIdAuth] = useState(0);
  const [disabledButton, setDisabledButton] = useState(false);
  const [userState, setUserState] = useState({
    user: "",
    password: ""
  });
  const [temporalUserState, setTemporalUserState] = useState({
    user: "",
    password: ""
  });
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

  const [
    userQuery,
    { data: userData, loading: userLoading, error: userError }
  ] = useLazyQuery(GET_USER, {
    variables: {
      user: userState.user
    },
    onCompleted: () => {
      if (clickValidationState) {
        if (userData.users.length === 0) {
          setSnackbarState({
            vertical: "bottom",
            horizontal: "right",
            openSnackbar: true,
            snackBarText: "Usuario y/o contraseña incorrecta",
            snackbarColor: "#d32f2f"
          });
        } else {
          if (comparePassword(userState.password, userData.users[0].password)) {
            setSnackbarState({
              vertical: "bottom",
              horizontal: "right",
              openSnackbar: true,
              snackBarText: "Bienvenido",
              snackbarColor: "#d32f2f"
            });
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
          }
        }
      }

      setUserState({
        user: "",
        password: ""
      });
      setClickValidationState(false);
      setDisabledButton(false);
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

  if (userAuthLoading) {
    return <CircularProgress />;
  }

  if (userAuthError) {
    return <NotFound />;
  }

  const login = () => {
    const { user, password } = temporalUserState;
    if (user.trim() === "" || password.trim() === "") {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "Ingresa el usuario y la contraseña",
        snackbarColor: "#d32f2f"
      });
      setDisabledButton(false);
      return;
    } else {
      userQuery();
      if (userLoading) {
        return <CircularProgress />;
      }
      if (userError) {
        return <NotFound />;
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarState({ ...snackbarState, openSnackbar: false });
  };

  return userAuth ? (
    <Redirect to="/" />
  ) : (
    <Grid container justify="center" className={classes.container}>
      <Grid item md={3}>
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
              inputProps={{
                maxLength: 20
              }}
              onChange={e => {
                setTemporalUserState({
                  ...temporalUserState,
                  user: e.target.value
                });
              }}
            />
            <TextField
              className={classes.textFields}
              required
              id="password"
              label="Contraseña"
              margin="normal"
              value={temporalUserState.password}
              inputProps={{
                maxLength: 20,
                type: "password"
              }}
              onChange={e => {
                setTemporalUserState({
                  ...temporalUserState,
                  password: e.target.value
                });
              }}
              onKeyPress={e => {
                const pressKey = e.keyCode ? e.keyCode : e.which;
                if (pressKey === 13) {
                  setDisabledButton(true);
                  setUserState({
                    user: temporalUserState.user,
                    password: temporalUserState.password
                  });
                  setClickValidationState(true);
                  login();
                }
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
                  setDisabledButton(true);
                  setUserState({
                    user: temporalUserState.user,
                    password: temporalUserState.password
                  });
                  setClickValidationState(true);
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
