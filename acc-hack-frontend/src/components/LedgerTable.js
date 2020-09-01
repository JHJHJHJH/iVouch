import React, {Component} from 'react';
import DataTable from 'react-data-table-component';

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
      
      const headers = Object.keys(data[0]);

      const columns = headers.map( h =>  ({
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
          <DataTable
              title="Ledger"
              columns={this.state.Header}
              // data={this.state.Ledger}
              dense={true}
          />
      )
  }
}

export default LedgerTable;