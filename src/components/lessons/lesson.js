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
import { useQuery, useSubscription, useMutation } from "@apollo/react-hooks";
import { GET_COACHES, GET_CLASS } from "../../database/queries";
import { UPDATE_CLASS } from "../../database/mutations";
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

export default function Lesson(props) {
  const classId = props.match.params.classId;
  const classes = useStyles();
  const [classState, setClassState] = useState({
    name: "",
    description: "",
    coach: 0,
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
  const [
    updateClassMutation,
    { loading: classMutationLoading, error: classMutationError }
  ] = useMutation(UPDATE_CLASS);
  const {
    data: classData,
    loading: classLoading,
    error: classError
  } = useQuery(GET_CLASS, {
    variables: {
      classId: classId
    }
  });
  const {
    data: coachesData,
    loading: coachesLoading,
    error: coachesError
  } = useSubscription(GET_COACHES);
  if (classLoading || coachesLoading) {
    return <CircularProgress />;
  }
  if (classError || coachesError || classData.classes.length === 0) {
    return <NotFound />;
  }

  const getData = classData => {
    const createAt = new Date(classData.created_at);
    const updated_at = new Date(classData.updated_at);
    setClassState({
      name: classData.name,
      description: classData.description,
      coach: classData.R_users_data.id,
      created_at: createAt.toLocaleString(),
      updated_at: updated_at.toLocaleString()
    });
  };

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

  const updateClass = async () => {
    setDisabledButton(true);
    const { name, description, coach } = classState;

    if (name.trim() === "" || description.trim() === "" || coach === 0) {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "All fields are requireds",
        snackbarColor: "#d32f2f"
      });
      setDisabledButton(false);
      return;
    }

    const resultUpdateClass = await updateClassMutation({
      variables: {
        classId: classId,
        name: name.trim(),
        description: description.trim(),
        idCoach: coach
      }
    });

    if (classMutationLoading) return <CircularProgress />;
    if (classMutationError) {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "An error occurred",
        snackbarColor: "#d32f2f"
      });
      setDisabledButton(false);
      return;
    }

    const newClassData = resultUpdateClass.data.update_classes.returning[0];
    getData(newClassData);

    setSnackbarState({
      ...snackbarState,
      openSnackbar: true,
      snackBarText: "Class updated",
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
          Class information
          <Link to="/lessons">
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
            value={classState.created_at}
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
            value={classState.updated_at}
            disabled
          />
        </Grid>
        <Grid item md={5} xs={10}>
          <TextField
            className={classes.textFields}
            required
            id="name"
            label="Name"
            margin="normal"
            value={classState.name}
            inputProps={{
              maxLength: 50
            }}
            onKeyPress={e => {
              keyValidation(e, 6);
            }}
            onChange={e => {
              pasteValidation(e, 6);
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
            label="Description"
            margin="normal"
            value={classState.description}
            inputProps={{
              maxLength: 200
            }}
            onKeyPress={e => {
              keyValidation(e, 6);
            }}
            onChange={e => {
              pasteValidation(e, 6);
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
            onAnimationEnd={() => {
              getData(classData.classes[0]);
            }}
            onChange={e => {
              setClassState({
                ...classState,
                coach: e.target.value
              });
            }}
          >
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
