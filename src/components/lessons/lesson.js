import React, { useState, useEffect } from "react";
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
  Tooltip,
} from "@material-ui/core";
import { ArrowBack as ArrowBackIcon } from "@material-ui/icons";
import { useSubscription, useMutation } from "@apollo/react-hooks";
import { GET_COACHES, GET_CLASS } from "../../database/queries";
import { UPDATE_CLASS } from "../../database/mutations";
import NotFound from "../notFound/notFound";
import { keyValidation, pasteValidation } from "../../helpers/helpers";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(3),
  },
  root: {
    padding: theme.spacing(3, 2),
  },
  textFields: {
    width: "100%",
  },
  button: {
    float: "right",
    margin: theme.spacing(2, 0),
    backgroundColor: "#ffc605",
    "&:hover": {
      backgroundColor: "#ffff00",
    },
  },
}));

export default function Lesson(props) {
  const classId = props.match.params.classId;
  const classes = useStyles();
  const [classState, setClassState] = useState({
    name: "",
    description: "",
    coach: 0,
    created_at: "",
    updated_at: "",
  });
  const [disabledButton, setDisabledButton] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    openSnackbar: false,
    vertical: "bottom",
    horizontal: "right",
    snackBarText: "",
    snackbarColor: "",
  });
  const {
    vertical,
    horizontal,
    openSnackbar,
    snackBarText,
    snackbarColor,
  } = snackbarState;
  const [
    updateClassMutation,
    { loading: classMutationLoading, error: classMutationError },
  ] = useMutation(UPDATE_CLASS);
  const {
    data: classData,
    loading: classLoading,
    error: classError,
  } = useSubscription(GET_CLASS, {
    variables: {
      classId: classId,
    },
  });
  const {
    data: coachesData,
    loading: coachesLoading,
    error: coachesError,
  } = useSubscription(GET_COACHES);

  useEffect(() => {
    if (classData && classData.classes.length) {
      console.log(classData);
      const createAt = new Date(classData.classes[0].created_at);
      const updated_at = new Date(classData.classes[0].updated_at);
      setClassState({
        name: classData.classes[0].name,
        description: classData.classes[0].description,
        coach:
          classData.classes[0].R_users_data.status !== 0
            ? classData.classes[0].R_users_data.id
            : "0",
        created_at: createAt.toLocaleString(),
        updated_at: updated_at.toLocaleString(),
      });
    }
  }, [classData]);

  if (classLoading || coachesLoading) {
    return <CircularProgress />;
  }
  if (classError || coachesError || classData.classes.length === 0) {
    return <NotFound />;
  }

  /* const getData = classData => {
    const createAt = new Date(classData.created_at);
    const updated_at = new Date(classData.updated_at);
    setClassState({
      name: classData.name,
      description: classData.description,
      coach: classData.R_users_data.status !== 0 ? classData.R_users_data.id : 0,
      created_at: createAt.toLocaleString(),
      updated_at: updated_at.toLocaleString()
    });
  }; */

  const getCoaches = () => {
    return coachesData.users_data.map((coach) => {
      return (
        <option
          key={coach.id}
          value={coach.id}
        >{`${coach.first_name} ${coach.last_name}`}</option>
      );
    });
  };

  const updateClass = async () => {
    setDisabledButton(true);
    const { name, description, coach } = classState;

    if (name.trim() === "" || description.trim() === "" || coach === "0") {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "Todos los campos son obligatorios",
        snackbarColor: "#d32f2f",
      });
      setDisabledButton(false);
      return;
    }

    await updateClassMutation({
      variables: {
        classId: classId,
        name: name.trim(),
        description: description.trim(),
        idCoach: coach,
      },
    });

    if (classMutationLoading) return <CircularProgress />;
    if (classMutationError) {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "Ha ocurrido un error",
        snackbarColor: "#d32f2f",
      });
      setDisabledButton(false);
      return;
    }

    /* const newClassData = resultUpdateClass.data.update_classes.returning[0];
    getData(newClassData); */

    setSnackbarState({
      ...snackbarState,
      openSnackbar: true,
      snackBarText: "Clase actualizada",
      snackbarColor: "#43a047",
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
          Información de la clase
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
            id="create_at"
            label="Fecha de creación"
            margin="normal"
            value={classState.created_at}
            disabled
          />
        </Grid>
        <Grid item md={1}></Grid>
        <Grid item md={5} xs={10}>
          <TextField
            className={classes.textFields}
            id="updated_at"
            label="Última actualización"
            margin="normal"
            value={classState.updated_at}
            disabled
          />
        </Grid>
        <Grid item md={5} xs={10}>
          <TextField
            className={classes.textFields}
            required
            id="name"
            label="Nombre"
            margin="normal"
            value={classState.name}
            inputProps={{
              maxLength: 50,
            }}
            onKeyPress={(e) => {
              keyValidation(e, 6);
            }}
            onChange={(e) => {
              pasteValidation(e, 6);
              setClassState({
                ...classState,
                name: e.target.value,
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
              maxLength: 200,
            }}
            onKeyPress={(e) => {
              keyValidation(e, 6);
            }}
            onChange={(e) => {
              pasteValidation(e, 6);
              setClassState({
                ...classState,
                description: e.target.value,
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
              native: true,
            }}
            id="coach"
            label="Coach"
            margin="normal"
            value={classState.coach}
            /* onAnimationEnd={() => {
              getData(classData.classes[0]);
            }} */
            onChange={(e) => {
              setClassState({
                ...classState,
                coach: e.target.value,
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
              updateClass();
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
          style: { background: snackbarColor },
        }}
        message={<span id="message-id">{snackBarText}</span>}
      />
    </Card>
  );
}
