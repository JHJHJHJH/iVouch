import React, {Component} from 'react';
import MUIDataTable from "mui-datatables";
import ProjectInfo from './ProjectInfo';
// import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

 
const options = {
  filterType: 'checkbox',
  
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

        const columns = headers.map( h =>  ({
          name: h,
          selector: h,
          sortable: true,
          right: true,
          minWidth:"50px",
          options: { 
            setCellProps: value => {
              if( h === "Creditor" || h === "Debits"){
                return {
                  style: { borderRight: '1px solid lightgray' }
                }
              }
            }
          }
        }));
        
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
              title={"Match"}
              data={this.state.Data}
              columns={this.state.Header}
              options={options}
            />
          </>
  

        );
    }
};

export default Compliance;
  