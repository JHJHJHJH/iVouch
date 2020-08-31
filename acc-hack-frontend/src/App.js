import React from 'react';
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
  
function App() {
  const classes = useStyles();

  return (
    <Router>
      <Container fluid className={classes.container}>
        
        <Row className={classes.topnav}>
          <TopNavbar/>
          
        </Row>

        <Row className={classes.body}>
          <Col md={2}>
            <SideNavbar/>
          </Col>
          <Col md={8}>
            <div id="page-body">
              <Switch>
                <Route path="/" component={Dashboard} exact/>
                <Route path="/compliance" component = {Compliance} exact/>
                <Route path="/invoices" component={InvoiceTable} exact/>
                <Route path="/ledger" component={LedgerTable} exact/>
                <Route path="/bank" component={BankTable} exact/>
                <Route path="/newproject" component={()=> (<NewProject user="admin"/>)}  exact/>
                
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
