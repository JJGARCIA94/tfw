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
import { useMutation } from "@apollo/react-hooks";
import { ADD_PAYMENT_PERIOD } from "../../database/mutations";
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

export default function NewPaymentPeriod() {
  const classes = useStyles();
  const [paymentPeriodState, setPaymentPeriodState] = useState({
    period: "",
    days: ""
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
    addPaymentPeriodMutation,
    { loading: paymentPeriodLoading, error: paymentPeriodError }
  ] = useMutation(ADD_PAYMENT_PERIOD);

  const addPaymentPeriod = () => {
    setDisabledButton(true);
    const { period, days } = paymentPeriodState;

    if (period.trim() === "" || days.trim() === "" || parseInt(days) === 0) {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "Todos los campos son requeridos (el campo días debe ser mayor a 0)",
        snackbarColor: "#d32f2f"
      });
      setDisabledButton(false);
      return;
    }

    addPaymentPeriodMutation({
      variables: {
        period: period.trim(),
        days: parseInt(days)
      }
    });

    if (paymentPeriodLoading) return <CircularProgress />;
    if (paymentPeriodError) {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "Ha ocurrido un error",
        snackbarColor: "#d32f2f"
      });
      setDisabledButton(false);
      return;
    }

    setPaymentPeriodState({
      period: "",
      days: ""
    });

    setSnackbarState({
      ...snackbarState,
      openSnackbar: true,
      snackBarText: "Período de pago agregado",
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
          Agregar período de pago
          <Tooltip title="Regresar">
          <Link to="/paymentPeriods">
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
            id="period"
            label="Período"
            margin="normal"
            value={paymentPeriodState.period}
            inputProps={{
              maxLength: 50
            }}
            onKeyPress={e => {
              keyValidation(e, 5);
            }}
            onChange={e => {
              pasteValidation(e, 5);
              setPaymentPeriodState({
                ...paymentPeriodState,
                period: e.target.value
              });
            }}
          />
        </Grid>
        <Grid item md={1}/>
        <Grid item md={5} xs={10}>
          <TextField
            className={classes.textFields}
            required
            id="days"
            label="Días del período"
            margin="normal"
            value={paymentPeriodState.days}
            inputProps={{
              maxLength: 3
            }}
            onKeyPress={e => {
              keyValidation(e, 2);
            }}
            onChange={e => {
              pasteValidation(e, 2);
              setPaymentPeriodState({
                ...paymentPeriodState,
                days: e.target.value
              });
            }}
          />
        </Grid>
        <Grid item xs={10} md={11}>
          <Button
            variant="contained"
            disabled={disabledButton}
            className={classes.button}
            onClick={() => {
              addPaymentPeriod();
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
