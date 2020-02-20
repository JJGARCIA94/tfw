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
import { GET_USER_TYPE_BY_ID } from "../../database/queries";
import { UPDATE_USER_TYPE } from "../../database/mutations";
import { keyValidation, pasteValidation } from "../../helpers/helpers";
import NotFound from "../notFound/notFound";

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

export default function UserType(props) {
  const userTypeId = props.match.params.userTypeId;
  const classes = useStyles();
  const [userTypeState, setUserTypeState] = useState({
    name: "",
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
    updateUserTypeMutation,
    { loading: userTypeMutationLoading, error: userTypeMutationError }
  ] = useMutation(UPDATE_USER_TYPE);
  const {
    data: userTypeData,
    loading: userTypeLoading,
    error: userTypeError
  } = useSubscription(GET_USER_TYPE_BY_ID, {
    variables: {
      userTypeId: userTypeId
    }
  });

  if (userTypeLoading) {
    return <CircularProgress />;
  }
  if (userTypeError || userTypeData.users_type.length === 0 || userTypeId === "1") {
    return <NotFound />;
  }

  const getData = userTypeData => {
    const createAt = new Date(userTypeData.created_at);
    const updated_at = new Date(userTypeData.updated_at);
    setUserTypeState({
      name: userTypeData.name,
      created_at: createAt.toLocaleString(),
      updated_at: updated_at.toLocaleString()
    });
  };

  const updateUserType = async () => {
    setDisabledButton(true);
    const { name } = userTypeState;

    if (name.trim() === "") {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "Todos los campos son requeridos",
        snackbarColor: "#d32f2f"
      });
      setDisabledButton(false);
      return;
    }

    const resultUpdateUserType = await updateUserTypeMutation({
      variables: {
        userTypeId: userTypeId,
        name: name.trim()
      }
    });

    if (userTypeMutationLoading) return <CircularProgress />;
    if (userTypeMutationError) {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "Ha ocurrido un error",
        snackbarColor: "#d32f2f"
      });
      setDisabledButton(false);
      return;
    }

    const newUserTypeData = resultUpdateUserType.data.update_users_type.returning[0];
    getData(newUserTypeData);

    setSnackbarState({
      ...snackbarState,
      openSnackbar: true,
      snackBarText: "Tipo de usuario actualizado",
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
          Información de tipo de usuario
          <Tooltip title="Regresar">
          <Link to="/userTypes">
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
            value={userTypeState.created_at}
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
            value={userTypeState.updated_at}
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
                ...userTypeState,
                name: e.target.value
              });
            }}
            onAnimationEnd={() => {
              getData(userTypeData.users_type[0]);
            }}
          />
        </Grid>
        <Grid item xs={10} md={11}>
          <Button
            variant="contained"
            disabled={disabledButton}
            className={classes.button}
            onClick={() => {
              updateUserType();
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
