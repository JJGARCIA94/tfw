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
import { useSubscription, useMutation } from "@apollo/react-hooks";
import { GET_PAYMENT_PERIOD_BY_ID } from "../../database/queries";
import { UPDATE_PAYMENT_PERIOD } from "../../database/mutations";
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

export default function PaymentPeriod(props) {
  const paymentPeriodId = props.match.params.paymentPeriodId;
  const classes = useStyles();
  const [paymentPeriodState, setPaymentPeriodState] = useState({
    period: "",
    days: "",
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
  const {
    data: paymentPeriodData,
    loading: paymentPeriodLoading,
    error: paymentPeriodError
  } = useSubscription(GET_PAYMENT_PERIOD_BY_ID, {
    variables: {
      paymentPeriodId: paymentPeriodId
    }
  });
  const [
    updatePaymentPeriodMutation,
    { loading: paymentPeriodUpdateLoading, error: paymentPeriodUpdateError }
  ] = useMutation(UPDATE_PAYMENT_PERIOD);

  if (paymentPeriodLoading) {
    return <CircularProgress />;
  }

  if (paymentPeriodError) {
    return <NotFound />;
  }

  const getData = paymentPeriodData => {
    const createAt = new Date(paymentPeriodData.created_at);
    const updated_at = new Date(paymentPeriodData.updated_at);
    setPaymentPeriodState({
      period: paymentPeriodData.period,
      days: paymentPeriodData.days,
      created_at: createAt.toLocaleString(),
      updated_at: updated_at.toLocaleString()
    });
  };

  const updatePaymentPeriod = async () => {
    setDisabledButton(true);
    const { period, days } = paymentPeriodState;

    if (period.trim() === "" || days === "" || parseInt(days) === 0) {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "Todos los campos son requeridos (el campo días debe ser mayor a 0)",
        snackbarColor: "#d32f2f"
      });
      setDisabledButton(false);
      return;
    }

    const resultUpdatePaymentPeriod = await updatePaymentPeriodMutation({
      variables: {
        paymentPeriodId: paymentPeriodId,
        period: period.trim(),
        days: parseInt(days)
      }
    });

    if (paymentPeriodUpdateLoading) return <CircularProgress />;
    if (paymentPeriodUpdateError) {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "An error occurred",
        snackbarColor: "#d32f2f"
      });
      setDisabledButton(false);
      return;
    }

    const newPaymentPeriod =
      resultUpdatePaymentPeriod.data.update_payment_periods.returning[0];
    getData(newPaymentPeriod);

    setSnackbarState({
      ...snackbarState,
      openSnackbar: true,
      snackBarText: "Payment period updated",
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
          Información de período de pago
          <Link to="/paymentPeriods">
            <ArrowBackIcon />
          </Link>
        </Typography>
      </Toolbar>
      <Grid container justify="center" className={classes.root}>
        <Grid item md={5} xs={10}>
          <TextField
            className={classes.textFields}
            id="create_at"
            label="Creado"
            margin="normal"
            value={paymentPeriodState.created_at}
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
            value={paymentPeriodState.updated_at}
            disabled
          />
        </Grid>
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
        <Grid item md={1} />
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
            onAnimationEnd={() => {
              getData(paymentPeriodData.payment_periods[0]);
            }}
          />
        </Grid>
        <Grid item xs={10} md={11}>
          <Button
            variant="contained"
            disabled={disabledButton}
            className={classes.button}
            onClick={() => {
              updatePaymentPeriod();
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
