import React, { useState, useEffect } from 'react';
import InvoiceTable from './components/InvoiceTable';
import BankTable from './components/BankTable';
import LedgerTable from './components/LedgerTable';
import SideNavbar from './components/SideNavbar';
import Dashboard from './components/Dashboard';
import Compliance from './components/Compliance'
import {BrowserRouter as Router, Route,Switch} from 'react-router-dom';
import {Container, Row, Col} from 'react-bootstrap';
import { makeStyles } from '@material-ui/core/styles';
import TopNavbar from './components/TopNavbar';
import NewProject from './pages/NewProject';

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
    paddingRight: 30,

  }
}));

const username = "admin";

function App() {
  const classes = useStyles();
  const [userData, setUserData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectInfo, setProjectInfo] = useState([]);
  const [working, setWorking] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [statements, setStatements] = useState([]);
  

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
      let userData = json.projects;

      setUserData(userData);
      let allProjects = userData.map(ele=> ele.name);
      setProjects( allProjects);

      let defaultProject = allProjects[0];
      setWorking( defaultProject );
      

      let found = userData.find( proj=> proj.name === defaultProject);
      console.log(found);
      setProjectInfo( found.information );
      setInvoices( found.invoices);
      setStatements( found.statement);
      setLedgers( found.ledger);
      
    };

    fetchData();
  }, []);

  const handleProjectChange= (projectname) => {
    setWorking(projectname);
    let found = userData.find( proj=> proj.name === projectname);
    setProjectInfo( found.information );
    setInvoices( found.invoices);
    setStatements( found.statement);
    setLedgers( found.ledger);
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
          <Col md={8}>
            <div id="page-body">
              <Switch>
                <Route path="/" component={Dashboard} exact/>
                <Route path="/compliance" component={Compliance} exact/>
                <Route path="/invoices" component={()=> (<InvoiceTable invoices={invoices}/>)}  exact/>
                <Route path="/ledger" component={()=> (<LedgerTable ledgers={ledgers}/>)} exact/>
                <Route path="/bank" component={()=> (<BankTable statements={statements}/>)} exact/>
                <Route path="/newproject" component={()=> (<NewProject user={username}/>)}  exact/>
                
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


export default App;
