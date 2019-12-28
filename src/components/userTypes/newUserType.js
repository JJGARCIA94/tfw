import React, { useState } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  Grid,
  TextField,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  Snackbar
} from "@material-ui/core";
import { ArrowBack as ArrowBackIcon } from "@material-ui/icons";
import { useMutation } from "@apollo/react-hooks";
import { ADD_USER_TYPE } from "../../database/mutations";
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

export default function NewUserType() {
  const classes = useStyles();
  const [userTypeState, setUserTypeState] = useState({
    name: ""
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
    addUserTypeMutation,
    { loading: userTypeLoading, error: userTypeError }
  ] = useMutation(ADD_USER_TYPE);

  const addUserType = () => {
    setDisabledButton(true);
    const { name } = userTypeState;

    if (name.trim() === "") {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "All fields are requireds",
        snackbarColor: "#d32f2f"
      });
      setDisabledButton(false);
      return;
    }

    addUserTypeMutation({
      variables: {
        name: name.trim()
      }
    });

    if (userTypeLoading) return <CircularProgress />;
    if (userTypeError) {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "An error occurred",
        snackbarColor: "#d32f2f"
      });
      setDisabledButton(false);
      return;
    }

    setUserTypeState({
      name: ""
    });

    setSnackbarState({
      ...snackbarState,
      openSnackbar: true,
      snackBarText: "User type added",
      snackbarColor: "#43a047"
    });
    setDisabledButton(false);
  };

  const handleClose = () => {
    setSnackbarState({ ...snackbarState, openSnackbar: false });
  };

  return (
    <Card>
      <Toolbar>
        <Typography variant="h6">
          Add user type
          <Link to="/userTypes">
            <ArrowBackIcon />
          </Link>
        </Typography>
      </Toolbar>
      <Grid container justify="center" className={classes.root}>
        <Grid item md={6} xs={10}>
          <TextField
            className={classes.textFields}
            required
            id="name"
            label="Name"
            margin="normal"
            value={userTypeState.name}
            inputProps={{
              maxLength: 50
            }}
            onKeyPress={e => {
              keyValidation(e, 5);
            }}
            onChange={e => {
              pasteValidation(e, 5);
              setUserTypeState({
                name: e.target.value
              });
            }}
          />
        </Grid>
        <Grid item xs={10} md={11}>
          <Button
            variant="contained"
            disabled={disabledButton}
            className={classes.button}
            onClick={() => {
              addUserType();
            }}
          >
            Save
          </Button>
        </Grid>
      </Grid>
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
    </Card>
  );
}
