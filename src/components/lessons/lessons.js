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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Snackbar,
  Divider,
  Tooltip
} from "@material-ui/core";
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Restore as RestoreIcon,
  QueryBuilder as QueryBuilderIcon
} from "@material-ui/icons";
import { useQuery, useSubscription, useMutation } from "@apollo/react-hooks";
import {
  GET_CLASSES,
  GET_MEMBERS_BY_CLASS,
  GET_MEMBERS_BY_CLASS_HISTORY,
  GET_USER_BY_ID_AUTH,
  GET_CLASSES_PRICE_BY_CLASS_ID
} from "../../database/queries";
import { CANCEL_CLASS, RESTORE_CLASS } from "../../database/mutations";
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
  }
}));

export default function Lessons(props) {
  const classes = useStyles();
  const [dialogState, setDialogState] = useState({
    openDialog: false,
    tittleDialog: "",
    idDialog: 0,
    statusDialog: 0
  });
  const [dialogClassState, setDialogClassState] = useState({
    openClassDialog: false,
    tittleClassDialog: "",
    textClassDialog: "",
    idClassDialog: 0,
    statusClassDialog: 0
  });
  const [snackbarState, setSnackbarState] = useState({
    openSnackBar: false,
    vertical: "bottom",
    horizontal: "right",
    snackbarText: "",
    snackbarColor: ""
  });
  const { openDialog, tittleDialog, idDialog, statusDialog } = dialogState;
  const {
    openClassDialog,
    tittleClassDialog,
    textClassDialog,
    idClassDialog,
    statusClassDialog
  } = dialogClassState;
  const {
    vertical,
    horizontal,
    openSnackBar,
    snackbarText,
    snackbarColor
  } = snackbarState;
  const [idClassState, setIdClassState] = useState(0);
  const [currentClassId, setCurrentClassId] = useState(0);
  const [existClass, setExistClass] = useState(0);
  const [activeUsersState, setActiveUsersState] = useState([]);
  const [
    updateClassStatusMutation,
    { loading: updateClassStatusLoading, error: updateClassStatusError }
  ] = useMutation(statusClassDialog === 0 ? CANCEL_CLASS : RESTORE_CLASS);
  const {
    data: classesData,
    loading: classesLoading,
    error: classesError
  } = useSubscription(GET_CLASSES);
  const {
    data: membersData,
    loading: membersLoading,
    error: membersError
  } = useSubscription(GET_MEMBERS_BY_CLASS, {
    variables: {
      classId: idClassState
    }
  });
  const {
    data: classesPriceData,
    loading: classesPriceLoading,
    error: classesPriceError
  } = useSubscription(GET_CLASSES_PRICE_BY_CLASS_ID, {
    variables: {
      classId: currentClassId
    }
  });
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
    if(classesPriceData) {
      setExistClass(classesPriceData.classes_price_details.length);
    }
  }, [classesPriceData]);

  useEffect(() => {
    if (idClassState !== 0 && membersData) {
      let activeUsers = [];
      membersData.classes_details.map(member =>
        activeUsers.push(member.user_id)
      );
      setActiveUsersState(activeUsers);
    }
  }, [idClassState, membersData]);

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

  if (classesLoading || membersLoading || classesPriceLoading) {
    return <CircularProgress />;
  }
  if (classesError || membersError || userAuthError || classesPriceError) {
    return <NotFound />;
  }

  const getClasses = () => {
    return classesData.classes.map(lesson => {
      return (
        <Grid item xs={12} md={6} lg={4} key={lesson.id}>
          <Card className={classes.cards}>
            <CardContent>
              <Typography className={classes.typografyActions}>
                <Tooltip title="Ver información">
                <Link to={"/lesson/" + lesson.id}>
                  <IconButton>
                    <EditIcon className={classes.editIcon} />
                  </IconButton>
                </Link>
                </Tooltip>
                <Tooltip title={lesson.status === 1 ? "Cancelar" : "Restaurar"}>
                <IconButton
                  onClick={() => {
                    setCurrentClassId(lesson.id);
                    const newStatus = lesson.status === 1 ? 0 : 1;
                    handleOpenClassDialog(lesson.id, newStatus);
                  }}
                >
                  {lesson.status === 1 ? (
                    <CloseIcon className={classes.cancelIcon} />
                  ) : (
                    <RestoreIcon className={classes.restoreIcon} />
                  )}
                </IconButton>
                </Tooltip>
              </Typography>
              <Typography variant="subtitle1" className={classes.cardTittle}>
                <strong>Nombre: </strong>
                {`${lesson.name} `}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Coach: </strong>
                {lesson.R_users_data.status !== 0 ? (
                  `${lesson.R_users_data.first_name} ${lesson.R_users_data.last_name} `
                ) : (
                  <span style={{ color: "#d32f2f" }}>Sin couch</span>
                )}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Miembros: </strong>
                <Tooltip title={
                    lesson.R_classes_details_aggregate.aggregate.count > 0
                      ? "Ver miembros activos"
                      : "Sin miembros"
                  }>
                <span
                  style={{
                    cursor:
                      lesson.R_classes_details_aggregate.aggregate.count > 0
                        ? "pointer"
                        : "",
                    color:
                      lesson.R_classes_details_aggregate.aggregate.count > 0
                        ? "#43a047"
                        : "#d32f2f"
                  }}
                  onClick={() => {
                    if (
                      lesson.R_classes_details_aggregate.aggregate.count > 0
                    ) {
                      handleOpenDialog(lesson.id, lesson.name, 1);
                    }
                  }}
                >{`${lesson.R_classes_details_aggregate.aggregate.count} miembros`}</span>
                </Tooltip>
                <Tooltip title="Ver historial de miembros inactivos">
                <IconButton
                  onClick={async () => {
                    await setIdClassState(lesson.id);
                    handleOpenDialog(lesson.id, lesson.name, 0);
                  }}
                >
                  <QueryBuilderIcon />
                </IconButton>
                </Tooltip>
              </Typography>
              <Typography variant="subtitle1" className={classes.cardContent}>
                <strong>Description: </strong>
                {lesson.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      );
    });
  };

  const handleOpenDialog = (classId, className, status) => {
    setDialogState({
      openDialog: true,
      tittleDialog:
        status === 1
          ? `${className} miembros`
          : `Historial de miembros de ${className}`,
      idDialog: classId,
      statusDialog: status
    });
  };

  const handleOpenClassDialog = (classId, status) => {
    setDialogClassState({
      openClassDialog: true,
      tittleClassDialog:
        status === 0
          ? "¿Quieres cancelar esta clase?"
          : "¿Quieres restaurar esta clase?",
      textClassDialog:
        status === 0
          ? "Si cancelas esta clase todos los miembros pertenecientes serán retirados y esta clase no estará disponible para los clientess."
          : "Si restauras esta clase estará disponible para los clientes.",
      idClassDialog: classId,
      statusClassDialog: status
    });
  };

  const handleCloseDialog = () => {
    setDialogState({
      openDialog: false,
      tittleDialog: "",
      idDialog: 0,
      statusDialog: 0
    });
  };

  const handleCloseClassDialog = agree => {
    if (agree) {
      if(existClass > 0 && statusClassDialog === 0) {
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText: "No puedes eliminar esta clase porque pertenece a un precio de clase o paquete activo",
          snackbarColor: "#d32f2f"
        });
        return;
      }
      else {
        updateClassStatusMutation({
          variables: {
            classId: idClassDialog
          }
        });
        if (updateClassStatusLoading) return <CircularProgress />;
        if (updateClassStatusError) {
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
            statusClassDialog === 1 ? "Clase restaurada" : "Clase cancelada",
          snackbarColor: "#43a047"
        });
      }
    }
    setDialogClassState({
      openClassDialog: false,
      tittleClassDialog: "",
      textClassDialog: "",
      idClassDialog: 0,
      statusClassDialog: 0
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
        <Typography variant="h6">Clases</Typography>
        <Divider />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Card className={classes.cardAdd}>
          <CardContent>
            <Tooltip title="Agregar clase">
            <Link to="/newLesson">
              <IconButton>
                <AddCircleOutlineIcon className={classes.addIcon} />
              </IconButton>
            </Link>
            </Tooltip>
          </CardContent>
        </Card>
      </Grid>
      {getClasses()}
      <Dialog
        open={openDialog}
        onClose={() => {
          handleCloseDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{tittleDialog}</DialogTitle>
        <DialogContent dividers>
          <Members
            classId={idDialog}
            status={statusDialog}
            activeUsersState={activeUsersState}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseDialog();
            }}
            color="primary"
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openClassDialog}
        onClose={() => {
          handleCloseClassDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{tittleClassDialog}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {textClassDialog}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseClassDialog(false);
            }}
            color="primary"
          >
            No
          </Button>
          <Button
            onClick={() => {
              handleCloseClassDialog(true);
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
    </Grid> : <Redirect to="/login" />
  );
}

function Members(props) {
  const activeUsersState = props.activeUsersState;
  const {
    data: membersData,
    loading: membersLoading,
    error: membersError
  } = useSubscription(
    props.status === 1 ? GET_MEMBERS_BY_CLASS : GET_MEMBERS_BY_CLASS_HISTORY,
    {
      variables: props.status === 1 ? {
        classId: props.classId
      } : {
        classId: props.classId,
        activeUsers: activeUsersState
      }
    }
  );

  if (membersLoading) {
    return <CircularProgress />;
  }
  if (membersError) {
    return <NotFound />;
  }

  const getMembers = () => {
    return membersData.classes_details.map((member, index) => {
      return (
        <List key={member.id}>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                {`${member.R_users_data.first_name[0].toUpperCase()}${member.R_users_data.last_name[0].toUpperCase()}`}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`${member.R_users_data.first_name} ${member.R_users_data.last_name}`}
              secondary={`${member.R_users_data.phone_number} - ${member.R_users_data.email}`}
            />
          </ListItem>
        </List>
      );
    });
  };

  return membersData.classes_details.length ? (
    getMembers()
  ) : (
    <Typography variant="subtitle1">Sin miembros</Typography>
  );
}
