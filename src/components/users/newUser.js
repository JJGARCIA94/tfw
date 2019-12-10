import React, { useState } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { useMutation } from "@apollo/react-hooks";
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
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Query } from "react-apollo";
import { GET_USER_TYPES } from "../../database/queries";
import { ADD_USER } from "../../database/mutations";

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

export default function NewUser() {
  const classes = useStyles();
  const [userState, setUserState] = useState({
    first_name: "",
    last_name: "",
    address: "",
    phone_number: "",
    email: "",
    user_type: 0
  });
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    vertical: 'bottom',
    horizontal: 'right',
    text: '',
    color: ''
  });
  const { vertical, horizontal, open, text, color } = snackbarState;
  const [
    addUserMutation,
    { loading: loadingAddUserMutation, error: errorAddUserMutation }
  ] = useMutation(ADD_USER);

  const handleClose = () => {
    setSnackbarState({ ...snackbarState, open: false });
  };

  const getUserTypes = () => {
    return (
      <Query query={GET_USER_TYPES}>
        {({ loading, error, data }) => {
          if (loading) return "Loading...";
          if (error) return console.log(error);
          if (data.users_type.length) {
            return data.users_type.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ));
          } else {
            return (
              <option value="0">No hay tipos de usuarios para mostrar</option>
            );
          }
        }}
      </Query>
    );
  };

  const addUser = async () => {
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
        open: true,
        text: 'All fields are requireds',
        color: '#d32f2f'
      })
      return;
    }

    addUserMutation({
      variables: {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        address: address.trim(),
        phone_number: phone_number.trim(),
        email: email.trim(),
        user_type: user_type
      }
    });

    if (loadingAddUserMutation) return <CircularProgress />;
    if (errorAddUserMutation){
      setSnackbarState({
        ...snackbarState,
        open: true,
        text: 'An error occurred',
        color: '#d32f2f'
      });
      return;
    }
    
    setUserState({
      first_name: '',
      last_name: '',
      address: '',
      phone_number: '',
      email: '',
      user_type: 0
    });

    setSnackbarState({
      ...snackbarState,
      open: true,
      text: 'User added',
      color: '#43a047'
    });
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
              id="outlined-required"
              label="First Name"
              margin="normal"
              value={userState.first_name}
              onChange={e => {
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
              id="outlined-required"
              label="Last Name"
              margin="normal"
              value={userState.last_name}
              onChange={e => {
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
              id="outlined-required"
              label="Address"
              margin="normal"
              value={userState.address}
              onChange={e => {
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
              id="outlined-required"
              label="Phone number"
              margin="normal"
              value={userState.phone_number}
              onChange={e => {
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
              id="outlined-required"
              label="Email"
              margin="normal"
              value={userState.email}
              onChange={e => {
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
          <Grid item xs={10} md={11} xl={11}>
            <Button
              variant="contained"
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
        open={open}
        onClose={handleClose}
        ContentProps={{
          'aria-describedby': 'message-id',
          style:{background: color}
        }}
        message={<span id="message-id">{text}</span>}
      />
    </div>
  );
}
