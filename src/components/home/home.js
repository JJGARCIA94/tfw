import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import {
  Grid,
  Card,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@material-ui/core";
import { useQuery, useSubscription } from "@apollo/react-hooks";
import {
  GET_USER_BY_ID_AUTH,
  GET_USERS_PAYMENTS_EXPIRED,
  GET_USER_ASSISTS,
  GET_NEW_CLIENTS
} from "../../database/queries";
import NotFound from "../notFound/notFound";
import { Pie, Bar } from "react-chartjs-2";
const jwt = require("jsonwebtoken");

const useStyles = makeStyles(theme => ({
  items: {
    marginTop: "10px",
    marginBottom: "10px"
  },
  cards: {
    padding: "10px"
  },
  table: {
    height: "350px",
    overflowY: "auto"
  }
}));

const formatDate = date => {
  date = new Date(date);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  let correctMont =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  let correctDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${date.getFullYear()}-${correctMont}-${correctDay}`;
};

const formatDateWhitoutMinutes = date => {
  date = new Date(date);
  let correctMont =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  let correctDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${date.getFullYear()}-${correctMont}-${correctDay}`;
};

const formatDateExpired = date => {
  date = new Date(date);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  let correctMont =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  let correctDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${correctDay}/${correctMont}/${date.getFullYear()}`;
};

const dayOfWeek = date => {
  date = new Date(date);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date.getUTCDay();
};

const subDays = (date, days) => {
  date = new Date(date);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  date.setDate(date.getDate() - days);
  let correctMont =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  let correctDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${date.getFullYear()}-${correctMont}-${correctDay}`;
};

const sumDays = (date, days) => {
  date = new Date(date);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  date.setDate(date.getDate() + days);
  let correctMont =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  let correctDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${date.getFullYear()}-${correctMont}-${correctDay}`;
};

export default function Home(props) {
  const classes = useStyles();
  const now = Date.now();
  const weekDay = dayOfWeek(formatDateWhitoutMinutes(now)) !== 0 ? dayOfWeek(formatDateWhitoutMinutes(now)) : 7;
  const mondayDay = subDays(formatDateWhitoutMinutes(now), weekDay - 1);
  const [
    dialogDeleteUserToClassesState,
    setDialogDeleteUserToClassesState
  ] = useState({
    openDeleteUserToClassesDialog: false,
    tittleDeleteUserToClassesDialog: "",
    textDeleteUserToClassesDialog: "",
    idUserPaymentDialog: 0
  });
  const {
    openDeleteUserToClassesDialog,
    tittleDeleteUserToClassesDialog,
    textDeleteUserToClassesDialog,
    idUserPaymentDialog
  } = dialogDeleteUserToClassesState;
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
  const {
    data: userPaymentData,
    loading: userPaymentLoading,
    error: userPaymentError
  } = useSubscription(GET_USERS_PAYMENTS_EXPIRED, {
    variables: {
      now: formatDateWhitoutMinutes(now)
    }
  });
  const {
    data: userAssistsData,
    loading: userAssistsLoading,
    error: userAssistsError
  } = useSubscription(GET_USER_ASSISTS, {
    variables: {
      firstWeekDay: mondayDay,
      currentLastWeekDay: formatDateWhitoutMinutes(now)
    }
  });
  const {
    data: newClientsData,
    loading: newClientsLoading,
    error: newClientsError
  } = useSubscription(GET_NEW_CLIENTS, {
    variables: {
      firstWeekDay: mondayDay,
      currentLastWeekDay: formatDateWhitoutMinutes(now)
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

  if (userPaymentLoading || userAssistsLoading || newClientsLoading) {
    return <CircularProgress />;
  }

  if (userAuthError || userPaymentError || userAssistsError || newClientsError) {
    console.log(userAssistsError);
    return <NotFound />;
  }

  let currentWeekDays = [];
  let dataWeekDays = [];
  let dataNewClients = [];
  for (let x = 0; x < weekDay; x++) {
    currentWeekDays.push(sumDays(mondayDay, x));
  }
  for (let x = 0; x < userAssistsData.user_assists.length; x++) {
    dataWeekDays.push(formatDate(userAssistsData.user_assists[x].created));
  }
  for (let x = 0; x < newClientsData.users_data.length; x++) {
    dataNewClients.push(newClientsData.users_data[x].created);
  }

  const weekDaysPie = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo"
  ];
  let dataWeekDaysPie = [];
  let dataNewClientsPie = [];
  for (let x = 0; x < currentWeekDays.length; x++) {
    let count = 0;
    let countNewClients = 0;
    for (let y = 0; y < dataWeekDays.length; y++) {
      if (currentWeekDays[x] === dataWeekDays[y]) {
        count++;
      }
    }
    dataWeekDaysPie.push(count);
    for (let y = 0; y < dataNewClients.length; y++) {
      if (currentWeekDays[x] === dataNewClients[y]) {
        countNewClients++;
      }
    }
    dataNewClientsPie.push(countNewClients);
  }
  const backgroundColorsWeekDayPie = [
    "#448AFF",
    "#FFA000",
    "#000000",
    "#757575",
    "#689F38",
    "#795548"
  ];

  let currentWeekDaysPie = [];
  let currentDataWeekDaysPie = [];
  let currentDataNewClientsPie = [];
  let currentBackgroundColorsWeekDayPie = [];

  for (let x = 0; x < weekDay; x++) {
    currentWeekDaysPie.push(weekDaysPie[x]);
    currentDataWeekDaysPie.push(dataWeekDaysPie[x]);
    currentDataNewClientsPie.push(dataNewClientsPie[x]);
    currentBackgroundColorsWeekDayPie.push(backgroundColorsWeekDayPie[x]);
  }
  /*console.log(currentWeekDays);
  console.log(dataWeekDays);
  console.log(mondayDay);*/

  const data = {
    labels: currentWeekDaysPie,
    datasets: [
      {
        data: currentDataWeekDaysPie,
        backgroundColor: currentBackgroundColorsWeekDayPie
      }
    ]
  };

  const clientsDataPie = {
    labels: currentWeekDaysPie,
    datasets: [
      {
        data: currentDataNewClientsPie,
        backgroundColor: currentBackgroundColorsWeekDayPie
      }
    ]
  };

  const handleOpenDeleteUserToClassesDialog = userPaymentId => {
    setDialogDeleteUserToClassesState({
      openDeleteUserToClassesDialog: true,
      tittleDeleteUserToClassesDialog:
        "¿Desea dar de baja al cliente de esta(s) clase(s)?",
      textDeleteUserToClassesDialog:
        "Al dar de baja al usuario de esta(s) clase(s) ya no podrá ingresar a esta(s).",
      idUserPaymentDialog: userPaymentId
    });
  };

  const handleCloseDeleteUserToClassesDialog = agree => {
    if (agree) {
      console.log("se eliminara el id " + idUserPaymentDialog);
    }
    setDialogDeleteUserToClassesState({
      openDeleteUserToClassesDialog: false,
      tittleDeleteUserToClassesDialog: "",
      textDeleteUserToClassesDialog: "",
      idUserPaymentDialog: 0
    });
  };

  return userAuth ? (
    <Grid container justify="center">
      <Grid item xs={12} md={7} className={classes.items}>
        <Typography variant="h6">Clientes con pago vencido</Typography>
        <TableContainer component={Card} className={classes.table}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell align="right">Clase(s)</TableCell>
                <TableCell align="right">Vencimiento</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userPaymentData.users_payments.map(row => (
                <TableRow key={row.userPaymentId}>
                  <TableCell component="th" scope="row">
                    {`${row.R_users_data.first_name} ${row.R_users_data.last_name}`}
                  </TableCell>
                  <TableCell align="right">
                    {row.R_classes_price_payment_period.R_classes_price.R_classes_price_details.map(
                      (aClass, index) => (
                        <Typography key={index} variant="subtitle1">{`${
                          aClass.R_classes.name
                        }${
                          row.R_classes_price_payment_period.R_classes_price
                            .R_classes_price_details.length ===
                          index + 1
                            ? "."
                            : ","
                        } `}</Typography>
                      )
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {formatDateExpired(row.payment_end)}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      color="secondary"
                      variant="contained"
                      onClick={() => {
                        handleOpenDeleteUserToClassesDialog(row.userPaymentId);
                      }}
                      style={{ background: "#000000" }}
                    >
                      Dar de baja en clase(s)
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item md={1} />
      <Grid item xs={12} md={4} className={classes.items}>
        <Typography variant="h6">Visitas en la semana</Typography>
        <Card className={classes.cards} style={{ height: "350px" }}>
          <Pie data={data} options={{ maintainAspectRatio: false }} />
        </Card>
      </Grid>
      <Grid item xs={12} md={7} className={classes.items}>
        <Typography variant="h6">3 clases con mas miembros</Typography>
        <Card className={classes.cards} style={{ height: "350px" }}>
          <Bar data={data} options={{ maintainAspectRatio: false }} />
        </Card>
      </Grid>
      <Grid item md={1} />
      <Grid item xs={12} md={4} className={classes.items}>
        <Typography variant="h6">Clientes nuevos en la semana</Typography>
        <Card className={classes.cards} style={{ height: "350px" }}>
          <Pie data={clientsDataPie} options={{ maintainAspectRatio: false }} />
        </Card>
      </Grid>
      <Dialog
        open={openDeleteUserToClassesDialog}
        onClose={() => {
          handleCloseDeleteUserToClassesDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {tittleDeleteUserToClassesDialog}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {textDeleteUserToClassesDialog}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseDeleteUserToClassesDialog(false);
            }}
            color="primary"
          >
            No
          </Button>
          <Button
            onClick={() => {
              handleCloseDeleteUserToClassesDialog(true);
            }}
            color="primary"
            autoFocus
          >
            Sí
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  ) : (
    <Redirect to="/login" />
  );
}
