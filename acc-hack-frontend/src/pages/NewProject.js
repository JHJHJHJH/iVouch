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
            Statement : [],
            user: "",
            projectName: "",
            company:"",
            address1:"",
            address2:""
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

        this.setState({
            [name] : value
        })
    }
    
    handleComplete = ( type, files ) => {
        this.setState({[type]: files})
    }

    // handleSubmit = async () => {
    //     //invoice
    //     const invoiceFiles = this.state.Invoice;
    //     const formData = new FormData();
    //     for (let i = 0; i < invoiceFiles.length; i++) {
    //         formData.append(`file`, invoiceFiles[i], invoiceFiles[i].name)
    //     };

    //     const result = await fetch(`/api/uploadinvoice`, {
    //         body: formData,
    //         method : 'post'
    //     });
        
    //     const json = await result.json();
    //     console.log(json);
    // }
    // handleSubmit2 = async() =>{
    //     const invoiceFiles = this.state.Invoice;
    //     const invoiceFormData = new FormData();
    //     for (let i = 0; i < invoiceFiles.length; i++) {
    //         invoiceFormData.append(`file`, invoiceFiles[i], invoiceFiles[i].name)
    //     };

    //     const ledgerFiles = this.state.Ledger;
    //     const ledgerFormData = new FormData();
    //     for (let i = 0; i < ledgerFiles.length; i++) {
    //         ledgerFormData.append(`file`, ledgerFiles[i], ledgerFiles[i].name)
    //     };

    //     const statementFiles = this.state.Statement;
    //     const statementFormData = new FormData();
    //     for (let i = 0; i < statementFiles.length; i++) {
    //         statementFormData.append(`file`, statementFiles[i], statementFiles[i].name)
    //     };

    //     let [res1, res2] = await Promise.all([
    //         fetch(`/api/uploadstatement`, {body: statementFormData, method: 'post'}).then(response => response.json()),
    //         fetch(`/api/uploadledger`, {body: ledgerFormData, method: 'post'}).then(response => response.json()),
    //     ]);

    //     console.log( res1 );
    //     console.log( res2 );
    // }

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
        
        let [invoiceJson, statementJson, ledgerJson] = await Promise.all([
            fetch(`/api/uploadinvoice`, {body: invoiceformData, method: 'post'}).then(response => response.json()),
            fetch(`/api/uploadstatement`, {body: statementformData, method: 'post'}).then(response => response.json()),
            fetch(`/api/uploadledger`, {body: ledgerformData, method: 'post'}).then(response => response.json()),
        ]);
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

        //post to dynamodb
        await fetch(`/api/newproject`, {
                headers: {
                    'Accept': 'application/json',
                    "Content-Type" :"application/json"
                },
                body: JSON.stringify(obj),
                method : 'post'
            });
        // const data = await res.json();
        // console.log( data );
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
                    helperText="Project Name"
                    placeholder="Project Name"
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
                <Button onClick={this.handleSubmit3} variant="contained"  color="primary" className={classes.submitBtn}>Submit</Button>
                
                
            </>
        );
    }
}

export default withStyles(styles)(NewProject) ;