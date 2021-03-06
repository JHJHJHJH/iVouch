import React, {Component} from 'react';
// import DataTable from 'react-data-table-component';
import MUIDataTable from "mui-datatables";
import ProjectInfo from './ProjectInfo';

function tempHeaders( headers ) {
  return ["Date","GL_account",  "Account_description", "Description", "Reference", "Entry_no.", "Debit", "Credit", "Debtor", "Creditor"];
}

class LedgerTable extends Component {
  constructor(props){
    super(props);
    this.state = {
        Header : [],
        Ledger : []
    }
  }

  componentDidMount(){
    try {
      const data = this.props.ledgers;
      
      const allheaders =[]
      for (let i = 0; i < data.length; i++) {
        const keys = Object.keys(data[i]);
        for (let j = 0; j < keys.length; j++) {
          if(! allheaders.includes(keys[j])){
            allheaders.push(keys[j]);
          }
        }
      }
      console.log(allheaders);
      const temp = tempHeaders(allheaders);
      const columns = temp.map( h =>  ({
        name: h,
        selector: h,
        sortable: true,
        right: true,
        minWidth:"200px"
      }));

      console.log(columns);
      console.log(data);
      this.setState({ Header: columns })
      this.setState({ Ledger: data})
    } catch (e) {
      console.error(e);
    }
  }
    
  render( ) {
      return (
          <>
            <ProjectInfo info={this.props.info} project={this.props.project}/>
            <MUIDataTable
                title="Ledger"
                columns={this.state.Header}
                data={this.state.Ledger}
                
                dense={true}
            />
          </>
      )
  }
}

export default LedgerTable;