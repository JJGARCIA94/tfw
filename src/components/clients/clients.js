import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

const styles = (theme) => ({
    
  });

class Clients extends Component {

    constructor(props) {
        super(props);
        this.state = {
            first_name: '',
            last_name: '',
            adress: '',
            phone_number: '',
            email: ''
        };
    }

    render(){
        const { classes } = this.props;
        return (
            <Grid container>
                <Grid item xs={10} md={8} xl={8}>
                    <TextField
                        required
                        id="outlined-required"
                        label="Required"
                        defaultValue="Hello World"
                        margin="normal"
                        variant="outlined"
                    />
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(Clients);
