import React from 'react';
import ProjectMenu from './ProjectMenu'
// import {Navbar, Nav} from 'react-bootstrap';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import SportsVolleyballIcon from '@material-ui/icons/SportsVolleyball';
import AddIcon from '@material-ui/icons/Add';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(5),
      marginLeft: theme.spacing(2)
    },
    rightToolbar: {
        marginLeft: "auto",
        marginRight: 0
    },
    title: {
        fontSize: "20px",
        fontWeight: "bold",
        marginRight: theme.spacing(5)
    },
    topbar: {
        background: '#2E3B55', 
        padding: '3px',
        marginBottom: '10px'
    }
}));


function TopNavbar() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
        <AppBar position="static" className={classes.topbar}>
            <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                <SportsVolleyballIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}> iVouch</Typography >

            <ProjectMenu />

            <Button component={Link}to="/newproject"  variant="contained" className={classes.menuButton} >
                {/* <Link  ></Link> */}
                <AddIcon/>
                Add New
            </Button>
            {/* Right menu */}
            <section className = {classes.rightToolbar}>
                <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                    <SearchIcon />
                </IconButton>
                <Button color="inherit">Login</Button>
            </section>
            </Toolbar>
        </AppBar>
        </div>
    );
}

export default TopNavbar;