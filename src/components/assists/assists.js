import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import {
  Card,
  Grid,
  CircularProgress,
  Toolbar,
  Typography
} from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";
import { ArrowBack as ArrowBackIcon } from "@material-ui/icons";
import { useQuery } from "@apollo/react-hooks";
import { GET_ASSISTS_BY_USER } from "../../database/queries";
import NotFound from "../notFound/notFound";

import "../../assets/css/calendarStyle.css";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2)
  },
  title: {
    flex: "1 1 80%"
  }
}));

const formatDate = date => {
  let correctMont =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  let correctDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${date.getFullYear()}-${correctMont}-${correctDay}`;
};

export default function Assists(props) {
  const userId = props.match.params.userId;
  const calendarComponentRef = useRef(null);
  const classes = useStyles();
  const now = new Date(Date.now());
  const [dateState, setDateState] = useState(formatDate(now));
  const [datePickerState, setDatePickerState] = useState(now.toLocaleDateString("en-US"));
  const {
    data: userAssistsData,
    loading: userAssistsLoading,
    error: userAssistsError
  } = useQuery(GET_ASSISTS_BY_USER, {
    variables: {
      userId
    }
  });

  if (userAssistsLoading) {
    return <CircularProgress />;
  }
  if (userAssistsError) {
    return <NotFound />;
  }
  if (!userAssistsData.users_data.length) {
    return <NotFound />;
  }
  if (userAssistsData.users_data[0].user_type !== 2) {
    return <NotFound />;
  }

  let events = [];
  userAssistsData.users_data[0].R_user_assists_aggregate.nodes.map(assist => {
    let date = new Date(assist.entry);
    let correctFormatDate = formatDate(date);
    return events.push({
      title: date.toLocaleTimeString(),
      date: correctFormatDate
    });
  });

  const handleDateChange = date => {
    setDatePickerState(date);
    setDateState(formatDate(date));
    let calendarApi = calendarComponentRef.current.getApi();
    calendarApi.gotoDate(formatDate(date));
  };

  return (
    <Card>
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          {userAssistsData.users_data.length
            ? `${userAssistsData.users_data[0].first_name} ${userAssistsData.users_data[0].last_name}´s`
            : ""}{" "}
          assists
          <Link to="/users">
            <ArrowBackIcon />
          </Link>
        </Typography>
        <Typography variant="h6">
          {`Total assists: ${userAssistsData.users_data[0].R_user_assists_aggregate.aggregate.count}`}
        </Typography>
      </Toolbar>
      <Grid container justify="center" className={classes.root}>
        <Grid item xs={12}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              format="dd/MM/yyyy"
              margin="normal"
              id="date-picker-inline"
              label="Select a day to check assists"
              value={datePickerState}
              onChange={handleDateChange}
              KeyboardButtonProps={{
                "aria-label": "change date"
              }}
            />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={12}>
          <FullCalendar
            ref={calendarComponentRef}
            defaultView="dayGridMonth"
            plugins={[dayGridPlugin]}
            events={events}
            defaultDate={dateState}
            eventTextColor="#FFFFFF"
            eventColor="#43a047"
          />
        </Grid>
      </Grid>
    </Card>
  );
}
