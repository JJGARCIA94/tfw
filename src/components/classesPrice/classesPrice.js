import React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
  CircularProgress
} from "@material-ui/core";
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Restore as RestoreIcon,
  SportsKabaddi as SportsKabaddiIcon,
  MonetizationOn as MonetizationOnIcon
} from "@material-ui/icons";
import { useSubscription } from "@apollo/react-hooks";
import { GET_CLASSES_PRICE } from "../../database/queries";
import NotFound from "../notFound/notFound";

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
  }
}));

export default function ClassesPrice() {
  const classes = useStyles();
  const {
    data: classesPriceData,
    loading: classesPriceLoading,
    error: classesPriceError
  } = useSubscription(GET_CLASSES_PRICE);
  if (classesPriceLoading) {
    return <CircularProgress />;
  }
  if (classesPriceError) {
    return <NotFound />;
  }

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
                <IconButton>
                  <EditIcon style={{ color: "#FFC605" }} />
                </IconButton>
                <IconButton>
                  <SportsKabaddiIcon style={{ color: "black" }} />
                </IconButton>
                <IconButton>
                  <MonetizationOnIcon style={{ color: "#43A047" }} />
                </IconButton>
                <IconButton>
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
                    <strong>Name: </strong>
                    {class_price.name}
                  </span>
                ) : null}
              </Typography>
              <Typography variant="subtitle1" className={classes.cardContent}>
                <strong>Classes: </strong>
                {class_price.R_classes_price_details.map((aClass, index) => (
                  <span key={index}>{`${aClass.R_classes.name}${
                    class_price.R_classes_price_details.length !== index + 1
                      ? ","
                      : "."
                  } `}</span>
                ))}
              </Typography>
              <Typography variant="subtitle1" className={classes.cardContent}>
                <strong>Payments: </strong>
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

  return (
    <Grid container>
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
    </Grid>
  );
}
