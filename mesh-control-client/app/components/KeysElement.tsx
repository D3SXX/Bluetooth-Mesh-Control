"use client"
import { Divider, ListItemButton, Tab, Tabs, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Box } from '@mui/material'
import React from 'react'
import useSWR from 'swr'
import { fetcherGET } from '../utils/fetcher'
import { ServerResponse } from '../interfaces/server'

import KeyIcon from '@mui/icons-material/Key';



interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}


const KeysElement = () => {

  const [keysData, setKeysData] = React.useState<ServerResponse["keys"]>();


  const { data, error, isLoading } = useSWR<{keys: ServerResponse["keys"]}>(
    "/keys",
    fetcherGET,
    {
      refreshInterval: 3000,
    }
  );

  React.useEffect(() => {
    if(data && data.keys) {
      setKeysData(data.keys);
    }
    console.log(data);
  }, [data]);


    function a11yProps(index: number) {
      return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
      };
    }

    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    };
    
  return (
    <Box sx={{ width: {xs: "100%", md: "60%"}, borderRadius: "10px", border: {xs: "none", md: "1px solid lightgray"},overflow: "hidden" }}>
          <Tabs variant='fullWidth' value={value} onChange={handleChange} centered>
          <Tab label="Application Keys" {...a11yProps(0)} />
          <Tab label="Network Keys" {...a11yProps(1)} />
        </Tabs>
        <CustomTabPanel value={value} index={0}>
          <Box>
            <Typography sx={{fontSize: "24px"}}>Available keys</Typography>
            <Divider sx={{marginTop: "10px", marginBottom: "10px"}}/>
            <Grid container spacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              <Grid size={2}>
                <Typography sx={{fontWeight: "bold"}}>Index</Typography>
              </Grid>
              <Grid size={3}>
                <Typography sx={{fontWeight: "bold"}}>Bound network key</Typography>
              </Grid>
              <Grid size={7}>
                <Typography sx={{fontWeight: "bold"}}>Key</Typography>
              </Grid>
              {keysData && keysData.APPKEYS && keysData.APPKEYS.map((key) => (
                <ListItemButton
                  key={key.index}
                  component="a"
                  sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      width: "100%",
                                    }}
                                  >
                <Grid key={key.index} size={2}>
                  <Typography>{key.index}</Typography>
                </Grid>
                <Grid size={3}>
                  <Typography>{key.boundNetKey}</Typography>
                </Grid>
                <Grid size={7}>
                  <Typography>{key.key}</Typography>
                </Grid>
                </ListItemButton>
              ))}
            </Grid>
            <Typography sx={{fontSize: "24px",}}>Assigned keys</Typography>
            <Divider sx={{marginTop: "10px", marginBottom: "10px"}}/>
            <Grid container spacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              <Grid size={3}>
                <Typography sx={{fontWeight: "bold"}}>Unicast Address</Typography>
              </Grid>
              <Grid size={3}>
                <Typography sx={{fontWeight: "bold"}}>Type</Typography>
              </Grid>
              <Grid size={3}>
                <Typography sx={{fontWeight: "bold"}}>Model ID</Typography>
              </Grid>
              <Grid size={3}>
                <Typography sx={{fontWeight: "bold"}}>Key Index / Address</Typography>
              </Grid>
              {keysData && keysData.BIND && Object.keys(keysData.BIND).map((bind, bindIndex) => (
                <React.Fragment key={bindIndex}>
                <ListItemButton
                  key={bindIndex}
                  component="a"
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Grid size={3}>
                    <Typography>{bind}</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography>Bind</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography>{keysData?.BIND?.[bind as keyof typeof keysData.BIND]?.MODEL}</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography>{keysData?.BIND?.[bind as keyof typeof keysData.BIND]?.APPKEY_INDEX}</Typography>
                  </Grid>

                </ListItemButton>
                {keysData.PUBLISH && keysData.PUBLISH[bind as keyof typeof keysData.PUBLISH] && (
                <ListItemButton
                  component="a"
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Grid size={3}>
                    <Typography>{bind}</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography>Publish</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography>{keysData?.BIND?.[bind as keyof typeof keysData.BIND]?.MODEL}</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography>{keysData?.PUBLISH[bind as keyof typeof keysData.PUBLISH].ADDRESS}</Typography>
                  </Grid>
                </ListItemButton>
              )}
              {keysData && keysData.SUBSCRIBE && keysData.SUBSCRIBE[bind as keyof typeof keysData.SUBSCRIBE] && (
                <ListItemButton
                  component="a"
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Grid size={3}>
                    <Typography>{bind}</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography>Subscribe</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography>{keysData?.BIND?.[bind as keyof typeof keysData.BIND]?.MODEL}</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography>{keysData.SUBSCRIBE[bind as keyof typeof keysData.SUBSCRIBE].ADDRESS_LIST?.map((address) => (
                      <Typography key={address}>{address}</Typography>
                    ))}</Typography>
                  </Grid>
                </ListItemButton>
              )}
              </React.Fragment>
              ))}
              
            </Grid>
          </Box>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <Box>
            <Typography sx={{fontSize: "24px"}}>Available keys</Typography>
            <Divider sx={{marginTop: "10px", marginBottom: "10px"}}/>
            <Grid container spacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              <Grid size={2}>
                <Typography sx={{fontWeight: "bold"}}>Index</Typography>
              </Grid>
              <Grid size={3}>
                <Typography sx={{fontWeight: "bold"}}>Key Refresh</Typography>
              </Grid>
              <Grid size={7}>
                <Typography sx={{fontWeight: "bold"}}>Key</Typography>
              </Grid>
              {keysData && keysData.NETKEYS && keysData.NETKEYS.map((key) => (
                <ListItemButton
                  key={key.index}
                  component="a"
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Grid size={2}>
                    <Typography>{key.index}</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography>{key.keyRefresh}</Typography>
                  </Grid>
                  <Grid size={7}>
                    <Typography>{key.key}</Typography>
                  </Grid>
                </ListItemButton>
              ))}
            </Grid>
            <Typography sx={{fontSize: "24px"}}>Assigned keys</Typography>
            <Divider sx={{marginTop: "10px", marginBottom: "10px"}}/>
            <Grid container spacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              <Grid size={6}>
                <Typography sx={{fontWeight: "bold"}}>Unicast Address</Typography>
              </Grid>
              <Grid size={6}>
                <Typography sx={{fontWeight: "bold"}}>Key Index</Typography>
              </Grid>
              {keysData && keysData.NETKEYS && keysData.NETKEYS.map((key) => (
                <ListItemButton
                  key={key.index}
                  component="a"
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Grid size={6}>
                    <Typography>{key.ASSIGNED_NODES_UNICAST_ADDRESS?.map((address) => (
                      <Typography key={address}>{address}</Typography>
                    ))}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography>{key.index}</Typography>
                  </Grid>
                </ListItemButton>
              ))}
            </Grid>
          </Box>
        </CustomTabPanel>
    </Box>
  )
}

export default KeysElement