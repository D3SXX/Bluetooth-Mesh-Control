"use client";
import React, { useState } from "react";
import useSWR from "swr";
import { fetcherGET } from "../utils/fetcher";
import { ServerResponse } from "../interfaces/server";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { Box, Button, Divider, ListItemButton, Stack, Tab, Tabs, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import ExecuteDialog from "./ExecuteDialog";

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

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const NodesElement = () => {
  const [openDescription, setOpenDescription] = useState({});

  const { data, error, isLoading } = useSWR<ServerResponse["config"]>(
    "/config?query=NODES",
    fetcherGET,
    {
      refreshInterval: 3000,
    }
  );

  const nodesList =
    data && data.NODES
      ? data.NODES.nodes.map((node) => ({
          data: node,
          icon: <LightbulbIcon />,
        }))
      : [];

  const handleOpenDescription = (node: string) => {
    setOpenDescription({
      ...openDescription,
      [node]: !openDescription[node as keyof typeof openDescription],
    });
  };

  const [valueDescriptionTab, setValueDescriptionTab] = React.useState(0);

  const handleChangeDescriptionTab = (event: React.SyntheticEvent, newValue: number) => {
    setValueDescriptionTab(newValue);
  };


  return (
    <Box sx={{ width: "500px",minHeight: "60px" }}>
      {nodesList.map((node) => (
        <Box key={node.data.configuration.elements[0].unicastAddress}>
          <Button
            variant="text"
            sx={{
              border: "1px solid lightgray",
              color: "black",
              width: "100%",
              minHeight: "60px",
              borderRadius: "18px",
              fontSize: "1.1rem",
              borderBottomLeftRadius: openDescription[
                node.data.configuration.elements[0].unicastAddress
              ] ? "0px" : "18px",
              borderBottomRightRadius: openDescription[
                node.data.configuration.elements[0].unicastAddress
              ] ? "0px" : "18px",
            }}
            onClick={() =>
              handleOpenDescription(
                node.data.configuration.elements[0].unicastAddress
              )
            }
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <LightbulbIcon />
              Node {node.data.configuration.elements[0].unicastAddress}
            </Stack>
          </Button>
          {openDescription[
            node.data.configuration.elements[0]
              .unicastAddress as keyof typeof openDescription
          ] && (
            <Box sx={{ border: "1px solid lightgray", borderTop: "0px" }}>
              <Grid
                container
                rowSpacing={1}
                columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                sx={{
                  backgroundColor: "white",
                  borderRadius: "18px",
                  borderTopLeftRadius: "0px",
                  borderTopRightRadius: "0px",
                  padding: "20px",
                  width: "100%",
                }}
              >
                {Object.entries({
                  "Company ID": node.data.composition.cidName,
                  "Product ID": node.data.composition.pid,
                  "Version ID": node.data.composition.vid,
                }).map(([key, value]) => (
                  <React.Fragment key={key}>
                    <ListItemButton component="a" sx={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                    <Grid size={6}>
                      <Typography variant="body2" fontWeight="bold">{key}</Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="body2">{value}</Typography>
                    </Grid>
                    </ListItemButton>
                  </React.Fragment>
                ))}
                {
                  Object.entries({
                    "Initialisation Vector Index": node.data.IVindex,
                    "Sequence Number": node.data.sequenceNumber,
                  }).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <ListItemButton component="a" sx={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                      <Grid size={6}>
                        <Typography variant="body2" fontWeight="bold">{key}</Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="body2">{value}</Typography>
                      </Grid>
                    </ListItemButton>
                    </React.Fragment>
                  ))}
                  {Object.entries({
                    "Relay": node.data.composition.features.relay,
                    "Proxy": node.data.composition.features.proxy,
                    "Friend": node.data.composition.features.friend,
                    "LPN": node.data.composition.features.lpn,
                  }).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <ListItemButton component="a" sx={{}}>
                        <Stack direction="column" spacing={0} alignItems="center">
                          <Typography variant="body2" fontWeight="bold">{key}</Typography>
                          <Typography variant="body2">{value ? (<p className="text-green-500">Available</p>) : (<p className="text-red-500">Not Available</p>)}</Typography>
                        </Stack>
                      </ListItemButton>
                    </React.Fragment>
                  ))}
              </Grid>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={valueDescriptionTab} onChange={handleChangeDescriptionTab} centered>
                  <Tab label="Available Models" {...a11yProps(0)} />
                  <Tab label="Bound Models" {...a11yProps(1)} />
                  <Tab label="Network Keys" {...a11yProps(2)} />
                </Tabs>
              </Box>
              <CustomTabPanel value={valueDescriptionTab} index={0}>
                <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                  <Grid size={3}>
                    <Typography variant="body2" fontWeight="bold">Unicast Address</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="body2" fontWeight="bold">Location</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" fontWeight="bold">Models</Typography>
                  </Grid>
                  {node.data.composition.elements.map((element) => (
                    <React.Fragment key={element.elementIndex}>
                      <ListItemButton component="a" sx={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                      <Grid size={3}>
                        <Typography variant="body2">{node.data.configuration.elements[element.elementIndex].unicastAddress}</Typography>
                      </Grid>
                      <Grid size={3}>
                        <Typography variant="body2">{element.location}</Typography>
                      </Grid>
                      <Grid size={6}>
                      {element.models.map((model, index) => (
                          <Typography key={index} variant="body2" component="div">
                            {model} ({element.model_names[index]})
                          </Typography>
                        ))}
                      </Grid>
                      </ListItemButton>
                    </React.Fragment>
                  ))}
                </Grid>
              </CustomTabPanel>
              <CustomTabPanel value={valueDescriptionTab} index={1}>
                Item Two
              </CustomTabPanel>
              <CustomTabPanel value={valueDescriptionTab} index={2}>
                <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                  <Grid size={6}>
                    <Typography variant="body2" fontWeight="bold">Index</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" fontWeight="bold">Key</Typography>
                  </Grid>
                  {node.data.configuration.netKeys.map((netKey, index) => (
                    <ListItemButton key={index} component="a" sx={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                    <Grid size={6}>
                      <Typography variant="body2">{index+1}</Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="body2">{netKey}</Typography>
                      </Grid>
                    </ListItemButton>
                  ))}
                </Grid>
              </CustomTabPanel>
              <Divider />
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{padding: "10px"}}>
                <Button variant="outlined" sx={{width: "30%", borderRadius: "18px", fontSize: "1.1rem", border: "1px solid lightgray", color: "black"}}>
                  <Typography variant="body2" fontWeight="bold">Bind</Typography>
                </Button>
                <Button variant="outlined" sx={{width: "30%", borderRadius: "18px", fontSize: "1.1rem", border: "1px solid lightgray", color: "black"}}>
                  <Typography variant="body2" fontWeight="bold">Publish</Typography>
                </Button>
                <Button variant="outlined" sx={{width: "30%", borderRadius: "18px", fontSize: "1.1rem", border: "1px solid lightgray", color: "black"}}>
                  <Typography variant="body2" fontWeight="bold">Subscribe</Typography>
                </Button>
              </Stack>
            </Box>
            
          )}
          {openDescription[
            node.data.configuration.elements[0]
              .unicastAddress as keyof typeof openDescription
          ] && (
            <ExecuteDialog 
    sx={{width: "100%",minHeight: "50px",color: "red", borderRadius: "18px",border: "1px solid lightgray",borderTop: "0px", borderTopLeftRadius: "0px", borderTopRightRadius: "0px"}}
    buttonTitle="Remove Node"
    dialogTitle={`Remove Node ${node.data.configuration.elements[0].unicastAddress}`}
    text={["Are you sure you want to remove this node?"]}
    key="removeNode"
    fetcherData={{executeUrl: `config?address=${node.data.configuration.elements[0].unicastAddress}`, getDataUrl: "/config?query=PROCESS", type: "DELETE", data: {}}}
    />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default NodesElement;
