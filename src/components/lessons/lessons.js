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
import { AddCircleOutline as AddCircleOutlineIcon } from "@material-ui/icons";
import { useQuery } from "@apollo/react-hooks";
import { GET_CLASSES } from "../../database/queries";
import NotFound from "../notFound/notFound";

const useStyles = makeStyles(theme => ({
  cards: {
    margin: "10px",
    height: "200px",
    overflowY: "scroll"
  },
  cardAdd: {
    padding: theme.spacing(3, 2),
    margin: "10px",
    textAlign: "center",
    height: "200px"
  },
  cardTittle: {
    textAlign: "left"
  },
  cardContent: {
    textAlign: "justify"
  },
  icon: {
    color: "blue",
    fontSize: 100
  }
}));

export default function Lessons() {
  const classes = useStyles();
  const {
    data: classesData,
    loading: classesLoading,
    error: classesError
  } = useQuery(GET_CLASSES);
  if (classesLoading) {
    return <CircularProgress />;
  }
  if (classesError) {
    return <NotFound />;
  }

  const getClasses = () => {
    return classesData.classes.map(lesson => {
      return (
        <Grid item xs={12} md={3} lg={3} key={lesson.id}>
          <Card className={classes.cards}>
            <CardContent>
              <Typography variant="h4" className={classes.cardTittle}>
                {lesson.name}
              </Typography>
              <Typography variant="h6" className={classes.cardContent}>
                {lesson.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      );
    });
  };

  return (
    <Grid container>
      {getClasses()}
      <Grid item xs={12} md={3} lg={3}>
        <Card className={classes.cardAdd}>
          <CardContent>
            <Link to="/newLesson">
            <IconButton>
              <AddCircleOutlineIcon className={classes.icon} />
            </IconButton>
            </Link>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
