import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  TextField
} from "@material-ui/core";
import {
  ArrowBack as ArrowBackIcon,
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreFromTrashIcon,
  Edit as EditIcon
} from "@material-ui/icons";
import { useSubscription, useMutation } from "@apollo/react-hooks";
import {
  GET_PAYMENTS_BY_CLASS_PRICE_ID,
  GET_PAYMENTS_COUNT_BY_CLASS_PRICE_ID,
  GET_PAYMENT_PERIODS,
  GET_PAYMENT_PERIOD_BY_ID_VALIDATION
} from "../../database/queries";
import {
  UPDATE_CLASSES_PRICE_PAYMENT_PERIOD_STATUS,
  ADD_CLASS_PRICE_PAYMENT_PERIOD,
  UPDATE_CLASS_PRICE_PAYMENT_PERIOD
} from "../../database/mutations";
import { keyValidation, pasteValidation } from "../../helpers/helpers";
import NotFound from "../notFound/notFound";

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
  },
  textFields: {
    width: "100%"
  }
}));

export default function PaymentsClassPrice(props) {
  const classes = useStyles();
  const classPriceId = props.match.params.classPriceId;
  const [paymentState, setPaymentState] = useState({
    payment_period_id: 0,
    persons: 0,
    total: 0,
    specifications: ""
  });
  const [paymentPeriodIdState, setPaymentPeriodIdState] = useState(0);
  const [dialog, setDialog] = useState({
    openDialog: false,
    tittleDialog: "",
    textDialog: "",
    idDialog: 0,
    statusDialog: 0
  });
  const [dialogAddPayment, setDialogAddPayment] = useState({
    openDialogAddPayment: false,
    tittleDialogAddPayment: ""
  });
  const [dialogUpdatePayment, setDialogUpdatePayment] = useState({
    openDialogUpdatePayment: false,
    tittleDialogUpdatePayment: "",
    idClassPricePaymentDialogUpdatePayment: 0,
    paymentPeriodIdDialogUpdatePayment: 0,
    personsDialogUpdatePayment: 0,
    totalDialogUpdatePayment: 0,
    specificationsDialogUpdatePayment: ""
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
  const { openDialogAddPayment, tittleDialogAddPayment } = dialogAddPayment;
  const {
    openDialogUpdatePayment,
    tittleDialogUpdatePayment,
    idClassPricePaymentDialogUpdatePayment,
    paymentPeriodIdDialogUpdatePayment,
    personsDialogUpdatePayment,
    totalDialogUpdatePayment,
    specificationsDialogUpdatePayment
  } = dialogUpdatePayment;
  const {
    vertical,
    horizontal,
    openSnackBar,
    snackbarText,
    snackbarColor
  } = snackbarState;
  const {
    data: paymentsClassPriceData,
    loading: paymentsClassPriceLoading,
    error: paymentsClassPriceError
  } = useSubscription(GET_PAYMENTS_BY_CLASS_PRICE_ID, {
    variables: {
      classPriceId: classPriceId
    }
  });
  const {
    data: paymentsCountData,
    loading: paymentsCountLoading,
    error: paymentsCountError
  } = useSubscription(GET_PAYMENTS_COUNT_BY_CLASS_PRICE_ID, {
    variables: {
      classPriceId: classPriceId
    }
  });
  const {
    data: paymentsPeriodsData,
    loading: paymentsPeriodsLoading,
    error: paymentsPeriodsError
  } = useSubscription(GET_PAYMENT_PERIODS);
  const {
    data: paymentsPeriodsValidationData,
    loading: paymentsPeriodsValidationLoading,
    error: paymentsPeriodsValidationError
  } = useSubscription(GET_PAYMENT_PERIOD_BY_ID_VALIDATION, {
    variables: {
      paymentPeriodId: paymentPeriodIdState
    }
  });
  const [
    updateClassesPricePaymentPeriodStatusMutation,
    {
      loading: updateClassesPricePaymentPeriodStatusLoading,
      error: updateClassesPricePaymentPeriodStatusError
    }
  ] = useMutation(UPDATE_CLASSES_PRICE_PAYMENT_PERIOD_STATUS);

  const [
    addClassPricePaymentPeriodMutation,
    {
      loading: addClassPricePaymentPeriodLoading,
      error: addClassPricePaymentPeriodError
    }
  ] = useMutation(ADD_CLASS_PRICE_PAYMENT_PERIOD);
  const [
    updateClassPricePaymentPeriodMutation,
    {
      loading: updateClassPricePaymentPeriodLoading,
      error: updateClassPricePaymentPeriodError
    }
  ] = useMutation(UPDATE_CLASS_PRICE_PAYMENT_PERIOD);

  if (
    paymentsClassPriceLoading ||
    paymentsCountLoading ||
    paymentsPeriodsLoading ||
    paymentsPeriodsValidationLoading
  ) {
    return <CircularProgress />;
  }
  if (
    paymentsClassPriceError ||
    paymentsCountError ||
    paymentsPeriodsError ||
    paymentsPeriodsValidationError ||
    paymentsClassPriceData.classes_price_payment_period.length === 0
  ) {
    return <NotFound />;
  }

  const handleOpenDialog = (idPayment, newStatus, paymentPeriodId) => {
    setDialog({
      openDialog: true,
      tittleDialog:
        newStatus === 0
          ? "¿Quieres eliminar este periodo?"
          : "¿Quieres restaurar este periodo?",
      textDialog:
        newStatus === 0
          ? "Una vez eliminado ya no estará disponible dentro de esta clase o paquete."
          : "Una vez restaurado estará disponible dentro de esta clase o paquete.",
      idDialog: idPayment,
      statusDialog: newStatus
    });
    setPaymentPeriodIdState(paymentPeriodId);
  };

  const handleOpenDialogAddPayment = () => {
    setDialogAddPayment({
      openDialogAddPayment: true,
      tittleDialogAddPayment: "Agregar periodo de pago"
    });
  };

  const handleOpenDialogUpdatePayment = (
    classPricePaymentPeriodId,
    paymentPeriodId,
    persons,
    total,
    specifications
  ) => {
    setDialogUpdatePayment({
      openDialogUpdatePayment: true,
      tittleDialogUpdatePayment: "Editar periodo de pago",
      idClassPricePaymentDialogUpdatePayment: classPricePaymentPeriodId,
      paymentPeriodIdDialogUpdatePayment: paymentPeriodId,
      personsDialogUpdatePayment: persons,
      totalDialogUpdatePayment: total,
      specificationsDialogUpdatePayment: specifications
    });
  };

  const handleCloseDialog = agree => {
    if (agree) {
      if (
        paymentsCountData.classes_price_payment_period_aggregate.aggregate
          .count <= 1 &&
        statusDialog === 0
      ) {
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText:
            "Tiene que haber por lo menos un periodo de pago activo",
          snackbarColor: "#d32f2f"
        });
        return;
      } else if (
        paymentsPeriodsValidationData.payment_periods_aggregate.aggregate
          .count === 0 &&
        statusDialog === 1
      ) {
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText:
            "No se puede restaurar porque el periodo de pago no está activo.",
          snackbarColor: "#d32f2f"
        });
        return;
      } else {
        updateClassesPricePaymentPeriodStatusMutation({
          variables: {
            id: idDialog,
            newStatus: statusDialog
          }
        });
        if (updateClassesPricePaymentPeriodStatusLoading)
          return <CircularProgress />;
        if (updateClassesPricePaymentPeriodStatusError) {
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
            statusDialog === 1
              ? "Periodo de pago restaurado"
              : "Periodo de pago eliminado",
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

  const handleCloseDialogAddPayment = agree => {
    if (agree) {
      const {
        payment_period_id,
        persons,
        total,
        specifications
      } = paymentState;
      if (
        payment_period_id === 0 ||
        payment_period_id === "0" ||
        persons === "" ||
        parseInt(persons) === 0 ||
        total === ""
      ) {
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText:
            "Agrega los campos requeridos (*, el campo personas debe ser mayor a 0)",
          snackbarColor: "#d32f2f"
        });
        return;
      } else {
        addClassPricePaymentPeriodMutation({
          variables: {
            classPriceId: classPriceId,
            paymentPeriodId: payment_period_id,
            persons: parseInt(persons),
            total: parseInt(total),
            specifications: specifications
          }
        });

        if (addClassPricePaymentPeriodLoading) {
          return <CircularProgress />;
        }
        if (addClassPricePaymentPeriodError) {
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
          snackbarText: "Periodo de pago agregado",
          snackbarColor: "#43a047"
        });
      }
    }
    setPaymentState({
      payment_period_id: 0,
      persons: 0,
      total: 0,
      specifications: ""
    });
    setDialogAddPayment({
      openDialogAddPayment: false,
      tittleDialogAddPayment: ""
    });
  };

  const handleCloseDialogUpdatePayment = agree => {
    if (agree) {
      if (
        paymentPeriodIdDialogUpdatePayment === 0 ||
        paymentPeriodIdDialogUpdatePayment === "0" ||
        personsDialogUpdatePayment === "" ||
        parseInt(personsDialogUpdatePayment) === 0 ||
        totalDialogUpdatePayment === ""
      ) {
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText:
            "Agrega los campos requeridos (*, el campo personas debe ser mayor a 0)",
          snackbarColor: "#d32f2f"
        });
        return;
      } else {
        updateClassPricePaymentPeriodMutation({
          variables: {
            classPricePaymentPeriodId: idClassPricePaymentDialogUpdatePayment,
            paymentPeriodId: paymentPeriodIdDialogUpdatePayment,
            persons: parseInt(personsDialogUpdatePayment),
            total: parseInt(totalDialogUpdatePayment),
            specifications: specificationsDialogUpdatePayment
          }
        });

        if (updateClassPricePaymentPeriodLoading) {
          return <CircularProgress />;
        }
        if (updateClassPricePaymentPeriodError) {
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
          snackbarText: "Periodo de pago editado",
          snackbarColor: "#43a047"
        });
      }
    }
    setDialogUpdatePayment({
      openDialogUpdatePayment: false,
      tittleDialogUpdatePayment: "",
      idClassPricePaymentDialogUpdatePayment: 0,
      paymentPeriodIdDialogUpdatePayment: 0,
      personsDialogUpdatePayment: 0,
      totalDialogUpdatePayment: 0,
      specificationsDialogUpdatePayment: ""
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

  const getPaymentsPeriods = () => {
    return paymentsPeriodsData.payment_periods.map(paymentPeriod => {
      return (
        <option key={paymentPeriod.id} value={paymentPeriod.id}>
          {paymentPeriod.period}
        </option>
      );
    });
  };

  return (
    <TableContainer component={Paper} className={classes.root}>
      <Toolbar>
        <Grid container>
          <Grid item md={8} xs={12}>
            <Typography variant="h6" id="tableTitle">
              <Link to={"/classesPrice"}>
                <ArrowBackIcon />
              </Link>
              <span style={{ marginLeft: "10px" }}>Períodos de pago</span>
              <IconButton
                onClick={() => {
                  handleOpenDialogAddPayment();
                }}
              >
                <AddCircleIcon style={{ color: "#007bff" }} />
              </IconButton>
            </Typography>
          </Grid>
        </Grid>
      </Toolbar>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Periodo</TableCell>
            <TableCell>Personas</TableCell>
            <TableCell>Monto</TableCell>
            <TableCell>Especificaciones</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paymentsClassPriceData.classes_price_payment_period.map(row => (
            <TableRow key={row.id}>
              <TableCell component="th" scope="row">
                {row.R_payment_period.period}
              </TableCell>
              <TableCell component="th" scope="row">
                {row.persons}
              </TableCell>
              <TableCell component="th" scope="row">
                {row.total}
              </TableCell>
              <TableCell component="th" scope="row">
                {row.specifications === "" || row.specifications === null
                  ? "Sin especificaciones"
                  : row.specifications}
              </TableCell>
              <TableCell align="right">
                <IconButton
                  title="Editar periodo de pago"
                  onClick={() => {
                    handleOpenDialogUpdatePayment(
                      row.id,
                      row.payment_period_id,
                      row.persons,
                      row.total,
                      row.specifications
                    );
                  }}
                >
                  <EditIcon className={classes.icons} />
                </IconButton>
                <IconButton
                  title={
                    row.status === 1
                      ? "Eliminar periodo de pago"
                      : "Restaurar periodo de pago"
                  }
                  onClick={() => {
                    const newStatus = row.status === 1 ? 0 : 1;
                    handleOpenDialog(row.id, newStatus, row.payment_period_id);
                  }}
                >
                  {row.status === 1 ? (
                    <DeleteIcon className={classes.icons} />
                  ) : (
                    <RestoreFromTrashIcon className={classes.icons} />
                  )}
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
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
      <Dialog
        open={openDialogAddPayment}
        onClose={() => {
          handleCloseDialogAddPayment(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {tittleDialogAddPayment}
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Periodo de pago"
            required
            className={classes.textFields}
            SelectProps={{
              native: true
            }}
            value={paymentState.payment_period_id}
            margin="normal"
            onChange={e => {
              setPaymentState({
                ...paymentState,
                payment_period_id: e.target.value
              });
            }}
          >
            <option value="0">Selecciona un periodo de pago</option>
            {getPaymentsPeriods()}
          </TextField>
          <TextField
            className={classes.textFields}
            required
            id="persons"
            label="Personas"
            margin="normal"
            value={paymentState.persons}
            inputProps={{
              maxLength: 2
            }}
            onKeyPress={e => {
              keyValidation(e, 2);
            }}
            onChange={e => {
              pasteValidation(e, 2);
              setPaymentState({
                ...paymentState,
                persons: e.target.value
              });
            }}
          />
          <TextField
            className={classes.textFields}
            required
            id="total"
            label="Total"
            margin="normal"
            value={paymentState.total}
            inputProps={{
              maxLength: 6
            }}
            onKeyPress={e => {
              keyValidation(e, 2);
            }}
            onChange={e => {
              pasteValidation(e, 2);
              setPaymentState({
                ...paymentState,
                total: e.target.value
              });
            }}
          />
          <TextField
            className={classes.textFields}
            id="specifications"
            label="Especificaciones"
            margin="normal"
            value={paymentState.specifications}
            inputProps={{
              maxLength: 100
            }}
            onKeyPress={e => {
              keyValidation(e, 6);
            }}
            onChange={e => {
              pasteValidation(e, 6);
              setPaymentState({
                ...paymentState,
                specifications: e.target.value
              });
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseDialogAddPayment(false);
            }}
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              handleCloseDialogAddPayment(true);
            }}
            color="primary"
            autoFocus
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDialogUpdatePayment}
        onClose={() => {
          handleCloseDialogUpdatePayment(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {tittleDialogUpdatePayment}
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Periodo de pago"
            required
            className={classes.textFields}
            SelectProps={{
              native: true
            }}
            value={paymentPeriodIdDialogUpdatePayment}
            margin="normal"
            onChange={e => {
              setDialogUpdatePayment({
                ...dialogUpdatePayment,
                paymentPeriodIdDialogUpdatePayment: e.target.value
              });
            }}
          >
            <option value="0">Selecciona un periodo de pago</option>
            {getPaymentsPeriods()}
          </TextField>
          <TextField
            className={classes.textFields}
            required
            id="persons"
            label="Personas"
            margin="normal"
            value={personsDialogUpdatePayment}
            inputProps={{
              maxLength: 2
            }}
            onKeyPress={e => {
              keyValidation(e, 2);
            }}
            onChange={e => {
              pasteValidation(e, 2);
              setDialogUpdatePayment({
                ...dialogUpdatePayment,
                personsDialogUpdatePayment: e.target.value
              });
            }}
          />
          <TextField
            className={classes.textFields}
            required
            id="total"
            label="Total"
            margin="normal"
            value={totalDialogUpdatePayment}
            inputProps={{
              maxLength: 6
            }}
            onKeyPress={e => {
              keyValidation(e, 2);
            }}
            onChange={e => {
              pasteValidation(e, 2);
              setDialogUpdatePayment({
                ...dialogUpdatePayment,
                totalDialogUpdatePayment: e.target.value
              });
            }}
          />
          <TextField
            className={classes.textFields}
            id="specifications"
            label="Especificaciones"
            margin="normal"
            value={specificationsDialogUpdatePayment}
            inputProps={{
              maxLength: 100
            }}
            onKeyPress={e => {
              keyValidation(e, 6);
            }}
            onChange={e => {
              pasteValidation(e, 6);
              setDialogUpdatePayment({
                ...dialogUpdatePayment,
                specificationsDialogUpdatePayment: e.target.value
              });
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseDialogUpdatePayment(false);
            }}
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              handleCloseDialogUpdatePayment(true);
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
    </TableContainer>
  );
}
