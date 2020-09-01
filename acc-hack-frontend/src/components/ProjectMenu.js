import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
// import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(2),
    minWidth: 200,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

function ProjectMenu( props ) {
  const classes = useStyles();
  const [workingProject, setWorkingProject] = useState('placeholder');
  // const [otherProjects, setOtherProjects]= useState([]);
  const [allProjects, setAllProjects] = useState([]);

  const handleChange = (event) => {
    let prevWorking = workingProject;
    let newWorking = event.target.value;
    
    setWorkingProject(newWorking);
    
    if(prevWorking !== newWorking){
      props.onProjectChange( newWorking )
    };
  };

  useEffect(() =>{
    setAllProjects( props.projects );
    setWorkingProject( props.working)
  },[props]);
  

  return (
    <div>
      <FormControl className={classes.formControl}>
        <Select
          style={{color:"white"}}
          value={workingProject}
          onChange={handleChange}
          displayEmpty
          className={classes.selectEmpty}
          inputProps={{ 'aria-label': 'Without label' }}
        >

          { allProjects.map( (item,key) => (
            <MenuItem key={key} value={item}>{item}</MenuItem>
          ))}
          
        </Select>
        <FormHelperText  style={{color:"white"}}>Current</FormHelperText>
      </FormControl>

    </div>
  );
}
export default ProjectMenu;