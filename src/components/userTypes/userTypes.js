import React, { useState, useEffect } from "react";
import { Link, Redirect } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Toolbar,
  Grid,
  Typography,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Tooltip
} from "@material-ui/core";
import {
  AddCircle as AddCircleIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreFromTrashIcon
} from "@material-ui/icons";
import { useQuery, useSubscription, useMutation } from "@apollo/react-hooks";
import {
  GET_USER_TYPES_ALL,
  GET_USER_BY_USER_TYPE,
  GET_USER_BY_ID_AUTH
} from "../../database/queries";
import { UPDATE_USER_TYPE_STATUS } from "../../database/mutations";
import NotFound from "../notFound/notFound";
const jwt = require("jsonwebtoken");

const useStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  title: {
    marginTop: theme.spacing(1)
  },
  icons: {
    color: "black"
  }
}));

export default function UserTypes(props) {
  const classes = useStyles();
  const [dialog, setDialog] = useState({
    openDialog: false,
    tittleDialog: "",
    textDialog: "",
    idDialog: 0,
    statusDialog: 0
  });
  const [snackbarState, setSnackbarState] = useState({
    openSnackBar: false,
    vertical: "bottom",
    horizontal: "right",
    snackbarText: "",
    snackbarColor: ""
  });
  const {
    openDialog,
    tittleDialog,
    textDialog,
    idDialog,
    statusDialog
  } = dialog;
  const {
    vertical,
    horizontal,
    openSnackBar,
    snackbarText,
    snackbarColor
  } = snackbarState;
  const {
    data: userTypesData,
    loading: userTypesLoading,
    error: userTypesError
  } = useSubscription(GET_USER_TYPES_ALL);
  const {
    data: userData,
    loading: userLoading,
    error: userError
  } = useSubscription(GET_USER_BY_USER_TYPE, {
    variables: {
      userTypeId: idDialog
    }
  });
  const [
    updateUserTypeStatusMutation,
    { loading: updateUserTypeStatusLoading, error: updateUserTypeStatusError }
  ] = useMutation(UPDATE_USER_TYPE_STATUS);
  const setUserAuthHeader = props.setUserAuth;
  const [userAuth, setUserAuth] = useState(true);
  const [userIdAuth, setUserIdAuth] = useState(0);
  const {
    data: userAuthData, error: userAuthError
  } = useQuery(GET_USER_BY_ID_AUTH, {
    variables: {
      id: userIdAuth
    },
    onCompleted: () => {
      if (userAuthData.users.length === 0 && userIdAuth !== 0) {
        localStorage.removeItem("token");
        setUserAuth(false);
        setUserAuthHeader(false);
      }
    }
  });

  useEffect(() => {
    function isUserAuth() {
      try {
        if (localStorage.getItem("token")) {
          const decodedToken = jwt.verify(
            localStorage.getItem("token"),
            "mysecretpassword"
          );
          setUserIdAuth(decodedToken.id);
        } else {
          setUserAuth(false);
          setUserAuthHeader(false);
        }
      } catch (err) {
        localStorage.removeItem("token");
        setUserAuth(false);
        setUserAuthHeader(false);
      }
    }

    isUserAuth();
  });

  if (userLoading || userTypesLoading) {
    return <CircularProgress />;
  }
  if (userError || userTypesError || userAuthError) {
    return <NotFound />;
  }

  const handleOpenDialog = (idTipoUsuario, newStatus) => {
    setDialog({
      openDialog: true,
      tittleDialog:
        newStatus === 0
          ? "¿Quieres eliminar este tipo de usuario?"
          : "¿Quieres restaurar este tipo de usuario?",
      textDialog:
        newStatus === 0
          ? "Una vez eliminado, este tipo de usuario no estará disponible para seleccionar al crear o actualizar un usuario."
          : "Una vez restaurado, este tipo de usuario estará disponible para seleccionar al crear o actualizar un usuario.",
      idDialog: idTipoUsuario,
      statusDialog: newStatus
    });
  };

  const handleCloseDialog = agree => {
    if (agree) {
      if (
        userData.users_data_aggregate.aggregate.count > 0 &&
        statusDialog === 0
      ) {
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText:
            "No se puede eliminar porque hay usuarios con este tipo de usuario.",
          snackbarColor: "#d32f2f"
        });
        return;
      } else {
        updateUserTypeStatusMutation({
          variables: {
            id: idDialog,
            newStatus: statusDialog
          }
        });
        if (updateUserTypeStatusLoading) return <CircularProgress />;
        if (updateUserTypeStatusError) {
          setSnackbarState({
            ...snackbarState,
            openSnackBar: true,
            snackbarText: "Ha ocurrido un error",
            snackbarColor: "#d32f2f"
          });
          return;
        }
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText:
            statusDialog === 1 ? "Tipo de usuario restaurado" : "Tipo de usuario eliminado",
          snackbarColor: "#43a047"
        });
      }
    }
    setDialog({
      openDialog: false,
      tittleDialog: "",
      textDialog: "",
      idDialog: 0,
      statusDialog: 0
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarState({
      ...snackbarState,
      openSnackBar: false,
      snackbarText: "",
      snackbarColor: ""
    });
  };

  return ( userAuth ?
    <TableContainer component={Paper} className={classes.root}>
      <Toolbar>
        <Grid container>
          <Grid item md={8} xs={12}>
            <Typography variant="h6" id="tableTitle">
              Tipos de usuario
              <Tooltip title="Agregar tipo de usuario">
              <Link to="/newUserType">
                <AddCircleIcon />
              </Link>
              </Tooltip>
            </Typography>
          </Grid>
        </Grid>
      </Toolbar>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {userTypesData.users_type.map(row =>
            row.id !== 1 ? (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Ver información">
                  <Link to={"/userType/" + row.id}>
                    <IconButton>
                      <VisibilityIcon className={classes.icons} />
                    </IconButton>
                  </Link>
                  </Tooltip>
                  <Tooltip title={
                      row.status === 1
                        ? "Eliminar tipo de usuario"
                        : "Restaurar tipo de usuario"
                    }>
                  <IconButton
                    onClick={() => {
                      const newStatus = row.status === 1 ? 0 : 1;
                      handleOpenDialog(row.id, newStatus);
                    }}
                  >
                    {row.status === 1 ? (
                      <DeleteIcon className={classes.icons} />
                    ) : (
                      <RestoreFromTrashIcon className={classes.icons} />
                    )}
                  </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ) : null
          )}
        </TableBody>
      </Table>
      <Dialog
        open={openDialog}
        onClose={() => {
          handleCloseDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{tittleDialog}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {textDialog}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseDialog(false);
            }}
            color="primary"
          >
            No
          </Button>
          <Button
            onClick={() => {
              handleCloseDialog(true);
            }}
            color="primary"
            autoFocus
          >
            Sí
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        key={`${vertical},${horizontal}`}
        open={openSnackBar}
        onClose={handleCloseSnackbar}
        ContentProps={{
          "aria-describedby": "message-id",
          style: { background: snackbarColor }
        }}
        message={<span id="message-id">{snackbarText}</span>}
      />
    </TableContainer> : <Redirect to="/login" />
  );
}
