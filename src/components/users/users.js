import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

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

	render() {
		const { classes } = this.props;
		return (
			<Typography variant="h5" className={classes.typography}>
				Users
			</Typography>
		);
	}
}

export default withStyles(styles)(User);
