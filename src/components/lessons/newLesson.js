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
  Snackbar,
  Tooltip
} from "@material-ui/core";
import { ArrowBack as ArrowBackIcon } from "@material-ui/icons";
import { useSubscription, useMutation } from "@apollo/react-hooks";
import { GET_COACHES } from "../../database/queries";
import { ADD_CLASS } from "../../database/mutations";
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

export default function NewLesson() {
  const classes = useStyles();
  const [classState, setClassState] = useState({
    name: "",
    description: "",
    coach: 0
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
    addClassMutation,
    { loading: classLoading, error: classError }
  ] = useMutation(ADD_CLASS);
  const {
    data: coachesData,
    loading: coachesLoading,
    error: coachesError
  } = useSubscription(GET_COACHES);
  if (coachesLoading) {
    return <CircularProgress />;
  }
  if (coachesError) {
    return <NotFound />;
  }

  const getCoaches = () => {
    return coachesData.users_data.map(coach => {
      return (
        <option
          key={coach.id}
          value={coach.id}
        >{`${coach.first_name} ${coach.last_name}`}</option>
      );
    });
  };

  const addClass = () => {
    setDisabledButton(true);
    const { name, description, coach } = classState;

    if (name.trim() === "" || description.trim() === "" || coach === 0) {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "Todos los campos son obligatorios",
        snackbarColor: "#d32f2f"
      });
      setDisabledButton(false);
      return;
    }

    addClassMutation({
      variables: {
        name: name.trim(),
        description: description.trim(),
        idCoach: coach
      }
    });

    if (classLoading) return <CircularProgress />;
    if (classError) {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "Ha ocurrido un error",
        snackbarColor: "#d32f2f"
      });
      setDisabledButton(false);
      return;
    }

    setClassState({
      name: "",
      description: "",
      coach: 0
    });

    setSnackbarState({
      ...snackbarState,
      openSnackbar: true,
      snackBarText: "Clase agregada",
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
          Agregar clase
          <Tooltip title="Regresar">
          <Link to="/lessons">
            <ArrowBackIcon />
          </Link>
          </Tooltip>
        </Typography>
      </Toolbar>
      <Grid container justify="center" className={classes.root}>
        <Grid item md={5} xs={10}>
          <TextField
            className={classes.textFields}
            required
            id="name"
            label="Nombre"
            margin="normal"
            value={classState.name}
            inputProps={{
              maxLength: 50
            }}
            onKeyPress={e => {
              keyValidation(e,6);
            }}
            onChange={e => {
              pasteValidation(e,6);
              setClassState({
                ...classState,
                name: e.target.value
              });
            }}
          />
        </Grid>
        <Grid item md={1}></Grid>
        <Grid item md={5} xs={10}>
          <TextField
            className={classes.textFields}
            required
            id="description"
            label="Descripción"
            margin="normal"
            value={classState.description}
            inputProps={{
              maxLength: 200
            }}
            onKeyPress={e => {
              keyValidation(e,6);
            }}
            onChange={e => {
              pasteValidation(e,6);
              setClassState({
                ...classState,
                description: e.target.value
              });
            }}
          />
        </Grid>
        <Grid item md={5} xs={10}>
          <TextField
            className={classes.textFields}
            required
            select
            SelectProps={{
              native: true
            }}
            id="coach"
            label="Coach"
            margin="normal"
            value={classState.coach}
            onChange={e => {
              setClassState({
                ...classState,
                coach: e.target.value
              });
            }}
          >
            <option value="0">Selecciona un coach</option>
            {getCoaches()}
          </TextField>
        </Grid>
        <Grid item xs={10} md={11}>
          <Button
            variant="contained"
            disabled={disabledButton}
            className={classes.button}
            onClick={() => {
              addClass();
            }}
          >
            Guardar
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
