import React, {Component} from 'react';
import TextField from '@material-ui/core/TextField';
// import { Link } from 'react-router-dom';
import { withStyles } from "@material-ui/core/styles";
import DragDrop2 from '../components/DragDrop2';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  root: {
    margin:"15px",
    minWidth:"400px"
  },
  submitBtn : {
      padding:"10px",
      fontSize: "12px",
      minWidth : "135px"
  }
});

class NewProject extends Component{
    constructor(){
        super()
        this.state = {
            Invoice : [],
            Ledger : [],
            Statement : []
        }
        
    }
    // handleLanguage = (langValue) => {
    //     this.setState({language: langValue});
    // }
    handleComplete = ( type, files ) => {
        this.setState({[type]: files})
    }

    handleSubmit = async () => {
        //invoice
        const invoiceFiles = this.state.Invoice;
        const formData = new FormData();
        for (let i = 0; i < invoiceFiles.length; i++) {
            formData.append(`file`, invoiceFiles[i], invoiceFiles[i].name)
        };

        const result = await fetch(`/api/uploadinvoice`, {
            body: formData,
            method : 'post'
        });
        
        const json = await result.json();
        console.log(json.message);

        //statement
        const statementFiles = this.state.Statement;
        const formData2 = new FormData();
        for (let i = 0; i < statementFiles.length; i++) {
            formData2.append(`file`, statementFiles[i], statementFiles[i].name)
        };
        const result2 = await fetch(`/api/uploadstatement`, {
            body: formData2,
            method : 'post'
        });
    }
    handleSubmit2 = async() =>{
        const invoiceFiles = this.state.Invoice;
        const invoiceFormData = new FormData();
        for (let i = 0; i < invoiceFiles.length; i++) {
            invoiceFormData.append(`file`, invoiceFiles[i], invoiceFiles[i].name)
        };

        const ledgerFiles = this.state.Ledger;
        const ledgerFormData = new FormData();
        for (let i = 0; i < ledgerFiles.length; i++) {
            ledgerFormData.append(`file`, ledgerFiles[i], ledgerFiles[i].name)
        };

        const statementFiles = this.state.Statement;
        const statementFormData = new FormData();
        for (let i = 0; i < statementFiles.length; i++) {
            statementFormData.append(`file`, statementFiles[i], statementFiles[i].name)
        };

        let [res1, res2] = await Promise.all([
            fetch(`/api/uploadstatement`, {body: statementFormData, method: 'post'}).then(response => response.json()),
            fetch(`/api/uploadledger`, {body: ledgerFormData, method: 'post'}).then(response => response.json()),
        ]);

        console.log( res1 );
        console.log( res2 );
    }
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
                    <DragDrop2 type={"Invoice"} onComplete={this.handleComplete}/>
                </div>
                <div id="upload-bank">
                    <DragDrop2 type={"Statement"} onComplete={this.handleComplete}/>
                </div>
                <div id="upload-ledger">
                    <DragDrop2 type={"Ledger"} onComplete={this.handleComplete}/>
                </div>
                <Button onClick={this.handleSubmit2} variant="contained"  color="primary" className={classes.submitBtn}>Submit</Button>
                
                
            </>
        );
    }
}

export default withStyles(styles)(NewProject) ;