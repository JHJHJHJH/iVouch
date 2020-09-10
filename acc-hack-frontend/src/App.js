import React, { useState, useEffect } from 'react';
import InvoiceTable from './components/InvoiceTable';
import BankTable from './components/BankTable';
import LedgerTable from './components/LedgerTable';
import SideNavbar from './components/SideNavbar';
import Dashboard from './components/Dashboard';
import Compliance from './components/Compliance'
import {BrowserRouter as Router, Route,Switch} from 'react-router-dom';
import { withRouter} from 'react-router-dom';
import {Container, Row, Col} from 'react-bootstrap';
import { makeStyles } from '@material-ui/core/styles';
import TopNavbar from './components/TopNavbar';
import NewProject from './pages/NewProject';
import ProjectInfo from './components/ProjectInfo';


const useStyles = makeStyles((theme) => ({
  container: {
    paddingLeft: 0,
    paddingRight: 0
  },
  topnav: {
    paddingLeft: 10,
    paddingRight: 10
  },
  body: {
    paddingLeft: 30,
    paddingRight: 30
  }
}));

const username = "admin";

function cleanJson( lstObj ) {
  const newLstObj = []
  for (let i = 0; i < lstObj.length; i++) {
    const element = lstObj[i];
    
    Object.keys(element).forEach(key => element[key] === "" ? delete element[key] : "");
    Object.keys(element).forEach(key =>{
      if(key.split(" ").length > 1){
        element[key.split(" ").join("_")]=  element[key] ;
        delete element[key];
      };
    });
    
    newLstObj.push(element);
  }

  return newLstObj;
}





function App() {
  const classes = useStyles();
  const [userData, setUserData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectInfo, setProjectInfo] = useState([]);
  const [working, setWorking] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [statements, setStatements] = useState([]);
  //matched data
  const [statementMatches, setStatementMatches] = useState([]);
  const [invoiceMatches, setInvoiceMatches] = useState([]);

  
  const fetchMatchStatement= async() => {
    const result = await fetch('/api/matchstatement', {
      headers: {
        'Accept': 'application/json',
        "Content-Type" :"application/json"
      },
      body: JSON.stringify({ username: username, project: working }),
      method: 'post'
    });
    
    const matchdata = await result.json();
    setStatementMatches(matchdata) ;
  };
  const fetchMatchInvoice = async() => {
    const result = await fetch('/api/matchinvoice', {
      headers: {
        'Accept': 'application/json',
        "Content-Type" :"application/json"
      },
      body: JSON.stringify({ username: username, project: working }),
      method: 'post'
    });
    
    const matchdata = await result.json();
    setInvoiceMatches(matchdata) ;
  };

  useEffect(() => {
    async function fetchData(){
      const result = await fetch('/api/projects', {
        headers: {
          'Accept': 'application/json',
          "Content-Type" :"application/json"
        },
        body: JSON.stringify({ username: username }),
        method: 'post'
      });
  
      const json = await result.json();
      console.log(json);
      const userData = json.projects;

      setUserData(userData);
      const allProjects = userData.map(ele=> ele.name);
      setProjects( allProjects);

      const defaultProject = allProjects[0];
      setWorking( defaultProject );
      
      const found = userData.find( proj=> proj.name === defaultProject);
      const ledgers = cleanJson(found.ledger);
      const statements = cleanJson(found.statement);
      // console.log(found);
      setProjectInfo( found.information );
      setInvoices( found.invoices);
      setStatements( statements);
      setLedgers( ledgers);
    };

    fetchData();
    fetchMatchStatement();
    fetchMatchInvoice();
  }, []);

  const handleProjectChange= (projectname) => {
    setWorking(projectname);
    const found = userData.find( proj=> proj.name === projectname);
    setProjectInfo( found.information );
    setInvoices( found.invoices);
    setStatements( cleanJson(found.statement));
    setLedgers( cleanJson(found.ledger));
    fetchMatchStatement();
    fetchMatchInvoice();
  };

  return (
    <Router>
      <Container fluid className={classes.container}>
        
        <Row className={classes.topnav}>
          <TopNavbar projects={projects} working={working} onProjectChange={handleProjectChange}/>
        </Row>

        <Row className={classes.body}>
          <Col md={2}>
            <SideNavbar/>
          </Col>
          <Col md={10}>
            
            <div id="page-body">  
              <Switch>
                <Route path="/" component={() => 
                  (<Dashboard 
                    matchstatements={statementMatches} 
                    matchinvoices={invoiceMatches} 
                    info={projectInfo} 
                    project={working}
                    invoices={invoices}
                    ledgers={ledgers}
                    statements={statements}
                     />)} 
                exact/>
                <Route path="/compliance" component={()=> (<Compliance matchstatements={statementMatches} info={projectInfo} project={working}/>)} exact/>
                <Route path="/invoices" component={()=> (<InvoiceTable invoices={invoices} info={projectInfo} project={working}/>)}  exact/>
                <Route path="/ledger" component={()=> (<LedgerTable ledgers={ledgers} info={projectInfo} project={working}/>)} exact/>
                <Route path="/statement" component={()=> (<BankTable statements={statements} info={projectInfo} project={working}/>)} exact/>
                <Route path="/newproject" component={()=> (<NewProject user={username} projects={projects} />)}  exact/>
                
                {/* Must be placed last */}
                {/* <Route component= {NotFoundPage} />  */}
              </Switch> 
              
            </div>
          </Col>
        </Row>
      </Container>
    </Router>

  )
}


export default withRouter(App);
