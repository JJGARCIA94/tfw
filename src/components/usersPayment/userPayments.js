import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Snackbar,
  Divider,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField
} from "@material-ui/core";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";
import es from "date-fns/locale/es";
import DateFnsUtils from "@date-io/date-fns";
import {
  ArrowBack as ArrowBackIcon,
  AddCircle as AddCircleIcon,
  Update as UpdateIcon,
  Cancel as CancelIcon
} from "@material-ui/icons";
import { useSubscription, useMutation } from "@apollo/react-hooks";
import {
  GET_USER_PAYMENTS_BY_USER_ID,
  GET_CLASSES_DETAILS_BY_USER_PAYMENTS_ID
} from "../../database/queries";
import NotFound from "../notFound/notFound";
import { keyValidation, pasteValidation } from "../../helpers/helpers";
import moment from "moment";
import gql from "graphql-tag";

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
  },
  textFields: {
    width: "100%"
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

const formatDateWhitoutMinutes = date => {
  date = new Date(date);
  return date;
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
  const [dialogStateRenovate, setDialogStateRenovate] = useState({
    openDialogRenovate: false,
    tittleDialogRenovate: ""
  });
  const [dialogStateCancel, setDialogStateCancel] = useState({
    openDialogCancel: false,
    tittleDialogCancel: "",
    textDialogCancel: ""
  });
  const { openDialogRenovate, tittleDialogRenovate } = dialogStateRenovate;
  const {
    openDialogCancel,
    tittleDialogCancel,
    textDialogCancel
  } = dialogStateCancel;
  const now = new Date(moment());
  const [userPaymentState, setUserPaymentState] = useState({
    discount_percent: 0,
    total: 0,
    payment_start: now.toLocaleDateString("en-US"),
    payment_end: now.toLocaleDateString("en-US"),
    payment_type: 0
  });
  const [totalOriginal, setTotalOriginal] = useState(0);
  const [userPaymentId, setUserPaymentId] = useState(0);
  const [paymentPeriodId, setPaymentPeriodId] = useState(0);
  const [classesDetails, setClassesDetails] = useState("");
  const ADD_USER_PAYMENT = gql`
  mutation add_user_payment(
    $userId: Int!
    $classesPricePaymentPeriodId: Int!
    $discountPercent: numeric!
    $total: numeric!
    $paymentStart: date!
    $paymentEnd: date!
    $paymentType: Int!
    $userPaymentId: bigint!
  ) {
    insert_users_payments(
      objects: {
        user_id: $userId
        classes_price_payment_period_id: $classesPricePaymentPeriodId
        discount_percent: $discountPercent
        total: $total
        payment_start: $paymentStart
        payment_end: $paymentEnd
        payment_type: $paymentType
        R_classes_details: {
          data: [${classesDetails}]
        }
      }
    ) {
      returning {
        id
      }
    }
    update_classes_details(where: {user_payment_id: {_eq: $userPaymentId}}, _set: {
      status: 0
    }) {
      affected_rows
    }
    update_users_payments(where: {id: {_eq: $userPaymentId}}, _set: {
      status: 0
    }) {
      affected_rows
    }
  }
`;
  const CANCEL_USER_PAYMENT = gql`
    mutation cancel_user_payment($userPaymentId: bigint!) {
      update_classes_details(
        where: { user_payment_id: { _eq: $userPaymentId } }
        _set: { status: 0 }
      ) {
        affected_rows
      }
      update_users_payments(
        where: { id: { _eq: $userPaymentId } }
        _set: { status: 0 }
      ) {
        affected_rows
      }
    }
  `;
  const [
    addUserPaymentMutation,
    {
      loading: addUserPaymentMutationLoading,
      error: addUserPaymentMutationError
    }
  ] = useMutation(ADD_USER_PAYMENT);
  const [
    cancelUserPaymentMutation,
    {
      loading: cancelUserPaymentMutationLoading,
      error: cancelUserPaymentMutationError
    }
  ] = useMutation(CANCEL_USER_PAYMENT);
  const {
    data: userPaymentsData,
    loading: userPaymentsLoading,
    error: userPaymentsError
  } = useSubscription(GET_USER_PAYMENTS_BY_USER_ID, {
    variables: {
      userId: userId
    }
  });
  const {
    data: classesDetailData,
    loading: classesDetailLoading,
    error: classesDetailError
  } = useSubscription(GET_CLASSES_DETAILS_BY_USER_PAYMENTS_ID, {
    variables: {
      userPaymentId: userPaymentId
    }
  });

  useEffect(() => {
    if (classesDetailData) {
      let classDetailsQuery = "";
      for (let x = 0; x < classesDetailData.classes_details.length; x++) {
        classDetailsQuery += `{class_id: ${classesDetailData.classes_details[x].class_id},user_id: ${userId}},`;
      }
      setClassesDetails(classDetailsQuery);
    }
  }, [classesDetailData, userId]);

  if (userPaymentsLoading || classesDetailLoading) {
    return <CircularProgress />;
  }
  if (userPaymentsError || classesDetailError) {
    return <NotFound />;
  }

  const handleOpenDialogRenovate = () => {
    setDialogStateRenovate({
      openDialogRenovate: true,
      tittleDialogRenovate: "Renovación de pago de clase o paquete"
    });
  };

  const handleCloseDialogRenovate = agree => {
    if (agree) {
      addUserPaymentMutation({
        variables: {
          userId: userId,
          classesPricePaymentPeriodId: paymentPeriodId,
          discountPercent: parseInt(userPaymentState.discount_percent),
          total: userPaymentState.total,
          paymentStart: userPaymentState.payment_start,
          paymentEnd: userPaymentState.payment_end,
          paymentType: userPaymentState.payment_type,
          userPaymentId: userPaymentId
        }
      });

      if (addUserPaymentMutationLoading) return <CircularProgress />;
      if (addUserPaymentMutationError) {
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
        snackbarText: "Pago de usuario renovado",
        snackbarColor: "#43a047"
      });
    }
    setDialogStateRenovate({
      openDialogRenovate: false,
      tittleDialogRenovate: ""
    });
  };

  const handleOpenDialogCancel = () => {
    setDialogStateCancel({
      openDialogCancel: true,
      tittleDialogCancel: "¿Está seguro de cancelar el pago?",
      textDialogCancel:
        "Al cancelar el pago se quitará de la(s) clase(s) al cliente."
    });
  };

  const handleCloseDialogCancel = agree => {
    if (agree) {
      cancelUserPaymentMutation({
        variables: {
          userPaymentId: userPaymentId
        }
      });

      if (cancelUserPaymentMutationLoading) return <CircularProgress />;
      if (cancelUserPaymentMutationError) {
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
        snackbarText: "Pago de usuario cancelado",
        snackbarColor: "#43a047"
      });
    }
    setDialogStateCancel({
      openDialogCancel: false,
      tittleDialogCancel: "",
      textDialogCancel: ""
    });
  };

  const getUserPayments = () => {
    return userPaymentsData.users_payments.length > 0 ? (
      userPaymentsData.users_payments.map(usersPayment => {
        const paymentEnd = formatDateComparation(usersPayment.payment_end);
        const now = formatDateWhitoutMinutes(Date.now());
        const nowIn7Days = formatDateWhitoutMinutes(Date.now());
        nowIn7Days.setDate(nowIn7Days.getDate() + 7);
        return (
          <Grid item xs={12} md={6} lg={4} key={usersPayment.id}>
            <Card
              className={classes.cards}
              style={{
                border:
                  paymentEnd <= now || usersPayment.status === 0
                    ? "#d32f2f solid 1px"
                    : paymentEnd <= nowIn7Days
                    ? "#FF9800 solid 1px"
                    : "#43a047 solid 1px"
              }}
            >
              <CardContent>
                {paymentEnd <= now || usersPayment.status === 0 ? (
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
                ) : (
                  <Typography
                    variant="h5"
                    style={{
                      color: "#43a047",
                      textAlign: "center",
                      marginBottom: "10px"
                    }}
                  >
                    Pago activo
                  </Typography>
                )}
                {usersPayment.status === 0 || paymentEnd <= now ? (
                  <Tooltip title="Renovar pago">
                    <IconButton
                      style={{ float: "right" }}
                      onClick={() => {
                        handleOpenDialogRenovate();
                        setUserPaymentId(usersPayment.id);
                        const paymentEnd = new Date(
                          now.toLocaleDateString("en-US")
                        );
                        const periodDays =
                          usersPayment.R_classes_price_payment_period
                            .R_payment_period.days;
                        paymentEnd.setDate(paymentEnd.getDate() + periodDays);
                        setUserPaymentState({
                          ...userPaymentState,
                          total: usersPayment.total,
                          discount_percent: usersPayment.discount_percent,
                          payment_type: usersPayment.payment_type,
                          payment_end: paymentEnd.toLocaleDateString("en-US")
                        });
                        setTotalOriginal(usersPayment.total);
                        setPaymentPeriodId(
                          usersPayment.R_classes_price_payment_period.id
                        );
                      }}
                    >
                      <UpdateIcon style={{ color: "black" }} />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Cancelar pago">
                    <IconButton
                      style={{ float: "right" }}
                      onClick={() => {
                        handleOpenDialogCancel();
                        setUserPaymentId(usersPayment.id);
                      }}
                    >
                      <CancelIcon color="secondary" />
                    </IconButton>
                  </Tooltip>
                )}
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
                  <strong>Tipo de pago: </strong>
                  {usersPayment.payment_type === 0 ? "Efectivo" : "Crédito"}
                </Typography>
                <Typography>
                  <strong>Período de pago: </strong>
                  {`${formatDate(usersPayment.payment_start)} - ${formatDate(
                    usersPayment.payment_end
                  )}`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })
    ) : (
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h6" style={{ textAlign: "center", marginTop: "15px" }}>
            No hay pagos aún
          </Typography>
        </Grid>
      </Grid>
    );
  };

  const handleCloseSnackbar = () => {
    setSnackbarState({
      ...snackbarState,
      openSnackBar: false,
      snackbarText: "",
      snackbarColor: ""
    });
  };

  const handleDateChange = date => {
    setUserPaymentState({
      ...userPaymentState,
      payment_end: date.toLocaleDateString("en-US")
    });
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h6">
          <Tooltip title="Regresar">
            <Link to={`/users`}>
              <ArrowBackIcon />
            </Link>
          </Tooltip>
          Pagos de usuario{" "}
          <Tooltip title="Agregar pago">
            <Link to={`/newUserPayment/` + userId}>
              <AddCircleIcon />
            </Link>
          </Tooltip>
        </Typography>
        <Divider />
      </Grid>
      {getUserPayments()}
      <Dialog
        open={openDialogRenovate}
        onClose={() => {
          handleCloseDialogRenovate(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {tittleDialogRenovate}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container justify="center" spacing={3}>
            <Grid item md={4} xs={12}>
              <TextField
                className={classes.textFields}
                required
                id="discount_percent"
                label="% de descuento"
                margin="normal"
                inputProps={{
                  maxLength: 3
                }}
                value={userPaymentState.discount_percent}
                onKeyPress={e => {
                  keyValidation(e, 2);
                }}
                onChange={e => {
                  pasteValidation(e, 2);
                  if (parseInt(e.target.value) > 100) {
                    e.target.value = 100;
                  }
                  const porciento = e.target.value / 100;
                  const total = totalOriginal - totalOriginal * porciento;
                  setUserPaymentState({
                    ...userPaymentState,
                    discount_percent: e.target.value,
                    total: total
                  });
                }}
              />
            </Grid>
            <Grid item md={4} xs={12}>
              <TextField
                className={classes.textFields}
                disabled
                id="total"
                label="Total"
                margin="normal"
                inputProps={{
                  maxLength: 50
                }}
                value={userPaymentState.total}
                onKeyPress={e => {
                  keyValidation(e, 5);
                }}
              />
            </Grid>
            <Grid item md={4} xs={12}>
              <TextField
                className={classes.textFields}
                select
                SelectProps={{
                  native: true
                }}
                required
                id="tipo_pago"
                label="Tipo de pago"
                margin="normal"
                value={userPaymentState.payment_type}
                onChange={e => {
                  setUserPaymentState({
                    ...userPaymentState,
                    payment_type: e.target.value
                  });
                }}
              >
                <option value={0}>Efectivo</option>
                <option value={1}>Tarjeta de crédito</option>
              </TextField>
            </Grid>
            <Grid item md={6} xs={12}>
              <MuiPickersUtilsProvider utils={DateFnsUtils} locale={es}>
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
            <Grid item md={6} xs={12}>
              <MuiPickersUtilsProvider utils={DateFnsUtils} locale={es}>
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
                  onKeyDown={e => {
                    e.preventDefault();
                  }}
                />
              </MuiPickersUtilsProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseDialogRenovate(false);
            }}
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              handleCloseDialogRenovate(true);
            }}
            color="primary"
            autoFocus
          >
            Renovar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDialogCancel}
        onClose={() => {
          handleCloseDialogCancel(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{tittleDialogCancel}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {textDialogCancel}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseDialogCancel(false);
            }}
            color="primary"
          >
            No
          </Button>
          <Button
            onClick={() => {
              handleCloseDialogCancel(true);
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
    </Grid>
  );
}
