import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, TextField } from "@material-ui/core";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
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
  }
}));

export default function Step3(props) {
  const classes = useStyles();
  const paymentPeriodState = props.paymentPeriodState;
  const userPaymentState = props.userPaymentState;
  const setUserPaymentState = props.setUserPaymentState;
  const originalTotal = props.originalTotalState;
  const payment_end = new Date(userPaymentState.payment_start);
  payment_end.setDate(payment_end.getDate() + paymentPeriodState.days);

  const handleDateChange = date => {
    setUserPaymentState({
      ...userPaymentState,
      payment_end: date.toLocaleDateString("en-US")
    });
  };

  return (
    <Grid container justify="center" className={classes.root}>
      <Grid item md={5} xs={10}>
        <TextField
          className={classes.textFields}
          required
          id="discount_percent"
          label="% de descuento"
          margin="normal"
          value={userPaymentState.discount_percent}
          inputProps={{
            maxLength: 3
          }}
          onKeyPress={e => {
            keyValidation(e, 2);
          }}
          onChange={e => {
            pasteValidation(e, 2);
            if(parseInt(e.target.value) > 100) {
              e.target.value = 100;
            }
            const porciento = e.target.value / 100;
            const total =  originalTotal - (originalTotal * porciento);
            setUserPaymentState({
              ...userPaymentState,
              discount_percent: e.target.value,
              total: total
            });
          }}
        />
      </Grid>
      <Grid item md={1} />
      <Grid item md={5} xs={10}>
        <TextField
          className={classes.textFields}
          disabled
          id="total"
          label="Total"
          margin="normal"
          value={userPaymentState.total}
          inputProps={{
            maxLength: 50
          }}
          onKeyPress={e => {
            keyValidation(e, 5);
          }}
        />
      </Grid>
      <Grid item md={5} xs={10}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            className={classes.textFields}
            disabled
            format="dd/MM/yyyy"
            margin="normal"
            id="payment_start"
            label="Fecha de pago"
            value={userPaymentState.payment_start}
            KeyboardButtonProps={{
              "aria-label": "change date"
            }}
          />
        </MuiPickersUtilsProvider>
      </Grid>
      <Grid item md={1} />
      <Grid item md={5} xs={10}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            className={classes.textFields}
            format="dd/MM/yyyy"
            margin="normal"
            id="payment_end"
            label="Próximo pago"
            value={userPaymentState.payment_end}
            KeyboardButtonProps={{
              "aria-label": "change date"
            }}
            onChange={handleDateChange}
            onAnimationEnd={() => {
              setUserPaymentState({
                ...userPaymentState,
                payment_end: payment_end.toLocaleDateString("en-US")
              });
            }}
          />
        </MuiPickersUtilsProvider>
      </Grid>
    </Grid>
  );
}
