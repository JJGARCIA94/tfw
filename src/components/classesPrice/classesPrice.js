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
  Snackbar,
  Button,
  TextField,
  Divider
} from "@material-ui/core";
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Restore as RestoreIcon,
  SportsKabaddi as SportsKabaddiIcon,
  MonetizationOn as MonetizationOnIcon
} from "@material-ui/icons";
import { useQuery, useSubscription, useMutation } from "@apollo/react-hooks";
import { GET_CLASSES_PRICE, GET_USER_BY_ID_AUTH } from "../../database/queries";
import {
  UPDATE_CLASSES_PRICE_STATUS,
  UPDATE_CLASSES_PRICE_NAME
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
  textFields: {
    width: "100%"
  }
}));

export default function ClassesPrice(props) {
  const classes = useStyles();
  const [dialogClassPriceState, setDialogClassPriceState] = useState({
    openClassPriceDialog: false,
    tittleClassPriceDialog: "",
    textClassPriceDialog: "",
    idClassPriceDialog: 0,
    statusClassPriceDialog: 0
  });
  const [
    dialogClassPriceInformationState,
    setDialogClassPriceInformationState
  ] = useState({
    openClassPriceInformationDialog: false,
    tittleClassPriceInformationDialog: "",
    idClassPriceInformationDialog: 0,
    nameClassPriceInformationDialog: ""
  });
  const [snackbarState, setSnackbarState] = useState({
    openSnackBar: false,
    vertical: "bottom",
    horizontal: "right",
    snackbarText: "",
    snackbarColor: ""
  });
  const {
    openClassPriceDialog,
    tittleClassPriceDialog,
    textClassPriceDialog,
    idClassPriceDialog,
    statusClassPriceDialog
  } = dialogClassPriceState;
  const {
    openClassPriceInformationDialog,
    tittleClassPriceInformationDialog,
    idClassPriceInformationDialog,
    nameClassPriceInformationDialog
  } = dialogClassPriceInformationState;
  const {
    vertical,
    horizontal,
    openSnackBar,
    snackbarText,
    snackbarColor
  } = snackbarState;
  const {
    data: classesPriceData,
    loading: classesPriceLoading,
    error: classesPriceError
  } = useSubscription(GET_CLASSES_PRICE);
  const [
    updateClassesPriceStatusMutation,
    {
      loading: updateClassesPriceStatusLoading,
      error: updateClassesPriceStatusError
    }
  ] = useMutation(UPDATE_CLASSES_PRICE_STATUS);
  const [
    updateClassesPriceNameMutation,
    {
      loading: updateClassesPriceNameLoading,
      error: updateClassesPriceNameError
    }
  ] = useMutation(UPDATE_CLASSES_PRICE_NAME);
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

  if (classesPriceLoading) {
    return <CircularProgress />;
  }
  if (classesPriceError || userAuthError) {
    return <NotFound />;
  }

  const handleOpenClassPriceDialog = (classPriceId, newStatus) => {
    setDialogClassPriceState({
      openClassPriceDialog: true,
      tittleClassPriceDialog:
        newStatus === 0
          ? "¿Quieres eliminar este precio de clase o paquete?"
          : "¿Quieres restaurar este precio de clase o paquete?",
      textClassPriceDialog:
        newStatus === 0
          ? "Una vez eliminado no estará disponible cuando los usuarios elijan las clases o paquetes."
          : "Una vez restaurado estará disponible cuando los usuarios elijan las clases o paquetes.",
      idClassPriceDialog: classPriceId,
      statusClassPriceDialog: newStatus
    });
  };

  const handleCloseClassPriceDialog = agree => {
    if (agree) {
      updateClassesPriceStatusMutation({
        variables: {
          id: idClassPriceDialog,
          newStatus: statusClassPriceDialog
        }
      });
      if (updateClassesPriceStatusLoading) return <CircularProgress />;
      if (updateClassesPriceStatusError) {
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
          statusClassPriceDialog === 1
            ? "Precio de clase o paquete restaurado"
            : "Precio de clase o paquete eliminado",
        snackbarColor: "#43a047"
      });
    }
    setDialogClassPriceState({
      openClassPriceDialog: false,
      tittleClassPriceDialog: "",
      textClassPriceDialog: "",
      idClassPriceDialog: 0,
      statusClassPriceDialog: 0
    });
  };

  const handleCloseClassPriceInformationDialog = agree => {
    if (agree) {
      updateClassesPriceNameMutation({
        variables: {
          classesPriceId: idClassPriceInformationDialog,
          name: nameClassPriceInformationDialog
        }
      });
      if (updateClassesPriceNameLoading) return <CircularProgress />;
      if (updateClassesPriceNameError) {
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
        snackbarText: "Nombre de la clase o paquete actualizado",
        snackbarColor: "#43a047"
      });
    }
    setDialogClassPriceInformationState({
      openClassPriceInformationDialog: false,
      tittleClassPriceInformationDialog: "",
      idClassPriceInformationDialog: 0,
      nameClassPriceInformationDialog: ""
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

  const getClassesPrice = () => {
    return classesPriceData.classes_price.map(class_price => {
      return (
        <Grid item xs={12} md={6} lg={4} key={class_price.id}>
          <Card className={classes.cards}>
            <CardContent>
              <Typography
                style={{
                  background: "#ebebeb",
                  marginBottom: "10px",
                  textAlign: "end"
                }}
              >
                <IconButton
                  title="Ver información de la clase o paquete"
                  onClick={() => {
                    setDialogClassPriceInformationState({
                      openClassPriceInformationDialog: true,
                      tittleClassPriceInformationDialog:
                        "Información de la clase o paquete",
                      idClassPriceInformationDialog: class_price.id,
                      nameClassPriceInformationDialog: class_price.name
                    });
                  }}
                >
                  <EditIcon style={{ color: "#FFC605" }} />
                </IconButton>
                <Link to={`/classesClassPrice/${class_price.id}`}>
                  <IconButton title="Ver clases de la clase o paquete">
                    <SportsKabaddiIcon style={{ color: "black" }} />
                  </IconButton>
                </Link>
                <Link to={`/paymentsClassPrice/${class_price.id}`}>
                  <IconButton title="Ver métodos de pago de la clase o paquete">
                    <MonetizationOnIcon style={{ color: "#43A047" }} />
                  </IconButton>
                </Link>
                <IconButton
                  title={
                    class_price.status === 1
                      ? "Eliminar precio de la clase o paquete"
                      : "Restaurar precio de la clase o paquete"
                  }
                  onClick={() => {
                    const newStatus = class_price.status === 1 ? 0 : 1;
                    handleOpenClassPriceDialog(class_price.id, newStatus);
                  }}
                >
                  {class_price.status === 1 ? (
                    <CloseIcon style={{ color: "#D32F2F" }} />
                  ) : (
                    <RestoreIcon style={{ color: "#673AB7" }} />
                  )}
                </IconButton>
              </Typography>
              <Typography variant="subtitle1" className={classes.cardContent}>
                {class_price.name !== null && class_price.name.trim() !== "" ? (
                  <span>
                    <strong>Nombre: </strong>
                    {class_price.name}
                  </span>
                ) : null}
              </Typography>
              <Typography variant="subtitle1" className={classes.cardContent}>
                <strong>Clase(s): </strong>
                {class_price.R_classes_price_details.map((aClass, index) => (
                  <span key={index}>{`${aClass.R_classes.name}${
                    class_price.R_classes_price_details.length !== index + 1
                      ? ","
                      : "."
                  } `}</span>
                ))}
              </Typography>
              <Typography variant="subtitle1" className={classes.cardContent}>
                <strong>Pagos: </strong>
                {class_price.R_classes_price_payment_periods.map(
                  (payment, index) => (
                    <span key={index}>{`${payment.R_payment_period.period}: $${
                      payment.total
                    } (${
                      payment.persons === 1
                        ? `Por persona`
                        : `Por ${payment.persons} personas`
                    }${
                      payment.specifications !== null &&
                      payment.specifications.trim() !== ""
                        ? `, ${payment.specifications}`
                        : ""
                    })${
                      class_price.R_classes_price_payment_periods.length !==
                      index + 1
                        ? ","
                        : "."
                    } `}</span>
                  )
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      );
    });
  };

  return ( userAuth ?
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h6">Precio de clases y paquetes</Typography>
        <Divider />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Card className={classes.cardAdd}>
          <CardContent>
            <Link to="/newClassPrice">
              <IconButton>
                <AddCircleOutlineIcon className={classes.addIcon} />
              </IconButton>
            </Link>
          </CardContent>
        </Card>
      </Grid>
      {getClassesPrice()}
      <Dialog
        open={openClassPriceDialog}
        onClose={() => {
          handleCloseClassPriceDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {tittleClassPriceDialog}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {textClassPriceDialog}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseClassPriceDialog(false);
            }}
            color="primary"
          >
            No
          </Button>
          <Button
            onClick={() => {
              handleCloseClassPriceDialog(true);
            }}
            color="primary"
            autoFocus
          >
            Sí
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openClassPriceInformationDialog}
        onClose={() => {
          handleCloseClassPriceInformationDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {tittleClassPriceInformationDialog}
        </DialogTitle>
        <DialogContent>
          <Grid container justify="center" className={classes.root}>
            <Grid item md={12} xs={12}>
              <TextField
                className={classes.textFields}
                id="name"
                label="Nombre de la clase o paquete"
                margin="normal"
                value={nameClassPriceInformationDialog}
                inputProps={{
                  maxLength: 50
                }}
                onKeyPress={e => {
                  keyValidation(e, 6);
                }}
                onChange={e => {
                  pasteValidation(e, 6);
                  setDialogClassPriceInformationState({
                    ...dialogClassPriceInformationState,
                    nameClassPriceInformationDialog: e.target.value
                  });
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseClassPriceInformationDialog(false);
            }}
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              handleCloseClassPriceInformationDialog(true);
            }}
            color="primary"
            autoFocus
          >
            Guardar
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
