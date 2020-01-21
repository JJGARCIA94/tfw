import React, { useState } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Snackbar,
  Divider
} from "@material-ui/core";
import {
  ArrowBack as ArrowBackIcon,
  AddCircle as AddCircleIcon
} from "@material-ui/icons";
import { useSubscription } from "@apollo/react-hooks";
import { GET_USER_PAYMENTS_BY_USER_ID } from "../../database/queries";
import NotFound from "../notFound/notFound";

const useStyles = makeStyles(theme => ({
  cards: {
    margin: "10px",
    height: "250px",
    overflowY: "auto",
    overflowX: "auto"
  },
  cardContent: {
    textAlign: "justify"
  },
  typografyActions: {
    background: "#ebebeb",
    marginBottom: "10px",
    textAlign: "end"
  }
}));

const formatDate = date => {
  date = new Date(date);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  let correctMont =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  let correctDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${correctDay}/${correctMont}/${date.getFullYear()}`;
};

const formatDateComparation = date => {
  date = new Date(date);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date;
};

export default function UserPayments(props) {
  const userId = props.match.params.userId;
  const classes = useStyles();
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
    data: userPaymentsData,
    loading: userPaymentsLoading,
    error: userPaymentsError
  } = useSubscription(GET_USER_PAYMENTS_BY_USER_ID, {
    variables: {
      userId: userId
    }
  });
  if (userPaymentsLoading) {
    return <CircularProgress />;
  }
  if (userPaymentsError) {
    return <NotFound />;
  }

  const getUserPayments = () => {
    return userPaymentsData.users_payments.map(usersPayment => {
      const paymentEnd = formatDateComparation(usersPayment.payment_end);
      const now = formatDateComparation(Date.now());
      const nowIn7Days = formatDateComparation(Date.now());
      nowIn7Days.setDate(nowIn7Days.getDate() + 7);
      return (
        <Grid item xs={12} md={6} lg={4} key={usersPayment.id}>
          <Card
            className={classes.cards}
            style={{
              border:
                paymentEnd <= now
                  ? "#d32f2f solid 1px"
                  : paymentEnd <= nowIn7Days
                  ? "#FF9800 solid 1px"
                  : "#43a047 solid 1px"
            }}
          >
            <CardContent>
              {paymentEnd <= now ? (
                <Typography
                  variant="h5"
                  style={{
                    color: "#d32f2f",
                    textAlign: "center",
                    marginBottom: "10px"
                  }}
                >
                  Pago vencido
                </Typography>
              ) : paymentEnd <= nowIn7Days ? (
                <Typography
                  variant="h5"
                  style={{
                    color: "#FF9800",
                    textAlign: "center",
                    marginBottom: "10px"
                  }}
                >
                  Pago próximo a vencer
                </Typography>
              ) : null}
              <Typography>
                <strong>Clase(s): </strong>
                {usersPayment.R_classes_price_payment_period.R_classes_price.R_classes_price_details.map(
                  (classDetail, index) => (
                    <span key={index}>{`${classDetail.R_classes.name}${
                      usersPayment.R_classes_price_payment_period
                        .R_classes_price.R_classes_price_details.length !==
                      index + 1
                        ? `,`
                        : `.`
                    } `}</span>
                  )
                )}
              </Typography>
              <Typography>
                <strong>Pago: </strong>
                {`${usersPayment.R_classes_price_payment_period.R_payment_period.period}`}
              </Typography>
              <Typography>
                <strong>Descuento: </strong>
                {`${usersPayment.discount_percent}%`}
              </Typography>
              <Typography>
                <strong>Total: </strong>
                {`$${usersPayment.total}`}
              </Typography>
              <Typography>
                <strong>Periodo de pago: </strong>
                {`${formatDate(usersPayment.payment_start)} - ${formatDate(
                  usersPayment.payment_end
                )}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      );
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
      <Grid item xs={12}>
        <Typography variant="h6">
          <Link to={`/users`}>
            <ArrowBackIcon />
          </Link>
          Pagos de usuario{" "}
          <Link to={`/newUserPayment/` + userId}>
            <AddCircleIcon />
          </Link>
        </Typography>
        <Divider />
      </Grid>
      {getUserPayments()}
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
