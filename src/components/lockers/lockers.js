import React, { useState, useEffect } from "react";
import { Link, Redirect } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Snackbar,
  Divider,
  Tooltip
} from "@material-ui/core";
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Restore as RestoreIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon
} from "@material-ui/icons";
import { useQuery, useSubscription, useMutation } from "@apollo/react-hooks";
import {
  GET_LOCKERS_ALL,
  GET_LOCKER_HISTORY,
  GET_LOCKERS_SETTINGS,
  GET_USER_BY_ID_AUTH
} from "../../database/queries";
import {
  DELETE_LOCKET_BY_ID,
  RESTORE_LOCKET_BY_ID,
  ADD_LOCKER,
  UPDATE_LOCKER,
  ADD_LOCKERS_SETTINGS,
  UPDATE_LOCKERS_SETTINGS
} from "../../database/mutations";
import { keyValidation, pasteValidation } from "../../helpers/helpers";
import NotFound from "../notFound/notFound";
const jwt = require("jsonwebtoken");

const useStyles = makeStyles(theme => ({
  cards: {
    margin: "10px",
    height: "250px",
    overflowY: "auto",
    overflowX: "auto"
  },
  cardAdd: {
    padding: theme.spacing(5, 1),
    margin: "10px",
    textAlign: "center",
    height: "250px"
  },
  cardTittle: {
    textAlign: "left"
  },
  cardContent: {
    textAlign: "justify"
  },
  typografyActions: {
    background: "#ebebeb",
    marginBottom: "10px",
    textAlign: "end"
  },
  addIcon: {
    color: "#1976D2",
    fontSize: 100
  },
  editIcon: {
    color: "#FFC605"
  },
  cancelIcon: {
    color: "#D32F2F"
  },
  restoreIcon: {
    color: "#43A047"
  },
  personIcon: {
    color: "#1976D2"
  },
  scheduleIcon: {
    color: "#C2185B"
  },
  textFields: {
    width: "100%"
  }
}));

const formatDate = date => {
  date = new Date(date);
  let correctMont =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  let correctDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${correctDay}/${correctMont}/${date.getFullYear()}`;
};

export default function Lockers(props) {
  const classes = useStyles();
  const [lockersPriceState, setLockersPriceState] = useState("");
  const [snackbarState, setSnackbarState] = useState({
    openSnackBar: false,
    vertical: "bottom",
    horizontal: "right",
    snackbarText: "",
    snackbarColor: ""
  });
  const {
    vertical,
    horizontal,
    openSnackBar,
    snackbarText,
    snackbarColor
  } = snackbarState;
  const [dialogLockerPriceState, setDialogLockerPriceState] = useState({
    openDialogLockerPrice: false,
    tittleDialogLockerPrice: "",
    lastUpdateDialogLockerPrice: ""
  });
  const {
    openDialogLockerPrice,
    tittleDialogLockerPrice,
    lastUpdateDialogLockerPrice
  } = dialogLockerPriceState;
  const [dialogState, setDialogState] = useState({
    openDialog: false,
    tittleDialog: "",
    textDialog: "",
    idDialog: 0,
    idDetailDialog: 0,
    statusDialog: 0
  });
  const [dialogHistoryState, setDialogHistoryState] = useState({
    openDialogHistory: false,
    tittleDialogHistory: "",
    lockerIdDialogHistory: 0
  });
  const [dialogAddLockerState, setDialogAddLockerState] = useState({
    openDialogAddLocker: false,
    tittleDialogAddLocker: ""
  });
  const [newLockerNumberState, setNewLockerNumberState] = useState("");
  const [updateLockerNumberState, setUpdateLockerNumberState] = useState("");
  const [dialogUpdateLockerState, setDialogUpdateLockerState] = useState({
    openDialogUpdateLocker: false,
    tittleDialogUpdateLocker: "",
    lockerIdUpdateLocker: 0,
    lockerNumberUpdateLocker: 0,
    createAtUpdateLocker: "",
    updateAtUpdateLocker: ""
  });
  const {
    openDialog,
    tittleDialog,
    textDialog,
    idDialog,
    idDetailDialog,
    statusDialog
  } = dialogState;
  const {
    openDialogHistory,
    tittleDialogHistory,
    lockerIdDialogHistory
  } = dialogHistoryState;
  const { openDialogAddLocker, tittleDialogAddLocker } = dialogAddLockerState;
  const {
    openDialogUpdateLocker,
    tittleDialogUpdateLocker,
    lockerIdUpdateLocker,
    lockerNumberUpdateLocker,
    createAtUpdateLocker,
    updateAtUpdateLocker
  } = dialogUpdateLockerState;
  const {
    data: lockersSettingsData,
    loading: lockersSettingsLoading,
    error: lockersSettingsError
  } = useSubscription(GET_LOCKERS_SETTINGS);
  const {
    data: lockersData,
    loading: lockersLoading,
    error: lockersError
  } = useSubscription(GET_LOCKERS_ALL);
  const {
    data: lockerHistoryData,
    loading: lockerHistoryLoading,
    error: lockerHistoryError
  } = useSubscription(GET_LOCKER_HISTORY, {
    variables: {
      lockerId: lockerIdDialogHistory
    }
  });
  const [
    addLockersSettingsMutation,
    {
      loading: addLockersSettingsMutationLoading,
      error: addLockersSettingsMutationError
    }
  ] = useMutation(ADD_LOCKERS_SETTINGS);
  const [
    updateLockersSettingsMutation,
    {
      loading: updateLockersSettingsMutationLoading,
      error: updateLockersSettingsMutationError
    }
  ] = useMutation(UPDATE_LOCKERS_SETTINGS);
  const [
    updateLockerStatusMutation,
    { loading: updateLockerStatusLoading, error: updateLockerStatusError }
  ] = useMutation(
    statusDialog === 0 ? DELETE_LOCKET_BY_ID : RESTORE_LOCKET_BY_ID
  );
  const [
    addLockerMutation,
    { loading: addLockerMutationLoading, error: addLockerMutationError }
  ] = useMutation(ADD_LOCKER);
  const [
    updateLockerMutation,
    { loading: updateLockerMutationLoading, error: updateLockerMutationError }
  ] = useMutation(UPDATE_LOCKER);
  const setUserAuthHeader = props.setUserAuth;
  const [userAuth, setUserAuth] = useState(true);
  const [userIdAuth, setUserIdAuth] = useState(0);
  const { data: userAuthData, error: userAuthError } = useQuery(
    GET_USER_BY_ID_AUTH,
    {
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
    }
  );

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
  if (lockersSettingsLoading || lockersLoading || lockerHistoryLoading) {
    return <CircularProgress />;
  }
  if (lockersSettingsError || lockersError || lockerHistoryError || userAuthError) {
    return <NotFound />;
  }

  const getLockers = () => {
    return lockersData.lockers.map(locker => {
      return (
        <Grid item xs={12} md={6} lg={4} key={locker.id}>
          <Card className={classes.cards}>
            <CardContent>
              <Typography className={classes.typografyActions}>
                <Tooltip title="Ver historial de usuarios">
                <IconButton
                  onClick={() => {
                    handleOpenDialogHistory(locker.id);
                  }}
                >
                  <ScheduleIcon className={classes.scheduleIcon} />
                </IconButton>
                </Tooltip>
                <Tooltip title="Ver o asignar usuario">
                <Link to={`/selectUserToLocker/${locker.id}`}>
                  <IconButton>
                    <PersonIcon className={classes.personIcon} />
                  </IconButton>
                </Link>
                </Tooltip>
                <Tooltip title="Ver información del casillero">
                <IconButton
                  onClick={() => {
                    handleOpenDialogUpdateLocker(
                      locker.id,
                      locker.number,
                      locker.created_at,
                      locker.updated_at
                    );
                  }}
                >
                  <EditIcon className={classes.editIcon} />
                </IconButton>
                </Tooltip>
                <Tooltip title={
                    locker.status === 1
                      ? "Eliminar casillero"
                      : "Restaurar casillero"
                  }>
                <IconButton
                  onClick={() => {
                    const newStatus = locker.status === 1 ? 0 : 1;
                    handleOpenDialog(
                      locker.id,
                      newStatus,
                      locker.R_lockers_details.length !== 0
                        ? locker.R_lockers_details[0].id
                        : 0
                    );
                  }}
                >
                  {locker.status === 1 ? (
                    <CloseIcon className={classes.cancelIcon} />
                  ) : (
                    <RestoreIcon className={classes.restoreIcon} />
                  )}
                </IconButton>
                </Tooltip>
              </Typography>
              <Typography variant="h4">{locker.number}</Typography>
              {locker.status === 1 ? (
                <Typography variant="subtitle1">
                  {locker.R_lockers_details.length === 0 ? (
                    "Casillero disponible"
                  ) : (
                    <div>
                      <span>Casillero ocupado por </span>
                      <strong>{`${locker.R_lockers_details[0].R_users_data.first_name} ${locker.R_lockers_details[0].R_users_data.last_name}`}</strong>
                    </div>
                  )}
                </Typography>
              ) : (
                <Typography variant="subtitle1">
                  Casillero no disponible
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      );
    });
  };

  const handleOpenDialogLockersPrice = () => {
    const updateAt =
      lockersSettingsData.lockers_settings.length !== 0
        ? new Date(lockersSettingsData.lockers_settings[0].updated_at)
        : "";
    setDialogLockerPriceState({
      openDialogLockerPrice: true,
      tittleDialogLockerPrice: "Detalles de casilleros",
      lastUpdateDialogLockerPrice: updateAt.toLocaleString()
    });
    setLockersPriceState(
      lockersSettingsData.lockers_settings.length !== 0
        ? lockersSettingsData.lockers_settings[0].price
        : ""
    );
  };

  const handleOpenDialog = (lockerId, newStatus, lockerDetailId) => {
    setDialogState({
      openDialog: true,
      tittleDialog:
        newStatus === 0
          ? "¿Quieres eliminar este casillero?"
          : "¿Quieres restaurar este casillero?",
      textDialog:
        newStatus === 0
          ? "Una vez eliminado no podrá ser asignado a usuarios."
          : "Una vez restaurado podrá ser asignado a usuarios.",
      idDialog: lockerId,
      idDetailDialog: lockerDetailId,
      statusDialog: newStatus
    });
  };

  const handleOpenDialogHistory = lockerId => {
    setDialogHistoryState({
      openDialogHistory: true,
      tittleDialogHistory: "Historial de usuarios",
      lockerIdDialogHistory: lockerId
    });
  };

  const handleOpenDialogAddLocker = () => {
    setDialogAddLockerState({
      openDialogAddLocker: true,
      tittleDialogAddLocker: "Agregar casillero"
    });
  };

  const handleOpenDialogUpdateLocker = (
    lockerId,
    lockerNumber,
    createAt,
    updateAt
  ) => {
    createAt = new Date(createAt);
    updateAt = new Date(updateAt);
    setDialogUpdateLockerState({
      openDialogUpdateLocker: true,
      tittleDialogUpdateLocker: "Editar casillero",
      lockerIdUpdateLocker: lockerId,
      lockerNumberUpdateLocker: lockerNumber,
      createAtUpdateLocker: createAt.toLocaleString(),
      updateAtUpdateLocker: updateAt.toLocaleString()
    });
    setUpdateLockerNumberState(lockerNumber);
  };

  const handleCloseDialogLockerPrice = agree => {
    if (agree) {
      if (lockersPriceState === "") {
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText: "Agrega un precio",
          snackbarColor: "#d32f2f"
        });
        return;
      } else {
        if (lockersSettingsData.lockers_settings.length !== 0) {
          updateLockersSettingsMutation({
            variables: {
              lockersSettingsId: lockersSettingsData.lockers_settings[0].id,
              price: parseInt(lockersPriceState)
            }
          });
          if (updateLockersSettingsMutationLoading) return <CircularProgress />;
          if (updateLockersSettingsMutationError) {
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
            snackbarText: "Precio de casilleros actualizado",
            snackbarColor: "#43a047"
          });
        } else {
          addLockersSettingsMutation({
            variables: {
              price: parseInt(lockersPriceState)
            }
          });
          if (addLockersSettingsMutationLoading) return <CircularProgress />;
          if (addLockersSettingsMutationError) {
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
            snackbarText: "Precio de casilleros agregado",
            snackbarColor: "#43a047"
          });
        }
      }
    }
    setDialogLockerPriceState({
      openDialogLockerPrice: false,
      tittleDialogLockerPrice: "",
      lastUpdateDialogLockerPrice: ""
    });
  };

  const handleCloseDialog = agree => {
    if (agree) {
      updateLockerStatusMutation({
        variables:
          statusDialog === 0
            ? {
                lockerId: idDialog,
                lockerDetailId: idDetailDialog
              }
            : {
                lockerId: idDialog
              }
      });
      if (updateLockerStatusLoading) return <CircularProgress />;
      if (updateLockerStatusError) {
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
          statusDialog === 1 ? "Casillero restaurado" : "Casillero eliminado",
        snackbarColor: "#43a047"
      });
    }
    setDialogState({
      openDialog: false,
      tittleDialog: "",
      textDialog: "",
      idDialog: 0,
      idDetailDialog: 0,
      statusDialog: 0
    });
  };

  const handleCloseDialogHistory = () => {
    setDialogHistoryState({
      openDialogHistory: false,
      tittleDialogHistory: "",
      lockerIdDialogHistory: 0
    });
  };

  const handleCloseDialogAddLocker = agree => {
    if (agree) {
      if (newLockerNumberState.trim() === "") {
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText: "Ingresa un número de casillero",
          snackbarColor: "#d32f2f"
        });
        return;
      } else {
        let numberValidation = 0;
        for (let x = 0; x < lockersData.lockers.length; x++) {
          if (
            lockersData.lockers[x].number === parseInt(newLockerNumberState)
          ) {
            numberValidation++;
            break;
          }
        }
        if (numberValidation > 0) {
          setSnackbarState({
            ...snackbarState,
            openSnackBar: true,
            snackbarText: "Ese número casillero ya existe",
            snackbarColor: "#d32f2f"
          });
          return;
        } else {
          addLockerMutation({
            variables: {
              number: parseInt(newLockerNumberState)
            }
          });
          if (addLockerMutationLoading) return <CircularProgress />;
          if (addLockerMutationError) {
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
            snackbarText: "Casillero agregado",
            snackbarColor: "#43a047"
          });
        }
      }
    }
    setDialogAddLockerState({
      openDialogAddLocker: false,
      tittleDialogAddLocker: ""
    });
    setNewLockerNumberState("");
  };

  const handleCloseDialogUpdateLocker = agree => {
    if (agree) {
      if (updateLockerNumberState === "") {
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText: "Ingresa un número de casillero",
          snackbarColor: "#d32f2f"
        });
        return;
      } else {
        let numberValidation = 0;
        for (let x = 0; x < lockersData.lockers.length; x++) {
          if (
            lockersData.lockers[x].number ===
              parseInt(updateLockerNumberState) &&
            parseInt(updateLockerNumberState) !== lockerNumberUpdateLocker
          ) {
            numberValidation++;
            break;
          }
        }
        if (numberValidation > 0) {
          setSnackbarState({
            ...snackbarState,
            openSnackBar: true,
            snackbarText: "Ese número casillero ya existe",
            snackbarColor: "#d32f2f"
          });
          return;
        } else {
          updateLockerMutation({
            variables: {
              lockerId: lockerIdUpdateLocker,
              number: parseInt(updateLockerNumberState)
            }
          });
          if (updateLockerMutationLoading) return <CircularProgress />;
          if (updateLockerMutationError) {
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
            snackbarText: "Casillero editado",
            snackbarColor: "#43a047"
          });
        }
      }
    }
    setDialogUpdateLockerState({
      openDialogUpdateLocker: false,
      tittleDialogUpdateLocker: "",
      lockerIdUpdateLocker: 0,
      lockerNumberUpdateLocker: 0,
      createAtUpdateLocker: "",
      updateAtUpdateLocker: ""
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
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h6">
          Casilleros
          <Tooltip title="Ver detalles">
          <IconButton
            onClick={() => {
              handleOpenDialogLockersPrice();
            }}
          >
            <SettingsIcon />
          </IconButton>
          </Tooltip>
        </Typography>
        <Divider />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Card className={classes.cardAdd}>
          <CardContent>
            <Tooltip title="Agregar casillero">
            <IconButton
              onClick={() => {
                handleOpenDialogAddLocker();
              }}
            >
              <AddCircleOutlineIcon className={classes.addIcon} />
            </IconButton>
            </Tooltip>
          </CardContent>
        </Card>
      </Grid>
      {getLockers()}
      <Dialog
        open={openDialogLockerPrice}
        onClose={() => {
          handleCloseDialogLockerPrice(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {tittleDialogLockerPrice}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container>
            <Grid item xs={12}>
              <TextField
                className={classes.textFields}
                disabled
                id="last_update"
                label="Última actualización"
                margin="normal"
                value={lastUpdateDialogLockerPrice}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                className={classes.textFields}
                required
                id="price"
                label="Precio por casillero"
                margin="normal"
                value={lockersPriceState}
                inputProps={{
                  maxLength: 4
                }}
                onKeyPress={e => {
                  keyValidation(e, 2);
                }}
                onChange={e => {
                  pasteValidation(e, 2);
                  setLockersPriceState(e.target.value);
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseDialogLockerPrice(true);
            }}
            color="primary"
            autoFocus
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
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
            Si
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDialogHistory}
        onClose={() => {
          handleCloseDialogHistory(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{tittleDialogHistory}</DialogTitle>
        <DialogContent dividers>
          {lockerHistoryData.lockers_details.length > 0 ? (
            lockerHistoryData.lockers_details.map((lockerHistory, index) => (
              <Typography key={index} variant="subtitle1">
                {`${lockerHistory.R_users_data.first_name} ${
                  lockerHistory.R_users_data.last_name
                } (${formatDate(lockerHistory.created_at)} - ${lockerHistory.status !== 1 ?formatDate(
                  lockerHistory.updated_at
                ) : `Actual`})`}
              </Typography>
            ))
          ) : (
            <Typography>
              No hay historial de usuarios en este casillero
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseDialogHistory();
            }}
            color="primary"
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDialogAddLocker}
        onClose={() => {
          handleCloseDialogAddLocker(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {tittleDialogAddLocker}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            className={classes.textFields}
            required
            id="number"
            label="Número de casillero"
            margin="normal"
            value={newLockerNumberState}
            inputProps={{
              maxLength: 4
            }}
            onKeyPress={e => {
              keyValidation(e, 2);
            }}
            onChange={e => {
              pasteValidation(e, 2);
              setNewLockerNumberState(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseDialogAddLocker(false);
            }}
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              handleCloseDialogAddLocker(true);
            }}
            color="primary"
            autoFocus
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDialogUpdateLocker}
        onClose={() => {
          handleCloseDialogUpdateLocker(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {tittleDialogUpdateLocker}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container justify="center">
            <Grid item xs={12}>
              <TextField
                className={classes.textFields}
                disabled
                id="created_at"
                label="Fecha de creación"
                margin="normal"
                value={createAtUpdateLocker}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                className={classes.textFields}
                disabled
                id="updated_at"
                label="Úiltima actualización"
                margin="normal"
                value={updateAtUpdateLocker}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                className={classes.textFields}
                required
                id="number"
                label="Número de casillero"
                margin="normal"
                value={updateLockerNumberState}
                inputProps={{
                  maxLength: 4
                }}
                onKeyPress={e => {
                  keyValidation(e, 2);
                }}
                onChange={e => {
                  pasteValidation(e, 2);
                  setUpdateLockerNumberState(e.target.value);
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseDialogUpdateLocker(false);
            }}
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              handleCloseDialogUpdateLocker(true);
            }}
            color="primary"
            autoFocus
          >
            Agregar
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
    </Grid> : <Redirect to="/login" />
  );
}
