import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSubscription } from "@apollo/react-hooks";
import { GET_CLASSES_PRICE_PAYMENT_PERIOD_BY_CLASSES_PRICE_ID } from "../../database/queries";
import {
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardActionArea,
  Typography
} from "@material-ui/core";
import NotFound from "../notFound/notFound";

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
    height: "250px",
    overflowY: "auto",
    overflowX: "auto"
  },
  cardContent: {
    textAlign: "justify"
  },
  backButton: {
    marginRight: theme.spacing(1)
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  }
}));

export default function Step2(props) {
  const classes = useStyles();
  const selected = props.selected;
  const setSelected = props.setSelected;
  const selectedInformationState = props.selectedInformationState;
  const setSelectedInformationState = props.setSelectedInformationState;
  const classPriceId = props.classPriceState;
  const setPaymentPeriodState = props.setPaymentPeriodState;
  const userPaymentState = props.userPaymentState;
  const setUserPaymentState = props.setUserPaymentState;
  const setOriginalTotalState = props.setOriginalTotalState;
  const {
    data: classesPricePaymentPeriodData,
    loading: classesPricePaymentPeriodLoading,
    error: classesPricePaymentPeriodError
  } = useSubscription(GET_CLASSES_PRICE_PAYMENT_PERIOD_BY_CLASSES_PRICE_ID, {
    variables: {
      classesPriceId: classPriceId
    }
  });

  if (classesPricePaymentPeriodLoading) {
    return <CircularProgress />;
  }
  if (classesPricePaymentPeriodError) {
    return <NotFound />;
  }

  const getPaymentPeriods = () => {
    return classesPricePaymentPeriodData.classes_price_payment_period.map(
      (payment_period, index) => {
        return (
          <Grid item xs={12} md={6} lg={4} key={payment_period.id}>
            <CardActionArea
              onClick={() => {
                setSelected(selected === index ? -1 : index);
                setPaymentPeriodState({
                  id: payment_period.id,
                  days: payment_period.R_payment_period.days
                });
                setUserPaymentState({
                  ...userPaymentState,
                  total: payment_period.total
                });
                setOriginalTotalState(payment_period.total);
                setSelectedInformationState({
                  ...selectedInformationState,
                  specifications:
                    payment_period.specifications !== null &&
                    payment_period.specifications.trim() !== ""
                      ? payment_period.specifications
                      : "",
                  payment_period: payment_period.R_payment_period.period,
                  amount: payment_period.total,
                  persons: payment_period.persons
                });
              }}
            >
              <Card
                className={classes.cards}
                style={{
                  background: selected === index ? "#eeeeee" : "white",
                  border: selected === index ? "1px solid black" : ""
                }}
              >
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    className={classes.cardContent}
                  >
                    {payment_period.specifications !== null &&
                    payment_period.specifications.trim() !== "" ? (
                      <span>
                        <strong>Especificaciones: </strong>
                        {payment_period.specifications}
                      </span>
                    ) : null}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    className={classes.cardContent}
                  >
                    <strong>Periodo de pago: </strong>
                    {payment_period.R_payment_period.period}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    className={classes.cardContent}
                  >
                    <strong>Monto: </strong>${payment_period.total}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    className={classes.cardContent}
                  >
                    <strong>Número de personas: </strong>{payment_period.persons}
                  </Typography>
                </CardContent>
              </Card>
            </CardActionArea>
          </Grid>
        );
      }
    );
  };

  return <Grid container>{getPaymentPeriods()}</Grid>;
}
