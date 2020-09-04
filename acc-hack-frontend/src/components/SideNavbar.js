import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import DashboardIcon from '@material-ui/icons/Dashboard';
import DescriptionIcon from '@material-ui/icons/Description';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import ExposureIcon from '@material-ui/icons/Exposure';
import CreditCardIcon from '@material-ui/icons/CreditCard';
import InfoIcon from '@material-ui/icons/Info';
import HelpIcon from '@material-ui/icons/Help';
import CodeIcon from '@material-ui/icons/Code';
import {Link} from 'react-router-dom'

const SideNavbar = () => (
    <React.Fragment>
    <List component="nav">

        <ListItem button component={Link} to="/">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        <ListItem button component={Link} to="/compliance">
          <ListItemIcon>
            <CodeIcon />
          </ListItemIcon>
          <ListItemText primary="Compliance" />
        </ListItem>

        <ListItem button component={Link} to="/invoices">
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText primary="Invoices" />
        </ListItem>

        <ListItem button component={Link} to="/ledger">
            <ListItemIcon>
                <ExposureIcon />
            </ListItemIcon> 
          <ListItemText primary="Ledger" />
        </ListItem>

        <ListItem button component={Link} to="/statement">
            <ListItemIcon>
                <AccountBalanceIcon />
            </ListItemIcon>   
            <ListItemText primary="Bank Statements" />
        </ListItem>
    </List>
    

    <List component="nav" style={{paddingTop: '50px'}}>
        <Divider />
        <ListItem button component={Link} to="/billing">
          <ListItemIcon>
            <CreditCardIcon />
          </ListItemIcon>
          <ListItemText primary="Billing" />
        </ListItem>

        <ListItem button component={Link} to="/info">
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText primary="Info" />
        </ListItem>

        <ListItem button component={Link} to="/help">
            <ListItemIcon>
                <HelpIcon />
            </ListItemIcon> 
          <ListItemText primary="Help" />
        </ListItem>

    </List>
    </React.Fragment>
);

export default SideNavbar;