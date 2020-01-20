import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Card, CardContent, Typography } from "@material-ui/core";

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
    overflowY: "auto",
    overflowX: "auto"
  },
  cardContent: {
    textAlign: "justify"
  }
}));

const formatDate = date => {
    date = new Date(date);
    let correctMont =
      date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    let correctDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    return `${correctDay}/${correctMont}/${date.getFullYear()}`;
  };

export default function Step4(props) {
  const classes = useStyles();
  const userNameData = props.userNameData;
  const selectedInformationState = props.selectedInformationState;
  const userPaymentState = props.userPaymentState;

  const getPaymentInformation = () => {
    return (
      <Grid item xs={12} md={6} lg={4}>
        <Card
          className={classes.cards}
          style={{
            background: "white",
            border: "1px solid black"
          }}
        >
          <CardContent>
          <Typography variant="subtitle1" className={classes.cardContent}>
              <strong>Cliente: </strong> {`${userNameData.users_data[0].first_name} ${userNameData.users_data[0].last_name}`}
            </Typography>
            {selectedInformationState.package_name !== "" &&
            selectedInformationState.package_name !== null ? (
              <Typography variant="subtitle1" className={classes.cardContent}>
                <strong>Nombre de paquete: </strong>{selectedInformationState.package_name}
              </Typography>
            ) : null}
            {selectedInformationState.specifications !== "" &&
            selectedInformationState.specifications !== null ? (
              <Typography variant="subtitle1" className={classes.cardContent}>
                <strong>Especificaciones: </strong>{selectedInformationState.specifications}
              </Typography>
            ) : null}
            <Typography variant="subtitle1" className={classes.cardContent}>
              <strong>Clase(s): </strong>
              {selectedInformationState.classes.map((aClass, index) => (
               <span key={index}>{`${aClass}`}</span>   
              ))}
            </Typography>
            <Typography variant="subtitle1" className={classes.cardContent}>
              <strong>Periodo de pago: </strong> {selectedInformationState.payment_period}
            </Typography>
            <Typography variant="subtitle1" className={classes.cardContent}>
              <strong>Subtotal: </strong>${selectedInformationState.amount}
            </Typography>
            <Typography variant="subtitle1" className={classes.cardContent}>
              <strong>Descuento: </strong>{parseInt(userPaymentState.discount_percent)}%
            </Typography>
            <Typography variant="subtitle1" className={classes.cardContent}>
              <strong>Total: </strong>${userPaymentState.total}
            </Typography>
            <Typography variant="subtitle1" className={classes.cardContent}>
              <strong>Fecha de pago: </strong>{formatDate(userPaymentState.payment_start)}
            </Typography>
            <Typography variant="subtitle1" className={classes.cardContent}>
              <strong>Próximo pago: </strong>{formatDate(userPaymentState.payment_end)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Grid container justify="center">
      {getPaymentInformation()}
    </Grid>
  );
}
