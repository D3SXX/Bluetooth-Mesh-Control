"use client"
import { Button,  DialogTitle, Dialog, Divider, ListItemButton, Stack, Tab, Tabs, Typography, DialogContent, Select, MenuItem, Input } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Box } from '@mui/material'
import React from 'react'
import useSWR from 'swr'
import { fetcherGET } from '../utils/fetcher'
import { ServerResponse } from '../../interfaces/global'

import KeyIcon from '@mui/icons-material/Key';

interface KeysRequest {
  "add-key"?: {
    key: string;
    boundNetKeyIndex: number;
  };
  "edit-key"?: {
    key: string;
    keyIndex: number;
    boundNetKeyIndex: number;
  };
  "delete-key"?: {
    keyIndex: number;
  };
}

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

const generateKey = () => {
 
  // Bluetooth Mesh Protocol v1.1 (3.9.6.2 Application key)
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  
  const key = Array.from(array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
  
  return key;
}

const validateKey = (key: string): boolean => {
  // Check if key is exactly 32 characters (128 bits in hex)
  if (key.length !== 32) {
    return false;
  }
  
  // Check if key contains only valid hexadecimal characters
  const hexPattern = /^[0-9a-fA-F]+$/;
  if (!hexPattern.test(key)) {
    return false;
  }
  
  return true;
}


const KeysElement = () => {

  const [keysData, setKeysData] = React.useState<ServerResponse["keys"]>();
  const [open, setOpen] = React.useState<Record<string, boolean>>({});


  const [keysRequest, setKeysRequest] = React.useState<KeysRequest>({});
  
  

  const handleClose = (name: string) => {
    setOpen((prev) => ({ ...prev, [name]: false }));
  };


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


    const editKeyRequest = (key: string, object: any) => {
      console.log(key, object);
      setKeysRequest({...keysRequest, [key as keyof KeysRequest]: object})
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
          <Box sx={{borderColor: "divider" }}>
          <p style={{fontSize: "24px"}}>Keys configuration</p>
          <Divider sx={{marginTop: "10px", marginBottom: "10px"}}/>
          <Stack direction="row" spacing={2} sx={{width: "100%", justifyContent: "center"}}>
          <Button
                    variant="outlined"
                    onClick={() => setOpen({...open, "add-key": true})}
                    sx={{
                      width: "30%",
                      borderRadius: "18px",
                      fontSize: "1.1rem",
                      border: { md: "1px solid lightgray", xs: "0px" },
                      color: "black",
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Add key
                    </Typography>
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setOpen({...open, "edit-key": true})}
                    sx={{
                      width: "30%",
                      borderRadius: "18px",
                      fontSize: "1.1rem",
                      border: { md: "1px solid lightgray", xs: "0px" },
                      color: "black",
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Edit key
                    </Typography>
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setOpen({...open, "delete-key": true})}
                    sx={{
                      width: "30%",
                      borderRadius: "18px",
                      fontSize: "1.1rem",
                      border: { md: "1px solid lightgray", xs: "0px" },
                      color: "black",
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Delete key
                    </Typography>
                  </Button>
                  </Stack>
                  </Box>
                  <Dialog open={open["add-key"]} onClose={() => handleClose("add-key")}>
                    <DialogTitle>Add key</DialogTitle>
                    <DialogContent>
                      <Stack direction="column" spacing={2} sx={{alignItems: "center", justifyContent: "space-between", display: "flex", width: "100%"}}>
                    <Stack direction="row" spacing={2} sx={{alignItems: "center", justifyContent: "space-between", display: "flex", width: "100%"}}>
                        <Typography>Key:</Typography>
                        <Input 
                          type="text" 
                          required 
                          sx={{width: "100%"}} 
                          value={keysRequest["add-key"]?.key || ""} 
                          onChange={(e) => setKeysRequest({...keysRequest, "add-key": {key: e.target.value, boundNetKeyIndex: keysRequest["add-key"]?.boundNetKeyIndex || 0}})}
                          error={keysRequest["add-key"]?.key ? !validateKey(keysRequest["add-key"].key) : false}
                          placeholder="Enter 32-character hex key"
                        />
                        <Button variant="outlined" color="info" sx={{width: "40%"}} onClick={() => setKeysRequest({...keysRequest, "add-key": {key: generateKey(), boundNetKeyIndex: keysRequest["add-key"]?.boundNetKeyIndex || 0}})}>Generate</Button>
                      </Stack>
                      {keysRequest["add-key"]?.key && !validateKey(keysRequest["add-key"].key) && (
                              <Stack direction="column" spacing={1}>
                              <Typography color="error" variant="caption">
                                Key must be exactly 32 hexadecimal characters (0-9, a-f, A-F)
                              </Typography>
                              <Typography color="error" variant="caption">
                                Current length: {keysRequest["add-key"]?.key?.length}
                              </Typography>
                              </Stack>
                      )}
                      <Stack direction="row" spacing={2} sx={{alignItems: "center", justifyContent: "space-between", display: "flex", width: "100%"}}>
                      <Typography>Bound network key:</Typography>
                      <Select required variant="standard" defaultValue={keysData?.NETKEYS?.[0]?.index} value={keysData?.NETKEYS?.[0]?.index}>
                        {keysData && keysData.NETKEYS && keysData.NETKEYS.map((key) => (
                          <MenuItem key={key.index} defaultValue={key.index} value={key.index}>{key.index} - {key.key}</MenuItem>
                        ))}
                      </Select>
                      </Stack>
                      </Stack>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={open["edit-key"]} onClose={() => handleClose("edit-key")}>
                    <DialogTitle>Edit key</DialogTitle>
                    <DialogContent>
                      <Stack direction="column" spacing={2} sx={{alignItems: "center", justifyContent: "space-between", display: "flex", width: "100%"}}>
                        <Stack direction="row" spacing={2} sx={{alignItems: "center", justifyContent: "space-between", display: "flex", width: "100%"}}>
                          <Typography>Select key:</Typography>
                          <Select sx={{width: "80%"}} required variant="standard" defaultValue={keysRequest["edit-key"]?.keyIndex || ""} value={keysRequest["edit-key"]?.keyIndex} onChange={(e) => editKeyRequest("edit-key", {keyIndex: Number(e.target.value), key: keysData?.APPKEYS[e.target.value as number].key || "", boundNetKeyIndex: keysData?.APPKEYS[e.target.value as number].boundNetKey || 0})}>
                            <MenuItem disabled value="" defaultChecked={keysRequest["edit-key"]?.keyIndex === undefined} >Select key</MenuItem>
                            {keysData && keysData.APPKEYS && keysData.APPKEYS.map((key) => (
                              <MenuItem key={key.index} defaultValue={key.index} value={key.index}>{key.index} - {key.key}</MenuItem>
                            ))}
                          </Select>
                        </Stack>
                        <Stack visibility={keysRequest["edit-key"]?.keyIndex !== undefined ? "visible" : "hidden"} direction="row" spacing={2} sx={{alignItems: "center", justifyContent: "space-between", display: "flex", width: "100%"}}>
                          <Typography>Key:</Typography>
                          <Input error={keysRequest["edit-key"]?.key ? !validateKey(keysRequest["edit-key"].key) : false} placeholder="Enter 32-character hex key" type="text" required sx={{width: "100%"}} value={keysRequest["edit-key"]?.key || ""} onChange={(e) => editKeyRequest("edit-key", {key: e.target.value, keyIndex: keysRequest["edit-key"]?.keyIndex || 0, boundNetKeyIndex: keysRequest["edit-key"]?.boundNetKeyIndex || 0})} />

                        </Stack>
                        {keysRequest["edit-key"]?.key && !validateKey(keysRequest["edit-key"].key) && (
                              <Stack direction="column" spacing={1}>
                              <Typography color="error" variant="caption">
                                Key must be exactly 32 hexadecimal characters (0-9, a-f, A-F)
                              </Typography>
                              <Typography color="error" variant="caption">
                                Current length: {keysRequest["edit-key"]?.key?.length}
                              </Typography>
                              </Stack>
                            )}
                        <Stack visibility={keysRequest["edit-key"]?.keyIndex !== undefined ? "visible" : "hidden"} direction="row" spacing={2} sx={{alignItems: "center", justifyContent: "space-between", display: "flex", width: "100%"}}>
                          <Typography>Bound network key:</Typography>
                          <Select required variant="standard" defaultValue={keysData?.NETKEYS?.[0]?.index} value={keysData?.NETKEYS?.[0]?.index} onChange={(e) => editKeyRequest("edit-key", {keyIndex: keysRequest["edit-key"]?.keyIndex || 0, key: keysRequest["edit-key"]?.key || "", boundNetKeyIndex: Number(e.target.value)})}>
                            {keysData && keysData.NETKEYS && keysData.NETKEYS.map((key) => (
                              <MenuItem key={key.index} defaultValue={key.index} value={key.index}>{key.index} - {key.key}</MenuItem>
                            ))}
                          </Select>
                        </Stack>
                        <Stack direction="row" spacing={2} sx={{alignItems: "center", justifyContent: "space-between", display: "flex", width: "100%"}}>
                        </Stack>
                      </Stack>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={open["delete-key"]} onClose={() => handleClose("delete-key")}>
                    <DialogTitle>Delete key</DialogTitle>
                    <DialogContent>
                      <Select required variant="standard" defaultValue={keysRequest["delete-key"]?.keyIndex || 0} value={keysRequest["delete-key"]?.keyIndex}>
                        <MenuItem disabled value="" defaultChecked={keysRequest["delete-key"]?.keyIndex === undefined} >Select key</MenuItem>
                        {keysData && keysData.APPKEYS && keysData.APPKEYS.map((key) => (
                          <MenuItem key={key.index} defaultValue={key.index} value={key.index}>{key.index} - {key.key}</MenuItem>
                        ))}
                      </Select>
                    </DialogContent>
                  </Dialog>
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
                    {key.ASSIGNED_NODES_UNICAST_ADDRESS?.map((address) => (
                      <Typography key={address}>{address}</Typography>
                    ))}
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