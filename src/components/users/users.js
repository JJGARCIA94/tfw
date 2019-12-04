import React from "react";
import {
  Grid,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from "@material-ui/core";
import { Query } from "react-apollo";
import { GET_USERS } from "../../database/queries";

export default function Users() {
  const getUsers = () => {
    return (
      <Query query={GET_USERS}>
        {({ loading, error, data }) => {
          if (loading) return <CircularProgress />;
          if (error) return console.log(error);
          if (data.users_data.length) {
            return data.users_data.map(
              ({ id, first_name, last_name, R_user_type }) => (
                <Grid item xs={10} md={10} xl={10} lg={8} key={id}>
                  <Paper>
                    <List>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>{`${first_name[0]}${last_name[0]}`}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${first_name} ${last_name}`}
                          secondary={`${R_user_type.name}`}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
              )
            );
          } else {
            return (
              <Typography>No hay tipos de usuarios para mostrar</Typography>
            );
          }
        }}
      </Query>
    );
  };

  return (
    <Grid container justify="center">
      {getUsers()}
    </Grid>
  );
}
