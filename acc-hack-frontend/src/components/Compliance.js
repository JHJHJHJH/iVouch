import React, {Component} from 'react';
import MUIDataTable from "mui-datatables";
import ProjectInfo from './ProjectInfo';
// import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

 
const options = {
  filterType: 'checkbox',
  setRowProps: row => { 
    // console.log(row)
    if (row[12].length < 1) {
      return {
        style: { background: "#ffe4b2" }
      };
    }
  }
};
 

class Compliance extends Component {
    constructor(props){
      super(props)
      this.state = {
          Header : [],
          Data : []
      }
    }
    
    componentDidMount(){
      try {

        const data = this.props.matchstatements;

        const headers = Object.keys( data[0] );
        // console.log(headers[j]);
        const columns = [];
        for (let j = 0; j < headers.length; j++) {

          if ( headers[j] != 'MatchedInvoices' && headers[j] != "isMatched" 
          && headers[j] != 'Invoice Number(s)'
          && headers[j] != 'Invoice Amount(s)'
          && headers[j] != 'Invoice Seller(s)'
          && headers[j] != 'Invoice Date(s)'){
            const obj =   {
              name: headers[j],
              selector: headers[j],
              sortable: true,
              right: true,
              minWidth:"50px",
              options: { 
                setCellProps: value => {
                  if( headers[j] === "Creditor" || headers[j] === "Debits"){
                    return { style: { borderRight: '1px solid lightgray' } }
                  }
                },
                
              }
            }
            columns.push( obj );
          }
        };
        const matchedInvoiceHead1 = {
          name: "Invoice Number(s)",
          selector: "Invoice Number(s)",
          sortable: true,
          right: true,
          minWidth:"50px"
        };
        const matchedInvoiceHead2 = {
          name: "Invoice Amount(s)",
          selector: "Invoice Amount(s)",
          sortable: true,
          right: true,
          minWidth:"50px"
        };
        const matchedInvoiceHead3 = {
          name: "Invoice Seller(s)",
          selector: "Invoice Seller(s)",
          sortable: true,
          right: true,
          minWidth:"50px"
        };
        const matchedInvoiceHead4 = {
          name: "Invoice Date(s)",
          selector: "Invoice Date(s)",
          sortable: true,
          right: true,
          minWidth:"50px"
        };
        columns.push( matchedInvoiceHead1 );
        columns.push( matchedInvoiceHead2 );
        columns.push( matchedInvoiceHead3 );
        columns.push( matchedInvoiceHead4 );
        
        for (let i = 0; i < data.length; i++) {
          data[i]["Invoice Number(s)"] = data[i]["MatchedInvoices"].map( el => el["Reference"]).join('\r\n ');
          data[i]["Invoice Amount(s)"] = data[i]["MatchedInvoices"].map( el => "$" + el["Credit"]).join('\r\n');
          data[i]["Invoice Seller(s)"] = data[i]["MatchedInvoices"].map( el => el["Creditor"]).join('\r\n ');
         
          data[i]["Invoice Date(s)"] = data[i]["MatchedInvoices"].map( el => el["Date"]).join('\r\n ');
          
          
        }
        
        this.setState({ Header: columns })
        this.setState({ Data: data})

      } catch (e) { 
        console.error(e);
      }
    }
    render() {
        return(
          <>
            <ProjectInfo info={this.props.info} project={this.props.project}/>
            <MUIDataTable
              title={"LEDGER ENTRIES | MATCHED STATEMENT ENTRIES | MATCHED INVOICES"}
              data={this.state.Data}
              columns={this.state.Header}
              options={options}
            />
          </>
  

        );
    }
};

export default Compliance;
  