import React, { useState } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { useSubscription, useMutation } from "@apollo/react-hooks";
import {
  GET_LOCKER_DETAIL_BY_LOCKER_ID,
  GET_LOCKER_IF_EXIST_BY_ID,
  GET_ACTIVE_USERS
} from "../../database/queries";
import {
  ADD_LOCKER_DETAIL,
  ADD_AND_UPDATE_LOCKER_DETAIL,
  UPDATE_LOCKER_DETAIL_STATUS
} from "../../database/mutations";
import NotFound from "../notFound/notFound";
import {
  CircularProgress,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Divider,
  Toolbar,
  Button,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Tooltip
} from "@material-ui/core";
import {
  ArrowBack as ArrowBackIcon,
  Clear as ClearIcon
} from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
  container: {
    marginTop: theme.spacing(3)
  },
  root: {
    padding: theme.spacing(3, 2),
    width: "100%"
  },
  cards: {
    margin: "10px",
    height: "250px",
    overflowY: "auto",
    overflowX: "auto"
  },
  cardContent: {
    textAlign: "justify"
  },
  deleteIcon: {
    color: "#D32F2F"
  }
}));

export default function SelectUserToLocker(props) {
  const classes = useStyles();
  const lockerId = props.match.params.lockerId;
  const [selectedUser, setSelectedUser] = useState(-1);
  const [searchState, setSearchState] = useState("");
  const [infoSelectedUserState, setInfoSelectedUserState] = useState({
    id: 0,
    locker_id: lockerId,
    user_id: 0
  });
  const [dialogState, setDialogState] = useState({
    openDialog: false,
    tittleDialog: "",
    textDialog: ""
  });
  const { openDialog, tittleDialog, textDialog } = dialogState;
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
  const {
    data: lockerDetailData,
    loading: lockerDetailLoading,
    error: lockerDetailError
  } = useSubscription(GET_LOCKER_DETAIL_BY_LOCKER_ID, {
    variables: {
      lockerId: lockerId
    }
  });
  const {
    data: lockerIfExistData,
    loading: lockerIfExistLoading,
    error: lockerIfExistError
  } = useSubscription(GET_LOCKER_IF_EXIST_BY_ID, {
    variables: {
      lockerId: lockerId
    }
  });
  const {
    data: activeUsersData,
    loading: activeUsersLoading,
    error: activeUsersError
  } = useSubscription(GET_ACTIVE_USERS, {
    variables: {
      search: "%" + searchState + "%"
    }
  });
  const [
    addLockerDetailMutation,
    {
      loading: addLockerDetailMutationLoading,
      error: addLockerDetailMutationError
    }
  ] = useMutation(ADD_LOCKER_DETAIL);
  const [
    addAndUpdateLockerDetailMutation,
    {
      loading: addAndUpdateLockerDetailMutationLoading,
      error: addAndUpdateLockerDetailMutationError
    }
  ] = useMutation(ADD_AND_UPDATE_LOCKER_DETAIL);
  const [
    updateLockerDetailStatusMutation,
    {
      loading: updateLockerDetailStatusMutationLoading,
      error: updateLockerDetailStatusMutationError
    }
  ] = useMutation(UPDATE_LOCKER_DETAIL_STATUS);

  if (lockerDetailLoading || activeUsersLoading || lockerIfExistLoading) {
    return <CircularProgress />;
  }
  if (
    lockerDetailError ||
    activeUsersError ||
    lockerIfExistError ||
    lockerIfExistData.lockers.length === 0
  ) {
    return <NotFound />;
  }

  const getActiveUsers = () => {
    return activeUsersData.users_data.map((activeUser, index) => {
      return (lockerDetailData.lockers_details.length !== 0 &&
        activeUser.id !== lockerDetailData.lockers_details[0].user_id) ||
        lockerDetailData.lockers_details.length === 0 ? (
        <Grid item xs={12} md={6} lg={4} key={activeUser.id}>
          <CardActionArea
            onClick={() => {
              setSelectedUser(selectedUser === index ? -1 : index);
              setInfoSelectedUserState({
                ...infoSelectedUserState,
                id:
                  selectedUser === index
                    ? 0
                    : lockerDetailData.lockers_details.length !== 0
                    ? lockerDetailData.lockers_details[0].locker_detail_id
                    : 0,
                user_id: selectedUser === index ? 0 : activeUser.id
              });
            }}
          >
            <Card
              className={classes.cards}
              style={{
                background: selectedUser === index ? "#eeeeee" : "white",
                border: selectedUser === index ? "1px solid black" : ""
              }}
            >
              <CardContent>
                <Typography>
                  <strong>Nombre:</strong>
                  {`${activeUser.first_name} ${activeUser.last_name}`}
                </Typography>
                <Typography>
                  <strong>Dirección:</strong>
                  {activeUser.address}
                </Typography>
                <Typography>
                  <strong>Teléfono:</strong>
                  {activeUser.phone_number}
                </Typography>
                <Typography>
                  <strong>Email:</strong>
                  {activeUser.email}
                </Typography>
                <Typography>
                  <strong>Tipo de usuario:</strong>
                  {activeUser.R_user_type.name}
                </Typography>
              </CardContent>
            </Card>
          </CardActionArea>
        </Grid>
      ) : null;
    });
  };

  const addUpdateLockerDetail = () => {
    if (selectedUser === -1) {
      setSnackbarState({
        ...snackbarState,
        openSnackBar: true,
        snackbarText: "Selecciona un usuario",
        snackbarColor: "#d32f2f"
      });
      return;
    } else if (lockerIfExistData.lockers[0].status === 0) {
      setSnackbarState({
        ...snackbarState,
        openSnackBar: true,
        snackbarText:
          "No se puede asignar un usuario a un casillero que esta dado de baja",
        snackbarColor: "#d32f2f"
      });
      return;
    } else {
      const { id, locker_id, user_id } = infoSelectedUserState;
      if (id === 0) {
        addLockerDetailMutation({
          variables: {
            lockerId: locker_id,
            userId: user_id
          }
        });
        if (addLockerDetailMutationLoading) return <CircularProgress />;
        if (addLockerDetailMutationError) {
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
          snackbarText: "Casillero asignado",
          snackbarColor: "#43a047"
        });
      } else {
        addAndUpdateLockerDetailMutation({
          variables: {
            lockerDetailId: id,
            lockerId: locker_id,
            userId: user_id
          }
        });
        if (addAndUpdateLockerDetailMutationLoading)
          return <CircularProgress />;
        if (addAndUpdateLockerDetailMutationError) {
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
          snackbarText: "Casillero asignado a otro usuario",
          snackbarColor: "#43a047"
        });
      }
      setSearchState("");
      setSelectedUser(-1);
      setInfoSelectedUserState({
        ...infoSelectedUserState,
        id: 0,
        user_id: 0
      });
    }
  };

  const handleOpenDialog = () => {
    setDialogState({
      openDialog: true,
      tittleDialog: "¿Quieres quitar este usuario del casillero?",
      textDialog:
        "Al quitar el usuario el casillero estará disponible para cualquier otro usuario."
    });
  };

  const handleCloseDialog = agree => {
    if (agree) {
      const lockerDetailId =
        lockerDetailData.lockers_details[0].locker_detail_id;
      updateLockerDetailStatusMutation({
        variables: {
          lockerDetailId: lockerDetailId
        }
      });
      if (updateLockerDetailStatusMutationLoading) return <CircularProgress />;
      if (updateLockerDetailStatusMutationError) {
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
        snackbarText: "Casillero libre",
        snackbarColor: "#43a047"
      });
    }
    setDialogState({
      openDialog: false,
      tittleDialog: ""
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

  return (
    <Grid container>
      <Toolbar
        style={{ background: "white", width: "100%", marginBottom: "10px" }}
      >
        <Typography variant="h6">Asignar casillero a usuario</Typography>
        <Tooltip title="Regresar">
          <Link to="/lockers">
            <ArrowBackIcon />
          </Link>
        </Tooltip>
      </Toolbar>
      {lockerDetailData.lockers_details.length !== 0 ? (
        <Grid container style={{ marginTop: "10px" }}>
          <Grid item xs={12}>
            <Typography variant="h6">
              Usuario actual
              <Tooltip title="Quitar usuario actual">
                <IconButton
                  onClick={() => {
                    handleOpenDialog();
                  }}
                >
                  <ClearIcon className={classes.deleteIcon} />
                </IconButton>
              </Tooltip>
            </Typography>
            <Divider />
          </Grid>
          <Grid container>
            <Grid item xs={12} md={6} lg={4}>
              <Card className={classes.cards}>
                <CardContent>
                  <Typography>
                    <strong>Nombre: </strong>
                    {`${lockerDetailData.lockers_details[0].R_users_data.first_name} ${lockerDetailData.lockers_details[0].R_users_data.last_name}`}
                  </Typography>
                  <Typography>
                    <strong>Dirección:</strong>
                    {lockerDetailData.lockers_details[0].R_users_data.address}
                  </Typography>
                  <Typography>
                    <strong>Teléfono:</strong>
                    {
                      lockerDetailData.lockers_details[0].R_users_data
                        .phone_number
                    }
                  </Typography>
                  <Typography>
                    <strong>Email:</strong>
                    {lockerDetailData.lockers_details[0].R_users_data.email}
                  </Typography>
                  <Typography>
                    <strong>Tipo de usuario:</strong>
                    {
                      lockerDetailData.lockers_details[0].R_users_data
                        .R_user_type.name
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      ) : null}
      <Grid container>
        <Grid item xs={12}>
          <TextField
            label="Buscar usuario"
            margin="normal"
            autoFocus
            value={searchState}
            onChange={e => {
              setSearchState(e.target.value);
            }}
          />
        </Grid>
      </Grid>
      <Grid container style={{ marginTop: "10px" }}>
        <Grid item xs={6}>
          <Typography variant="h6">Usuarios:</Typography>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="primary"
            style={{
              float: "right",
              marginBottom: "10px",
              marginRight: "10px"
            }}
            onClick={() => {
              addUpdateLockerDetail();
            }}
          >
            Asignar
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
      </Grid>
      {getActiveUsers()}
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
    </Grid>
  );
}
