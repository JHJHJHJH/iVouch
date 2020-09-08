import React, {Component} from 'react';
import {
    PieChart, Pie, Legend, Tooltip, Cell
  } from 'recharts';


const COLORS = ['#0CC078','#FB6962'];

class Dashboard extends Component {
    constructor(props){
        super(props);
        this.state = {
            invoiceNum : []
        }
    }
    componentDidMount(){
        try {
          const matchinvoices = this.props.matchinvoices;
            const matchNum = matchinvoices.filter( (i) =>{
                return i.isMatched;
            });
          const invoicedata = [
              { name: 'Matched Invoices', value: matchNum.length},
              { name: 'Un-Matched Invoices', value: matchinvoices.length - matchNum.length}]
          
          this.setState({ invoiceNum: invoicedata })
        } catch (e) {
          console.error(e);
        }
      }
    render() {
        return(
            <>
            <h1>Dashboards</h1>
                <PieChart width={500} height={300}>
                <Pie data={this.state.invoiceNum} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={1} outerRadius={80} fill="#82ca9d" >
                {
                    this.state.invoiceNum.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                }
                </Pie>
                <Tooltip />
                <Legend />
                </PieChart>
            </>
        );
    }
};

export default Dashboard;
