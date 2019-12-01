import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Typography, Paper, CircularProgress, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@material-ui/core';
import { Image as ImageIcon  } from '@material-ui/icons';
import { Query } from 'react-apollo';
import { GET_USERS } from '../../database/queries';

const styles = (theme) => ({});

class User extends Component {
	state = {
		user: {
			first_name: '',
			last_name: '',
			address: '',
			phone_number: '',
			email: '',
			user_type: 0
		},
		error: false
	};

	getUsers() {
		return (
			<Query query={GET_USERS}>
				{({ loading, error, data }) => {
					if (loading) return <CircularProgress />;
					if (error) return console.log(error);
					if (data.users_data.length) {
						return data.users_data.map(({ id, first_name }) => (
							<Grid item xs={10} md={10} xl={10} lg={8} key={id}>
								<Paper>
									<List>
										<ListItem>
											<ListItemAvatar>
												<Avatar>
													<ImageIcon />
												</Avatar>
											</ListItemAvatar>
											<ListItemText primary="Photos" secondary="Jan 9, 2014" />
										</ListItem>
									</List>
								</Paper>
							</Grid>
						));
					} else {
						return <Typography >No hay tipos de usuarios para mostrar</Typography>;
					}
				}}
			</Query>
		);
	}

	render() {
		const { classes } = this.props;
		return (
			<Grid container justify="center">
				{this.getUsers()}
			</Grid>
		);
	}
}

export default withStyles(styles)(User);
