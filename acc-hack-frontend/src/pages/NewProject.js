import React, {Component} from 'react';
import TextField from '@material-ui/core/TextField';
// import { Link } from 'react-router-dom';
import { withStyles } from "@material-ui/core/styles";
import DragDrop2 from '../components/DragDrop2';
import Button from '@material-ui/core/Button';
import { withRouter } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import LoadSpinner from '../components/LoadSpinner';

// import { Redirect } from "react-router-dom";
const styles = theme => ({
  root: {
    margin:"15px",
    minWidth:"400px"
  },
  submitBtn : {
      display: "inline",
      width: "20%",
      height: "20",
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
            Statement : [],
            user: "",
            projectName: "",
            company:"",
            address1:"",
            address2:"",
            projectError: false,
            projectHelper: "Project Name"
        }
        this.handleChange = this.handleChange.bind(this);
    }
    componentDidMount(){
        this.setState( { user: this.props.user});
    }
    
    handleChange(e){

        const target = e.target;
        const value = target.value;
        const name = target.name;
        if (name === "projectName" && this.props.projects.includes( value )){
            this.setState({
                ["projectError"] : true,
                ["projectHelper"]: "Project name exists, please use unique project name."
            });
        }
        else if ( name === "projectName" && !this.props.projects.includes( value )){
            this.setState({
                ["projectError"] : false,
                ["projectHelper"]: "Project Name"
            });
        }

        this.setState({
            [name] : value
        })
    }
    
    handleComplete = ( type, files ) => {
        this.setState({[type]: files})
    }

    handleSubmit = async () => {
        //invoice
        const result = await trackPromise( fetch('/api/projects', {
            headers: {
              'Accept': 'application/json',
              "Content-Type" :"application/json"
            },
            body: JSON.stringify({ username: "admin" }),
            method: 'post'
          }));
        const json = await result.json();
        console.log(json);
    }

    handleSubmit3 = async () => {
        //async submit invoice, ledger, statement
            //Invoice
        const invoiceFiles = this.state.Invoice;
        const invoiceformData = new FormData();
        for (let i = 0; i < invoiceFiles.length; i++) {
            invoiceformData.append(`file`, invoiceFiles[i], invoiceFiles[i].name)
        };
            //ledger
        const ledgerFiles = this.state.Ledger;
        const ledgerformData = new FormData();
        for (let i = 0; i < ledgerFiles.length; i++) {
            ledgerformData.append(`file`, ledgerFiles[i], ledgerFiles[i].name)
        };

        const statementFiles = this.state.Statement;
        const statementformData = new FormData();
        for (let i = 0; i < statementFiles.length; i++) {
            statementformData.append(`file`, statementFiles[i], statementFiles[i].name)
        };
        
        let [invoiceJson, statementJson, ledgerJson] = await trackPromise(Promise.all([
            fetch(`/api/uploadinvoice`, {body: invoiceformData, method: 'post'}).then(response => response.json()),
            fetch(`/api/uploadstatement`, {body: statementformData, method: 'post'}).then(response => response.json()),
            fetch(`/api/uploadledger`, {body: ledgerformData, method: 'post'}).then(response => response.json()),
        ]));
        console.log(invoiceJson);
        console.log(statementJson);
        console.log(ledgerJson);
        //package 3 responses with project info
        const obj = {
            "username": this.state.user,
            "projects": [
                {
                    "name": this.state.projectName,
                    "information" : {
                        "client": this.state.company,
                        "address1" : this.state.address1,
                        "address2" : this.state.address2
                    },
                    "invoices" : invoiceJson,
                    "statement" : statementJson,
                    "ledger": ledgerJson
                }
            ]
        }
        console.log( obj );
        console.log( "Submitting new project...");
        
        //post to dynamodb
        const res = await trackPromise( fetch(`/api/newproject`, {
                headers: {
                    'Accept': 'application/json',
                    "Content-Type" :"application/json"
                },
                body: JSON.stringify(obj),
                method : 'post'
            }));
        
        if ( res.status === 200){
            this.props.history.push('/');
        }
        else {
            console.log("An error has occured.");
        }
        
    };

    render(){

        const { classes } = this.props;

        return(
            <>
                <h1>Add New Project</h1>
                <div>
                <TextField
                    className={classes.root}
                    id="outlined-required"
                    helperText={this.state.projectHelper}
                    placeholder="Project Name"
                    error = {this.state.projectError}
                    variant="outlined"
                    name="projectName"
                    onChange={this.handleChange}
                    
                />
                </div>
                <div>
                <TextField
                    className={classes.root}
                    id="outlined-required"
                    helperText="Company Name"
                    placeholder="Company Name"
                    variant="outlined"
                    name="company"
                    onChange={this.handleChange}
                />
                </div>
                <div>
                <TextField
                    className={classes.root}
                    id="outlined-required"
                    helperText="Address #1"
                    placeholder="Address #1"
                    variant="outlined"
                    name="address1"
                    onChange={this.handleChange}
                />
                <TextField
                    className={classes.root}
                    id="outlined-required"
                    helperText="Address #2"
                    placeholder="Address #2"
                    variant="outlined"
                    name="address2"
                    onChange={this.handleChange}
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
                <div>
                    <LoadSpinner/>
                    <Button 
                    onClick={this.handleSubmit3} 
                    variant="contained"  
                    color="primary" 
                    className={classes.submitBtn}>
                        Submit</Button>
                </div>
                
                
            </>
        );
    }
}

export default withRouter(withStyles(styles)(NewProject)) ;