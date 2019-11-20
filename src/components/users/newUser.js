import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Query } from 'react-apollo';
import { query } from 'graphqurl';
import { GET_USER_TYPES } from '../../database/queries';
import { ADD_USER } from '../../database/mutations';

const styles = (theme) => ({
	paper: {
		padding: theme.spacing(5, 1),
		margin: theme.spacing(5, 5)
	},
	typography: {
		textAlign: 'center'
	},
	inputs: {
		width: '100%'
	},
	button: {
		float: 'right',
		margin: theme.spacing(2, 0),
		backgroundColor: '#ffc605',
		'&:hover': {
			backgroundColor: '#ffff00'
		}
	}
});

class NewUser extends Component {

	state = {
		user: {
			first_name: '',
			last_name: '',
			address: '',
			phone_number: '',
			email: '',
			user_type: 0
		},
		error: false,
	}

	getUserTypes() {
		return (
			<Query query={GET_USER_TYPES}>
				{({ loading, error, data }) => {
					if (loading) return 'Loading...';
					if (error) return console.log(error);
					if (data.users_type.length) {
						return data.users_type.map(({ id, name }) => (
							<option key={id} value={id}>
								{name}
							</option>
						));
					} else {
						return <option value="0">No hay tipos de usuarios para mostrar</option>;
					}
				}}
			</Query>
		);
	}

	async addUser() {
		const { first_name, last_name, address, phone_number, email, user_type } = this.state.user;
		if(first_name === '' || last_name === '' || address === '' || phone_number === '' || email === '' || user_type === 0) {
			this.setState({
				error: true
			});
			return;
		}
		const addUser = await query({
			query:ADD_USER,
			endpoint:'https://tfw-mazatlan.herokuapp.com/v1/graphql',
			headers: {
				'x-hasura-admin-secret': 'twfmazatlan'
			},
			variables: {
				first_name: first_name.trim(),
                last_name: last_name.trim(),
                address: address.trim(),
                phone_number: phone_number.trim(),
                email: email.trim(),
                user_type: user_type
			},
		});
		console.log(addUser);
	}

	render() {
		const { classes, error } = this.props;
		let response = (error)? <p>All fields are requireds</p> : '' ;
		return (
			<Paper className={classes.paper}>
				{response}
				<Typography variant="h5" className={classes.typography}>
					Add User
				</Typography>
				<Grid container justify="center">
					<Grid item xs={10} md={8} xl={8}>
						<TextField
							className={classes.inputs}
							required
							id="outlined-required"
							label="First Name"
							margin="normal"
							value={this.state.user.first_name}
                            variant="outlined"
                            onChange={e => {
                                this.setState({
                                    user: {
                                        ...this.state.user,
                                        first_name: e.target.value
                                    }
                                })
                            }}
						/>
					</Grid>
					<Grid item xs={10} md={8} xl={8}>
						<TextField
							className={classes.inputs}
							required
							id="outlined-required"
							label="Last Name"
							margin="normal"
							value={this.state.user.last_name}
							variant="outlined"
							onChange={e => {
                                this.setState({
                                    user: {
                                        ...this.state.user,
                                        last_name: e.target.value
                                    }
                                })
                            }}
						/>
					</Grid>
					<Grid item xs={10} md={8} xl={8}>
						<TextField
							className={classes.inputs}
							required
							id="outlined-required"
							label="Address"
							margin="normal"
							value={this.state.user.address}
							variant="outlined"
							onChange={e => {
                                this.setState({
                                    user: {
                                        ...this.state.user,
                                        address: e.target.value
                                    }
                                })
                            }}
						/>
					</Grid>
					<Grid item xs={10} md={8} xl={8}>
						<TextField
							className={classes.inputs}
							required
							id="outlined-required"
							label="Number Phone"
							margin="normal"
							value={this.state.user.phone_number}
							variant="outlined"
							onChange={e => {
                                this.setState({
                                    user: {
                                        ...this.state.user,
                                        phone_number: e.target.value
                                    }
                                })
                            }}
						/>
					</Grid>
					<Grid item xs={10} md={8} xl={8}>
						<TextField
							className={classes.inputs}
							required
							id="outlined-required"
							label="Email"
							margin="normal"
							value={this.state.user.email}
							variant="outlined"
							onChange={e => {
                                this.setState({
                                    user: {
                                        ...this.state.user,
                                        email: e.target.value
                                    }
                                })
                            }}
						/>
					</Grid>
					<Grid item xs={10} md={8} xl={8}>
						<TextField
							select
							label="User Type"
							className={classes.inputs}
							SelectProps={{
								native: true
							}}
							margin="normal"
							variant="outlined"
							value={this.state.user.user_type}
							onChange={e => {
                                this.setState({
                                    user: {
                                        ...this.state.user,
                                        user_type: e.target.value
                                    }
                                })
                            }}
						>
							<option value="0">
								Select a user type
							</option>
							{this.getUserTypes()}
						</TextField>
					</Grid>
					<Grid item xs={10} md={8} xl={8}>
						<Button variant="contained" className={classes.button} onClick={() => {this.addUser()}}>
							Save
						</Button>
					</Grid>
				</Grid>
			</Paper>
		);
	}
}

export default withStyles(styles)(NewUser);
