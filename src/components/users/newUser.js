import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useMutation } from "@apollo/react-hooks";
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress
} from "@material-ui/core";
import { Query } from "react-apollo";
import { GET_USER_TYPES } from "../../database/queries";
import { ADD_USER } from "../../database/mutations";

const useStyles = makeStyles({
  root: {
	flexGrow: 1,
	padding: "50px",
	margin: "20px"
  },
  textField: {
	  width: "100%"
  }
});

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
  const [errorState, setErrorState] = useState(false);
  const [
    addUserMutation,
    { loading: loadingAddUserMutation, error: errorAddUserMutation }
  ] = useMutation(ADD_USER);

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
      first_name === "" ||
      last_name === "" ||
      address === "" ||
      phone_number === "" ||
      email === "" ||
      user_type === 0
    ) {
      setErrorState(true);
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
    if (errorAddUserMutation) return <p>An error occurred</p>;
  };

  let response = errorState ? <p>All fields are requireds</p> : <p></p>;

  return (
    <Paper className={classes.root}>
      {response}
      <Typography variant="h5">Add User</Typography>
      <Grid container justify="center">
        <Grid item xs={10} md={8} xl={8}>
          <TextField
            required
			id="outlined-required"
			className={classes.textField}
            label="First Name"
            margin="normal"
            value={userState.first_name}
            variant="outlined"
            onChange={e => {
              setUserState({
                ...userState,
                first_name: e.target.value
              });
            }}
          />
        </Grid>
        <Grid item xs={10} md={8} xl={8}>
          <TextField
            required
			id="outlined-required"
			className={classes.textField}
            label="Last Name"
            margin="normal"
            value={userState.last_name}
            variant="outlined"
            onChange={e => {
              setUserState({
                ...userState,
                last_name: e.target.value
              });
            }}
          />
        </Grid>
        <Grid item xs={10} md={8} xl={8}>
          <TextField
            required
			id="outlined-required"
			className={classes.textField}
            label="Address"
            margin="normal"
            value={userState.address}
            variant="outlined"
            onChange={e => {
              setUserState({
                ...userState,
                address: e.target.value
              });
            }}
          />
        </Grid>
        <Grid item xs={10} md={8} xl={8}>
          <TextField
            required
			id="outlined-required"
			className={classes.textField}
            label="Number Phone"
            margin="normal"
            value={userState.phone_number}
            variant="outlined"
            onChange={e => {
              setUserState({
                ...userState,
                phone_number: e.target.value
              });
            }}
          />
        </Grid>
        <Grid item xs={10} md={8} xl={8}>
          <TextField
            required
			id="outlined-required"
			className={classes.textField}
            label="Email"
            margin="normal"
            value={userState.email}
            variant="outlined"
            onChange={e => {
              setUserState({
                ...userState,
                email: e.target.value
              });
            }}
          />
        </Grid>
        <Grid item xs={10} md={8} xl={8}>
          <TextField
            select
			label="User Type"
			className={classes.textField}
            SelectProps={{
              native: true
            }}
            margin="normal"
            variant="outlined"
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
        <Grid item xs={10} md={8} xl={8}>
          <Button
            variant="contained"
            onClick={() => {
              addUser();
            }}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
