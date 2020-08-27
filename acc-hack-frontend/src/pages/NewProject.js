import React, {Component} from 'react';
import TextField from '@material-ui/core/TextField';
// import { Link } from 'react-router-dom';
import { withStyles } from "@material-ui/core/styles";
import DragDrop from '../components/DragDrop';

const styles = theme => ({
  root: {
    margin:"15px",
    minWidth:"400px"
  }
});
class NewProject extends Component{

    
    render(){

        const { classes } = this.props;

        return(
            <>
                <h1>Add New Project</h1>
                <div>
                <TextField
                    className={classes.root}
                    id="outlined-required"
                    label="Project Name"
                    defaultValue="Project Name"
                    variant="outlined"
                    
                />
                </div>
                <div>
                <TextField
                    className={classes.root}
                    id="outlined-required"
                    label="Company Name"
                    defaultValue="Company Name"
                    variant="outlined"
                />
                </div>
                <div>
                <TextField
                    className={classes.root}
                    id="outlined-required"
                    label="Address #1"
                    defaultValue="Address #1"
                    variant="outlined"
                />
                <TextField
                    className={classes.root}
                    id="outlined-required"
                    label="Address #2"
                    defaultValue="Address #2"
                    variant="outlined"
                />
                </div>
                <h2>Upload Files</h2>
                <div id="upload-invoice">
                    <DragDrop type={"Invoice"}/>
                </div>
                <div id="upload-bank">
                    <DragDrop type={"Bank Statement"}/>
                </div>
                <div id="upload-ledger">
                    <DragDrop type={"Ledger"}/>
                </div>
                
                
                
            </>
        );
    }
}

export default withStyles(styles)(NewProject) ;