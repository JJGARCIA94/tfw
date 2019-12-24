import React, { useState } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar
} from "@material-ui/core";
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Restore as RestoreIcon
} from "@material-ui/icons";
import { useSubscription } from "@apollo/react-hooks";
import { GET_CLASSES, GET_MEMBERS_BY_CLASS } from "../../database/queries";
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
    color: "blue",
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

export default function Lessons() {
  const classes = useStyles();
  const [dialogState, setDialogState] = useState({
    openDialog: false,
    tittleDialog: ""
  });
  const { openDialog, tittleDialog } = dialogState;
  const {
    data: classesData,
    loading: classesLoading,
    error: classesError
  } = useSubscription(GET_CLASSES);
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
                {`${lesson.name} `}
                <Link to={"/lesson/" + lesson.id}>
                  <IconButton title="Edit class">
                    <EditIcon className={classes.editIcon}/>
                  </IconButton>
                </Link>
                <IconButton title={lesson.status === 1 ? "Cancel class" : "Restore class"}>
                  {lesson.status === 1 ? (
                    <CloseIcon className={classes.cancelIcon} />
                  ) : (
                    <RestoreIcon className={classes.restoreIcon} />
                  )}
                </IconButton>
              </Typography>
              <Typography variant="subtitle1">
                {`${lesson.R_users_data.first_name} ${lesson.R_users_data.last_name} `}
                <span
                  style={{
                    cursor:
                      lesson.R_classes_details_aggregate.aggregate.count > 0
                        ? "pointer"
                        : "",
                    color:
                      lesson.R_classes_details_aggregate.aggregate.count > 0
                        ? "#43a047"
                        : "#d32f2f"
                  }}
                  onClick={() => {
                    if (
                      lesson.R_classes_details_aggregate.aggregate.count > 0
                    ) {
                      handleOpenDialog(lesson.name);
                    }
                  }}
                >{`- ${lesson.R_classes_details_aggregate.aggregate.count} members`}</span>
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

  const handleOpenDialog = className => {
    setDialogState({
      openDialog: true,
      tittleDialog: `${className} class members`
    });
  };

  const handleCloseDialog = () => {
    setDialogState({
      openDialog: false,
      tittleDialog: ""
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
                <AddCircleOutlineIcon className={classes.addIcon} />
              </IconButton>
            </Link>
          </CardContent>
        </Card>
      </Grid>
      <Dialog
        open={openDialog}
        onClose={() => {
          handleCloseDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{tittleDialog}</DialogTitle>
        <DialogContent dividers>
          <Members classId="5" />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseDialog();
            }}
            color="primary"
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

function Members(props) {
  const {
    data: membersData,
    loading: membersLoading,
    error: membersError
  } = useSubscription(GET_MEMBERS_BY_CLASS, {
    variables: {
      classId: props.classId
    }
  });

  if (membersLoading) {
    return <CircularProgress />;
  }
  if (membersError) {
    return <NotFound />;
  }

  const getMembers = () => {
    return membersData.classes_details.map((member, index) => {
      return (
        <List key={member.id}>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                {`${member.R_users_data.first_name[0].toUpperCase()}${member.R_users_data.last_name[0].toUpperCase()}`}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`${member.R_users_data.first_name} ${member.R_users_data.last_name}`}
              secondary={`${member.R_users_data.phone_number} - ${member.R_users_data.email}`}
            />
          </ListItem>
        </List>
      );
    });
  };

  return getMembers();
}
