import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import MonthlyIncome from "./MonthlyIncome";
import MonthlyFixedExpenses from './MonthlyFixedExpenses'
import MonthlyVariedExpenses from './MonthlyVariedExpenses'
import MonthEndDistributions from './MonthEndDistributions'
import Notes from './Notes'
import { Tabs, Tab, Typography, Box } from "@mui/material";
import { AppContext } from "../../AppContext";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component = {'span'}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function TabBar() {
  const [value, setValue] = useState(0);
  const [change, setChange] = useState(false)
  let { date } = useContext(AppContext)

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setChange(!change)
  };

  useEffect(()=>{
    let mounted = true
    if (mounted && !date){
      setValue(0)
    }
    return () => (mounted = false);
  }, [change, date])


  return (
    <Box sx={{ width: "95%", margin: "auto" }}>
      <Box sx={{ borderBottom: 1, borderColor: "white" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          textColor="primary"
        >
          <Tab
            label={<span style={{ color: "white" }}>Income</span>}
            {...a11yProps(0)}
          />
          <Tab
            label={<span style={{ color: "white" }}>Fixed Expenses</span>}
            {...a11yProps(1)}
          />
          <Tab
            label={<span style={{ color: "white" }}>Monthly Expenses</span>}
            {...a11yProps(2)}
          />
          <Tab
            label={
              <span style={{ color: "white" }}>Month End Distributions</span>
            }
            {...a11yProps(3)}
          />
          <Tab
            label={<span style={{ color: "white" }}>Notes</span>}
            {...a11yProps(4)}
          />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0} style={{ color: "white" }}>
        <MonthlyIncome />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <MonthlyFixedExpenses />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <MonthlyVariedExpenses/>
      </TabPanel>
      <TabPanel value={value} index={3}>
        <MonthEndDistributions/>
      </TabPanel>
      <TabPanel value={value} index={4}>
        <Notes/>
      </TabPanel>
    </Box>
  );
}
