import React, {Component} from 'react';
import {
    PieChart, Pie, Legend, Tooltip, Cell, BarChart, CartesianGrid, XAxis, YAxis, Bar, Label
  } from 'recharts';
import ProjectInfo from './ProjectInfo';
import '../css/Charts.css'
import { withRouter } from 'react-router-dom';

const COLORS = ['#0CC078','#FB6962'];

class Dashboard extends Component {
    constructor(props){
        super(props);
        this.state = {
          allNum: [],  
          invoiceNum : [],
          statementNum : [],
            
        }
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount(){
      try {
        // const matchInvoices = this.props.matchinvoices;
        // const matchInvoiceNum = matchInvoices.filter( (i) =>{return i.isMatched});

          
        const matchStatements = this.props.matchstatements;
        const matchStatementNum = matchStatements.filter( (s) =>{return s.isMatched});
        const statementdata = [
          { name: 'Matched Statement Entries', value: matchStatementNum.length},
          { name: 'Un-Matched Statement Entries', value: matchStatements.length - matchStatementNum.length}]
        
        this.setState({ statementNum: statementdata });
        
        const reducer = (acc, cur) => acc + cur.MatchedInvoices.length;
        const matchedInvoices = matchStatements.reduce( reducer, 0);
        const allInvoices = this.props.invoices.length;
        const invoicedata = [
          { name: 'Matched Invoices', value: matchedInvoices},
          { name: 'Un-Matched Invoices', value: allInvoices - matchedInvoices}]
      
      this.setState({ invoiceNum: invoicedata });
        
        
        const barData = [ 
          { "name" : "Invoices", "Count" : this.props.invoices.length },
          { "name" : "Statement Entries", "Count" : this.props.statements.length },
          { "name" : "Ledger Entries", "Count" : this.props.ledgers.length },
        ]
        this.setState({ allNum: barData})
      } catch (e) {
        console.error(e);
      }
    }

    handleClick(){
      this.props.history.push('/compliance')
    }

    render() {
        return(
            <>
            
            <ProjectInfo info={this.props.info} project={this.props.project}/>
            <h2 style={{marginBottom:"30px"}}>Dashboards</h2>
            <spacer></spacer>
                <BarChart width={1300} height={250} data={this.state.allNum}>
                <Label value="Ledger Match Statement" offset={0} position="left" />
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" >
                    
                  </XAxis>
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="top" />
                   
                  <Bar dataKey="Count" fill="#2E3B55" barSize={130}/>
                </BarChart>
                <PieChart width={600} height={300}>
                  <text x={100} y={30} textAnchor="top" dominantBaseline="top" font-weight="italic" fontSize="18px">
                      Ledger Match Invoice
                    </text>
                  <Pie data={this.state.invoiceNum} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={1} outerRadius={80} fill="#82ca9d" >
                  {
                      this.state.invoiceNum.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                  }
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
                
                <PieChart width={600} height={300}>
                  <text x={100} y={30} textAnchor="top" dominantBaseline="top" font-weight="italic" fontSize="18px">
                    Ledger Match Statement
                  </text>
                  <Pie data={this.state.statementNum} onClick={this.handleClick} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={1} outerRadius={80} fill="#82ca9d" >
                  {
                      this.state.statementNum.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                  }
                 
                  </Pie>
                  
                  <Tooltip />
                  <Legend />
                </PieChart>
                
            </>
        );
    }
};

export default withRouter(Dashboard);
