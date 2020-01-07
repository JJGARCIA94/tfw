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
  DialogContentText,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Snackbar
} from "@material-ui/core";
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Restore as RestoreIcon,
  QueryBuilder as QueryBuilderIcon
} from "@material-ui/icons";
import { useSubscription, useMutation } from "@apollo/react-hooks";
import {
  GET_CLASSES,
  GET_MEMBERS_BY_CLASS,
  GET_MEMBERS_BY_CLASS_HISTORY
} from "../../database/queries";
import { CANCEL_CLASS, RESTORE_CLASS } from "../../database/mutations";
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
  typografyActions: {
    background: "#ebebeb",
    marginBottom: "10px",
    textAlign: "end"
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

export default function Lessons() {
  const classes = useStyles();
  const [dialogState, setDialogState] = useState({
    openDialog: false,
    tittleDialog: "",
    idDialog: 0,
    statusDialog: 0
  });
  const [dialogClassState, setDialogClassState] = useState({
    openClassDialog: false,
    tittleClassDialog: "",
    textClassDialog: "",
    idClassDialog: 0,
    statusClassDialog: 0
  });
  const [snackbarState, setSnackbarState] = useState({
    openSnackBar: false,
    vertical: "bottom",
    horizontal: "right",
    snackbarText: "",
    snackbarColor: ""
  });
  const { openDialog, tittleDialog, idDialog, statusDialog } = dialogState;
  const {
    openClassDialog,
    tittleClassDialog,
    textClassDialog,
    idClassDialog,
    statusClassDialog
  } = dialogClassState;
  const {
    vertical,
    horizontal,
    openSnackBar,
    snackbarText,
    snackbarColor
  } = snackbarState;
  const [
    updateClassStatusMutation,
    { loading: updateClassStatusLoading, error: updateClassStatusError }
  ] = useMutation(statusClassDialog === 0 ? CANCEL_CLASS : RESTORE_CLASS);
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
        <Grid item xs={12} md={6} lg={4} key={lesson.id}>
          <Card className={classes.cards}>
            <CardContent>
              <Typography className={classes.typografyActions}>
                <Link to={"/lesson/" + lesson.id}>
                  <IconButton title="Edit class">
                    <EditIcon className={classes.editIcon} />
                  </IconButton>
                </Link>
                <IconButton
                  title={lesson.status === 1 ? "Cancel class" : "Restore class"}
                  onClick={() => {
                    const newStatus = lesson.status === 1 ? 0 : 1;
                    handleOpenClassDialog(lesson.id, newStatus);
                  }}
                >
                  {lesson.status === 1 ? (
                    <CloseIcon className={classes.cancelIcon} />
                  ) : (
                    <RestoreIcon className={classes.restoreIcon} />
                  )}
                </IconButton>
              </Typography>
              <Typography variant="subtitle1" className={classes.cardTittle}>
                <strong>Name: </strong>
                {`${lesson.name} `}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Coach: </strong>
                {`${lesson.R_users_data.first_name} ${lesson.R_users_data.last_name} `}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Members: </strong>
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
                      handleOpenDialog(lesson.id, lesson.name, 1);
                    }
                  }}
                  title={
                    lesson.R_classes_details_aggregate.aggregate.count > 0
                      ? "See members of this class"
                      : null
                  }
                >{`${lesson.R_classes_details_aggregate.aggregate.count} members`}</span>
                <IconButton
                  title="See members history of this class"
                  onClick={() => {
                    handleOpenDialog(lesson.id, lesson.name, 0);
                  }}
                >
                  <QueryBuilderIcon />
                </IconButton>
              </Typography>
              <Typography variant="subtitle1" className={classes.cardContent}>
                <strong>Description: </strong>
                {lesson.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      );
    });
  };

  const handleOpenDialog = (classId, className, status) => {
    setDialogState({
      openDialog: true,
      tittleDialog:
        status === 1
          ? `${className} class members`
          : `${className} class members history`,
      idDialog: classId,
      statusDialog: status
    });
  };

  const handleOpenClassDialog = (classId, status) => {
    setDialogClassState({
      openClassDialog: true,
      tittleClassDialog:
        status === 0
          ? "Do you want to cancel this class?"
          : "Do you want to restore this class?",
      textClassDialog:
        status === 0
          ? "If you cancel this class all members  will be eject of this one and the class won't be available to clients."
          : "If you restore this class will be available to clients.",
      idClassDialog: classId,
      statusClassDialog: status
    });
  };

  const handleCloseDialog = () => {
    setDialogState({
      openDialog: false,
      tittleDialog: "",
      idDialog: 0,
      statusDialog: 0
    });
  };

  const handleCloseClassDialog = agree => {
    if (agree) {
      updateClassStatusMutation({
        variables: {
          classId: idClassDialog
        }
      });
      if (updateClassStatusLoading) return <CircularProgress />;
      if (updateClassStatusError) {
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText: "An error occurred",
          snackbarColor: "#d32f2f"
        });
        return;
      }
      setSnackbarState({
        ...snackbarState,
        openSnackBar: true,
        snackbarText:
          statusClassDialog === 1 ? "Class restored" : "Class canceled",
        snackbarColor: "#43a047"
      });
    }
    setDialogClassState({
      openClassDialog: false,
      tittleClassDialog: "",
      textClassDialog: "",
      idClassDialog: 0,
      statusClassDialog: 0
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
      <Grid item xs={12} md={6} lg={4}>
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
      {getClasses()}
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
          <Members classId={idDialog} status={statusDialog} />
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
      <Dialog
        open={openClassDialog}
        onClose={() => {
          handleCloseClassDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{tittleClassDialog}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {textClassDialog}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseClassDialog(false);
            }}
            color="primary"
          >
            Disagree
          </Button>
          <Button
            onClick={() => {
              handleCloseClassDialog(true);
            }}
            color="primary"
            autoFocus
          >
            Agree
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

function Members(props) {
  const {
    data: membersData,
    loading: membersLoading,
    error: membersError
  } = useSubscription(
    props.status === 1 ? GET_MEMBERS_BY_CLASS : GET_MEMBERS_BY_CLASS_HISTORY,
    {
      variables: {
        classId: props.classId
      }
    }
  );

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

  return membersData.classes_details.length ? (
    getMembers()
  ) : (
    <Typography variant="subtitle1">No members</Typography>
  );
}
