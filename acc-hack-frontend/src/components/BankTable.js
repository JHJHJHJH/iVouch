import React, {Component} from 'react';
import MUIDataTable from "mui-datatables";
import ProjectInfo from './ProjectInfo';


function tempHeaders( headers ) {
  return ["Bank", "Account_Number", "Transaction_Date", "Value_Date", "Debits", "Credits", "Running_Balance"];
}

class BankTable extends Component {
    constructor(props){
      super(props);
      this.state = {
          Header : [],
          Statement : []
      }
    }

    componentDidMount(){
      try {
        const data = this.props.statements;
        
        const allheaders =[]
        for (let i = 0; i < data.length; i++) {
          const keys = Object.keys(data[i]);
          
          for (let j = 0; j < keys.length; j++) {
            if(! allheaders.includes(keys[j])){
              allheaders.push(keys[j]);
            }
          }
        }
        
        const temp = tempHeaders( allheaders );
        
        const columns = temp.map( h => ({
          name: h,
          selector: h,
          sortable: true,
          right: true,
          minWidth:"200px"
        }));

        // console.log(columns);
        // console.log(data);
        this.setState({ Header: columns })
        this.setState({ Statement: data})
      } catch (e) {
        console.error(e);
      }
    }

    render( ) {
        return (
          <>
            <ProjectInfo info={this.props.info} project={this.props.project}/>
            <MUIDataTable
                title="Bank Statement"
                columns={this.state.Header}
                data={this.state.Statement}
                dense={true}
            />
          </>
        )
    }
}

export default BankTable;