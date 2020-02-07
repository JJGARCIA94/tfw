import React, { useState } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { useMutation, useSubscription } from "@apollo/react-hooks";
import {
  CircularProgress,
  Grid,
  TextField,
  Typography,
  Button,
  Card,
  Toolbar,
  Snackbar
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { GET_USER_TYPES } from "../../database/queries";
import { ADD_USER } from "../../database/mutations";
import { keyValidation, pasteValidation } from "../../helpers/helpers";
import NotFound from "../notFound/notFound";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2)
  },
  textFields: {
    width: "100%"
  },
  button: {
    float: "right",
    margin: theme.spacing(2, 0),
    backgroundColor: "#ffc605",
    "&:hover": {
      backgroundColor: "#ffff00"
    }
  }
}));

const formatDateWhitoutMinutes = date => {
  date = new Date(date);
  let correctMont =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  let correctDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${date.getFullYear()}-${correctMont}-${correctDay}`;
};

export default function NewUser() {
  const classes = useStyles();
  const now = Date.now();
  const [userState, setUserState] = useState({
    first_name: "",
    last_name: "",
    address: "",
    phone_number: "",
    email: "",
    user_type: 0
  });
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
    addUserMutation,
    { loading: addUserMutationLoading, error: addUserMutationError }
  ] = useMutation(ADD_USER);
  const {
    loading: userTypesLoading,
    data: userTypesData,
    error: userTypesError
  } = useSubscription(GET_USER_TYPES);

  if(userTypesLoading) {
    return <CircularProgress />
  }
  if(userTypesError) {
    return <NotFound />
  }

  const handleCloseSnackbar = () => {
    setSnackbarState({ ...snackbarState, openSnackbar: false });
  };

  const getUserTypes = () => {
    return userTypesData.users_type.map(userType => {
      return (
        <option key={userType.id} value={userType.id}>
          {userType.name}
        </option>
      );
    });
  };

  const addUser = async () => {
    setDisabledButton(true);
    const {
      first_name,
      last_name,
      address,
      phone_number,
      email,
      user_type
    } = userState;
    if (
      first_name.trim() === "" ||
      last_name.trim() === "" ||
      address.trim() === "" ||
      phone_number.trim() === "" ||
      email.trim() === "" ||
      user_type === 0
    ) {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "All fields are requireds",
        snackbarColor: "#d32f2f"
      });
      setDisabledButton(false);
      return;
    }
    console.log(formatDateWhitoutMinutes(now));
    addUserMutation({
      variables: {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        address: address.trim(),
        phone_number: phone_number.trim(),
        email: email.trim(),
        user_type: user_type,
        created: formatDateWhitoutMinutes(now)
      }
    });

    if (addUserMutationLoading) return <CircularProgress />;
    if (addUserMutationError) {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "An error occurred",
        snackbarColor: "#d32f2f"
      });
      setDisabledButton(false);
      return;
    }

    setUserState({
      first_name: "",
      last_name: "",
      address: "",
      phone_number: "",
      email: "",
      user_type: 0
    });

    setSnackbarState({
      ...snackbarState,
      openSnackbar: true,
      snackBarText: "User added",
      snackbarColor: "#43a047"
    });
    setDisabledButton(false);
  };

  return (
    <div>
      <Card>
        <Toolbar>
          <Typography variant="h6">
            Add user
            <Link to="/users">
              <ArrowBackIcon />
            </Link>
          </Typography>
        </Toolbar>
        <Grid container justify="center" className={classes.root}>
          <Grid item md={5} xs={10}>
            <TextField
              className={classes.textFields}
              required
              id="first_name"
              label="First Name"
              margin="normal"
              value={userState.first_name}
              inputProps={{
                maxLength: 30
              }}
              onKeyPress={e => {
                keyValidation(e, 1);
              }}
              onChange={e => {
                pasteValidation(e, 1);
                setUserState({
                  ...userState,
                  first_name: e.target.value
                });
              }}
            />
          </Grid>
          <Grid item md={1}></Grid>
          <Grid item md={5} xs={10}>
            <TextField
              className={classes.textFields}
              required
              id="last_name"
              label="Last Name"
              margin="normal"
              value={userState.last_name}
              inputProps={{
                maxLength: 30
              }}
              onKeyPress={e => {
                keyValidation(e, 1);
              }}
              onChange={e => {
                pasteValidation(e, 1);
                setUserState({
                  ...userState,
                  last_name: e.target.value
                });
              }}
            />
          </Grid>
          <Grid item md={5} xs={10}>
            <TextField
              className={classes.textFields}
              required
              id="address"
              label="Address"
              margin="normal"
              value={userState.address}
              inputProps={{
                maxLength: 50
              }}
              onKeyPress={e => {
                keyValidation(e, 3);
              }}
              onChange={e => {
                pasteValidation(e, 3);
                setUserState({
                  ...userState,
                  address: e.target.value
                });
              }}
            />
          </Grid>
          <Grid item md={1}></Grid>
          <Grid item md={5} xs={10}>
            <TextField
              className={classes.textFields}
              required
              id="phone_number"
              label="Phone number"
              margin="normal"
              value={userState.phone_number}
              inputProps={{
                maxLength: 15
              }}
              onKeyPress={e => {
                keyValidation(e, 2);
              }}
              onChange={e => {
                pasteValidation(e, 2);
                setUserState({
                  ...userState,
                  phone_number: e.target.value
                });
              }}
            />
          </Grid>
          <Grid item md={5} xs={10}>
            <TextField
              className={classes.textFields}
              required
              id="email"
              label="Email"
              margin="normal"
              value={userState.email}
              inputProps={{
                maxLength: 50
              }}
              onKeyPress={e => {
                keyValidation(e, 4);
              }}
              onChange={e => {
                pasteValidation(e, 4);
                setUserState({
                  ...userState,
                  email: e.target.value
                });
              }}
            />
          </Grid>
          <Grid item md={1}></Grid>
          <Grid item md={5} xs={10}>
            <TextField
              select
              label="User Type"
              className={classes.textFields}
              SelectProps={{
                native: true
              }}
              margin="normal"
              value={userState.user_type}
              onChange={e => {
                setUserState({
                  ...userState,
                  user_type: e.target.value
                });
              }}
            >
              <option value="0">Select a user type</option>
              {getUserTypes()}
            </TextField>
          </Grid>
          <Grid item xs={10} md={11}>
            <Button
              variant="contained"
              disabled={disabledButton}
              className={classes.button}
              onClick={() => {
                addUser();
              }}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Card>
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
    </div>
  );
}
