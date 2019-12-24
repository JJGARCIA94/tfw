import React, { useState } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
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
import { ArrowBack as ArrowBackIcon } from "@material-ui/icons";
import { useMutation, useSubscription } from "@apollo/react-hooks";
import { GET_USER_BY_ID, GET_USER_TYPES } from "../../database/queries";
import { UPDATE_USER } from "../../database/mutations";
import NotFound from "../notFound/notFound";
import { keyValidation, pasteValidation } from "../../helpers/helpers";

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
  button: {
    float: "right",
    margin: theme.spacing(2, 0),
    backgroundColor: "#ffc605",
    "&:hover": {
      backgroundColor: "#ffff00"
    }
  }
}));

export default function User(props) {
  const userId = props.match.params.userId;
  const classes = useStyles();
  const [userState, setUserState] = useState({
    first_name: "",
    last_name: "",
    address: "",
    phone_number: "",
    email: "",
    user_type: 0,
    created_at: "",
    updated_at: ""
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
  const { loading: userLoading, data: userData, error: userError } = useSubscription(
    GET_USER_BY_ID,
    {
      variables: {
        id: userId
      }
    }
  );
  const {
    loading: userTypesLoading,
    data: userTypesData,
    error: userTypesError
  } = useSubscription(GET_USER_TYPES);
  const [
    updateUserMutation,
    { loading: updateUserMutationLoading, error: updateUserMutationError }
  ] = useMutation(UPDATE_USER);

  if (userLoading || userTypesLoading) {
    return <CircularProgress />;
  }
  if (userError || !userData.users_data.length || userTypesError) {
    return <NotFound />;
  }

  const getData = userData => {
    const createAt = new Date(userData.created_at);
    const updated_at = new Date(userData.updated_at);
    setUserState({
      first_name: userData.first_name,
      last_name: userData.last_name,
      address: userData.address,
      phone_number: userData.phone_number,
      email: userData.email,
      user_type: userData.R_user_type.id,
      created_at: createAt.toLocaleString(),
      updated_at: updated_at.toLocaleString()
    });
  };

  const handleClose = () => {
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

  const updateUser = async () => {
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

    const resultUpdatedUser = await updateUserMutation({
      variables: {
        id: userId,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        address: address.trim(),
        phone_number: phone_number.trim(),
        email: email.trim(),
        user_type: user_type
      }
    });

    if (updateUserMutationLoading) return <CircularProgress />;
    if (updateUserMutationError) {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "An error occurred",
        snackbarColor: "#d32f2f"
      });
      setDisabledButton(false);
      return;
    }

    const newUserData = resultUpdatedUser.data.update_users_data.returning[0];
    getData(newUserData);

    setSnackbarState({
      ...snackbarState,
      openSnackbar: true,
      snackBarText: "User updated",
      snackbarColor: "#43a047"
    });

    setDisabledButton(false);
  };

  return (
    <div>
      <Card>
        <Toolbar>
          <Typography variant="h6">
            User information
            <Link to="/users">
              <ArrowBackIcon />
            </Link>
          </Typography>
        </Toolbar>
        <Grid container justify="center" className={classes.root}>
          <Grid item md={5} xs={10}>
            <TextField
              className={classes.textFields}
              id="create_at"
              label="Created at"
              margin="normal"
              value={userState.created_at}
              disabled
            />
          </Grid>
          <Grid item md={1}></Grid>
          <Grid item md={5} xs={10}>
            <TextField
              className={classes.textFields}
              id="updated_at"
              label="Last update"
              margin="normal"
              value={userState.updated_at}
              disabled
            />
          </Grid>
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
              id="user_type"
              label="User Type"
              className={classes.textFields}
              SelectProps={{
                native: true
              }}
              margin="normal"
              value={userState.user_type}
              onAnimationEnd={() => {
                getData(userData.users_data[0]);
              }}
              onChange={e => {
                setUserState({
                  ...userState,
                  user_type: e.target.value
                });
              }}
            >
              {getUserTypes()}
            </TextField>
          </Grid>
          <Grid item xs={10} md={11} xl={11}>
            <Button
              variant="contained"
              disabled={disabledButton}
              className={classes.button}
              onClick={() => {
                updateUser();
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
        onClose={handleClose}
        ContentProps={{
          "aria-describedby": "message-id",
          style: { background: snackbarColor }
        }}
        message={<span id="message-id">{snackBarText}</span>}
      />
    </div>
  );
}
