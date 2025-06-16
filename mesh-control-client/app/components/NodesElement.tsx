"use client";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcherGET } from "../utils/fetcher";
import { ServerResponse } from "../interfaces/server";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import {
  Box,
  Button,
  DialogContentText,
  DialogContent,
  Dialog,
  DialogActions,
  Divider,
  ListItemButton,
  TextField,
  Stack,
  Tab,
  Tabs,
  Typography,
  DialogTitle,
  FormHelperText,
  MenuItem,
  InputLabel,
  Select,
  Slider,
  Checkbox,
  Switch,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ExecuteDialog from "./ExecuteDialog";
import { wrap } from "module";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface SetupData {
  [unicastAddress: string]: {
    bind?: {
      unicastAddress: { index: number; value: string };
      model: {
        index: number;
        value: string;
      };
      appKeyIndex: number;
      saved: boolean;
    };
    publish?: {
      unicastAddress: { index: number; value: string };
      model: {
        index: number;
        value: string;
      };
      address: {
        type: string;
        value: string;
      };
      publicationPeriod: {
        step: number;
        res: number;
      };
      retransmitionCount: {
        cnt: number;
        per: number;
      };
      appKeyIndex: number;
      saved: boolean;
    };
    subscribe?: {
      unicastAddress: { index: number; value: string };
      model: {
        index: number;
        value: string;
      };
      address: {
        type: string;
        value: string;
      };
      appKeyIndex: number;
      saved: boolean;
    };
    identity?: {
      saved: boolean;
      unicastAddress: { index: number; value: string };
      netKeyIndex: number;
      state: number;
    };
    beacon?: {
      saved: boolean;
      unicastAddress: { index: number; value: string };
      state: number;
    };
    heartbeat_publish?: {
      saved: boolean;
      unicastAddress: { index: number; value: string };
      address: {
        type: string;
        value: string;
      };
      relay: number;
      retransmitCount: {
        value: number;
        label: string;
      };
      periodLog: {
        value: number;
        label: string;
      };
      ttl: number;
      features: {
        relay: boolean;
        proxy: boolean;
        friend: boolean;
        lowPower: boolean;
      };
      netKeyIndex: number;
    };
    heartbeat_subscribe?: {
      saved: boolean;
      count: {
        value: number;
        label: string;
      };
      minHops: {
        value: number;
        label: string;
      };
      maxHops: {
        value: number;
        label: string;
      };
      unicastAddress: { index: number; value: string };
      address: {
        type: string;
        value: string;
      };
      periodLog: {
        value: number;
        label: string;
      };
    };
    relay?: {
      saved: boolean;
      unicastAddress: { index: number; value: string };
      count: number;
      step: number;
      relay: boolean;
    };
    proxy?: {
      saved: boolean;
      unicastAddress: { index: number; value: string };
      proxy: boolean;
    };
    ttl?: {
      saved: boolean;
      unicastAddress: { index: number; value: string };
      ttl: number;
    };
  };
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
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const NodesElement = () => {
  const [openDescription, setOpenDescription] = useState({});

  const [openSetupDialog, setOpenSetupDialog] = React.useState<{
    [key: string]: { [key: string]: boolean };
  }>({});

  const [setupData, setSetupData] = React.useState<SetupData>({});

  const setDefaultValues = (
    node: string,
    type: string,
    defaultModel: string
  ) => {
    switch (type) {
      case "bind":
        setSetupData((prev) => ({
          ...prev,
          [node]: {
            ...prev[node],
            bind: {
              unicastAddress: { index: 0, value: node },
              model: { index: 0, value: defaultModel },
              appKeyIndex: 0,
              saved: false,
            },
          },
        }));
        break;
      case "publish":
        setSetupData((prev) => ({
          ...prev,
          [node]: {
            ...prev[node],
            publish: {
              unicastAddress: { index: 0, value: node },
              model: { index: 0, value: defaultModel },
              address: {
                type: "unicast",
                value: "0x0001",
              },
              publicationPeriod: {
                step: 0,
                res: 0,
              },
              retransmitionCount: {
                cnt: 0,
                per: 0,
              },
              appKeyIndex: 0,
              saved: false,
            },
          },
        }));
        break;
      case "subscribe":
        setSetupData((prev) => ({
          ...prev,
          [node]: {
            ...prev[node],
            subscribe: {
              unicastAddress: { index: 0, value: node },
              model: { index: 0, value: defaultModel },
              address: {
                type: "unicast",
                value: "0x0001",
              },
              appKeyIndex: 0,
              saved: false,
            },
          },
        }));
        break;
      case "identity":
        setSetupData((prev) => ({
          ...prev,
          [node]: {
            ...prev[node],
            identity: {
              unicastAddress: { index: 0, value: node },
              netKeyIndex: 0,
              saved: false,
              state: 0,
            },
          },
        }));
        break;
      case "beacon":
        setSetupData((prev) => ({
          ...prev,
          [node]: {
            ...prev[node],
            beacon: {
              unicastAddress: { index: 0, value: node },
              saved: false,
              state: 0,
            },
          },
        }));
        break;
      case "heartbeat_publish":
        setSetupData((prev) => ({
          ...prev,
          [node]: {
            ...prev[node],
            heartbeat_publish: {
              unicastAddress: { index: 0, value: node },
              saved: false,
              address: { type: "unicast", value: "0x0001" },
              relay: 0,
              retransmitCount: {
                value: 0,
                label: "not sent periodically",
              },
              periodLog: {
                value: 0,
                label: "not sent periodically",
              },
              ttl: 0,
              features: {
                relay: false,
                proxy: false,
                friend: false,
                lowPower: false,
              },
              netKeyIndex: 0,
            },
          },
        }));
        break;
      case "heartbeat_subscribe":
        setSetupData((prev) => ({
          ...prev,
          [node]: {
            ...prev[node],
            heartbeat_subscribe: {
              unicastAddress: { index: 0, value: node },
              saved: false,
              address: { type: "unicast", value: "0x0001" },
              count: {
                value: 0,
                label: "Stop counting",
              },
              periodLog: {
                value: 0,
                label: "Not sent",
              },
              minHops: {
                value: 0,
                label: "No data",
              },
              maxHops: {
                value: 0,
                label: "No data",
              },
            },
          },
        }));
        break;
      case "relay":
        setSetupData((prev) => ({
          ...prev,
          [node]: {
            ...prev[node],
            relay: {
              unicastAddress: { index: 0, value: node },
              saved: false,
              count: 0,
              step: 0,
              relay: false,
            },
          },
        }));
        break;
      case "proxy":
        setSetupData((prev) => ({
          ...prev,
          [node]: {
            ...prev[node],
            proxy: {
              unicastAddress: { index: 0, value: node },
              saved: false,
              proxy: false,
            },
          },
        }));
        break;
      case "ttl":
        setSetupData((prev) => ({
          ...prev,
          [node]: {
            ...prev[node],
            ttl: {
              unicastAddress: { index: 0, value: node },
              saved: false,
              ttl: 0,
            },
          },
        }));
        break;
      default:
        break;
    }
  };

  const handleClickOpen = (
    node: string,
    type: keyof SetupData[string],
    defaultModel: string
  ) => {
    if (!setupData[node]?.[type]?.saved) {
      console.log("reset!");
      setDefaultValues(node, type, defaultModel);
    }
    setOpenSetupDialog({
      ...openSetupDialog,
      [node]: {
        ...(openSetupDialog[node as keyof typeof openSetupDialog] || {}),
        [type]: true,
      },
    });
  };

  const handleClose = (
    node: string,
    type: keyof SetupData[string],
    defaultModel: string,
    reset: boolean = true
  ) => {
    if (!setupData[node]?.[type]?.saved && reset) {
      console.log(setupData[node]?.[type]?.saved);
      console.log("reset!");
      setDefaultValues(node, type, defaultModel);
    }
    setOpenSetupDialog({
      ...openSetupDialog,
      [node]: {
        ...(openSetupDialog[node] || {}),
        [type]: false,
      },
    });
  };

  const handleChange = (
    node: string,
    type: keyof SetupData[string],
    key: string,
    value: any
  ) => {
    setSetupData((prev) => ({
      ...prev,
      [node]: {
        ...prev[node],
        [type]: {
          ...(prev[node]?.[type] || {}),
          [key]: value,
        },
      },
    }));
    //console.log(setupData);
  };

  const convertStepToSeconds = (res: number) => {
    switch (res) {
      case 0:
        return 0.1; // 100 milliseconds
      case 1:
        return 1; // 1 second
      case 2:
        return 10; // 10 seconds
      case 3:
        return 600; // 10 minutes
    }
  };

  const getAddressValue = (type: string) => {
    switch (
      type // Bluetooth Mesh Profile Specification 3.4.2
    ) {
      case "unicast":
        return "0x0001"; // 0b0xxxxxxxxxxxxxxx (excluding 0b0000000000000000)
      case "group":
        return "0xC000"; // 0b11xxxxxxxxxxxxxx
      case "virtual":
        return "0x8000"; // 0b10xxxxxxxxxxxxxx
    }
  };

  const verifyAddressValue = (value: string, type: string) => {
    let numberValue;
    try {
      numberValue = parseInt(value, 16);
    } catch (error) {
      return false;
    }
    switch (type) {
      case "unicast":
        if (numberValue >= 0x0001 && numberValue <= 0x7fff) {
          return true;
        }
        return false;
      case "group":
        if (numberValue >= 0xc000 && numberValue <= 0xffff) {
          return true;
        }
        return false;
      case "virtual":
        if (numberValue >= 0x8000 && numberValue <= 0xbfff) {
          return true;
        }
        return false;
    }
  };

  const { data, error, isLoading } = useSWR<ServerResponse["config"]>(
    "/config?query=NODES",
    fetcherGET,
    {
      refreshInterval: 3000,
    }
  );

  useEffect(() => {
    if (data && data.NODES && data.NODES.nodes) {
      data.NODES.nodes.forEach((node) => {
        const nodeAddress = node.configuration.elements[0].unicastAddress;
        if (!setupData[nodeAddress]) {
          setDefaultValues(
            nodeAddress,
            "bind",
            node.composition.elements[0].models[0]
          );
          setDefaultValues(
            nodeAddress,
            "publish",
            node.composition.elements[0].models[0]
          );
          setDefaultValues(
            nodeAddress,
            "subscribe",
            node.composition.elements[0].models[0]
          );
        }
      });
    }
  }, [data]);

  useEffect(() => {
    console.log(setupData);
  }, [setupData]);

  const nodesList =
    data && data.NODES
      ? data.NODES.map((node) => ({
          data: node,
          icon: <LightbulbIcon />,
        }))
      : [];

  const appKeysList = data && data.NODES.appKeys ? data.NODES.appKeys : [];

  const handleOpenDescription = (node: string) => {
    setOpenDescription({
      ...openDescription,
      [node]: !openDescription[node as keyof typeof openDescription],
    });
  };

  const [valueDescriptionTab, setValueDescriptionTab] = React.useState(0);
  const [valueSetupTab, setValueSetupTab] = React.useState(0);

  const handleChangeDescriptionTab = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setValueDescriptionTab(newValue);
  };

  const handleChangeSetupTab = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setValueSetupTab(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: "60px",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {nodesList.map((node) => (
        <Box
          key={node.data.configuration.elements[0].unicastAddress}
          sx={{
            width: { xs: "100%", md: "600px" },
            overflow: "wrap",
            margin: "10px",
            flexShrink: 0,
          }}
        >
          <Button
            variant="text"
            sx={{
              border: { md: "1px solid lightgray", xs: "0px" },
              color: "black",
              width: "100%",
              minHeight: "60px",
              borderRadius: "18px",
              fontSize: "1.1rem",
              borderBottomLeftRadius: openDescription[
                node.data.configuration.elements[0]
                  .unicastAddress as keyof typeof openDescription
              ]
                ? "0px"
                : "18px",
              borderBottomRightRadius: openDescription[
                node.data.configuration.elements[0]
                  .unicastAddress as keyof typeof openDescription
              ]
                ? "0px"
                : "18px",
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
            <Box
              sx={{
                border: { md: "1px solid lightgray", xs: "0px" },
                borderTop: "0px",
              }}
            >
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
                    <ListItemButton
                      component="a"
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Grid size={6}>
                        <Typography variant="body2" fontWeight="bold">
                          {key}
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="body2">{value}</Typography>
                      </Grid>
                    </ListItemButton>
                  </React.Fragment>
                ))}
                {Object.entries({
                  "Initialisation Vector Index": node.data.IVindex,
                  "Sequence Number": node.data.sequenceNumber,
                }).map(([key, value]) => (
                  <React.Fragment key={key}>
                    <ListItemButton
                      component="a"
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Grid size={6}>
                        <Typography variant="body2" fontWeight="bold">
                          {key}
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="body2">{value}</Typography>
                      </Grid>
                    </ListItemButton>
                  </React.Fragment>
                ))}
                <ListItemButton
                  component="a"
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Grid size={6}>
                    <Typography variant="body2" fontWeight="bold">
                      Device Key
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2">
                      {node.data.deviceKey}
                    </Typography>
                  </Grid>
                </ListItemButton>
                {Object.entries({
                  Relay: node.data.composition.features.relay,
                  Proxy: node.data.composition.features.proxy,
                  Friend: node.data.composition.features.friend,
                  LPN: node.data.composition.features.lpn,
                }).map(([key, value]) => (
                  <React.Fragment key={key}>
                    <ListItemButton component="a">
                      <Stack direction="column" spacing={0} alignItems="center" sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}>
                        <Typography variant="body2" fontWeight="bold">
                          {key}
                        </Typography>
                        <Typography variant="body2">
                          {value ? (
                            <p className="text-green-500">Available</p>
                          ) : (
                            <p className="text-red-500">Not Available</p>
                          )}
                        </Typography>
                      </Stack>
                    </ListItemButton>
                  </React.Fragment>
                ))}
              </Grid>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={valueDescriptionTab}
                  onChange={handleChangeDescriptionTab}
                  centered
                >
                  <Tab label="Available Models" {...a11yProps(0)} />
                  <Tab label="Bound Models" {...a11yProps(1)} />
                  <Tab label="Network Keys" {...a11yProps(2)} />
                </Tabs>
              </Box>
              <CustomTabPanel value={valueDescriptionTab} index={0}>
                <Grid
                  container
                  rowSpacing={2}
                  columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                >
                  <Grid size={3}>
                    <Typography variant="body2" fontWeight="bold">
                      Unicast Address
                    </Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="body2" fontWeight="bold">
                      Location
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" fontWeight="bold">
                      Models
                    </Typography>
                  </Grid>
                  {node.data.composition.elements.map((element) => (
                    <React.Fragment key={element.elementIndex}>
                      <ListItemButton
                        component="a"
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <Grid size={3}>
                          <Typography variant="body2">
                            {
                              node.data.configuration.elements[
                                element.elementIndex
                              ].unicastAddress
                            }
                          </Typography>
                        </Grid>
                        <Grid size={3}>
                          <Typography variant="body2">
                            {element.location}
                          </Typography>
                        </Grid>
                        <Grid size={6}>
                          {element.models.map((model, index) => (
                            <Typography
                              key={index}
                              variant="body2"
                              component="div"
                            >
                              {model} ({element.modelsName[index]})
                            </Typography>
                          ))}
                        </Grid>
                      </ListItemButton>
                    </React.Fragment>
                  ))}
                </Grid>
              </CustomTabPanel>
              <CustomTabPanel value={valueDescriptionTab} index={1}>
                <Grid container>
                  <Grid size={3}>
                    <Typography variant="body2" fontWeight="bold">
                      Unicast
                    </Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="body2" fontWeight="bold">
                      Type
                    </Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="body2" fontWeight="bold">
                      Model ID
                    </Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="body2" fontWeight="bold">
                      AppKey Index / Address
                    </Typography>
                  </Grid>

                  {node.data.configuration.elements.map((element) => (
                    <React.Fragment key={element.elementIndex}>
                      {element.models &&
                        element.models.map((model, index) => (
                          <React.Fragment key={index}>
                            {model.bind &&
                              model.bind.map((bind, index) => (
                                <ListItemButton
                                  key={index}
                                  component="a"
                                  sx={{ width: "100%" }}
                                >
                                  <Grid size={3}>
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                    >
                                      {element.unicastAddress}
                                    </Typography>
                                  </Grid>

                                  <Grid size={3}>
                                    <Typography variant="body2">
                                      Bind
                                    </Typography>
                                  </Grid>
                                  <Grid size={3}>
                                    <Typography variant="body2">
                                      {model.modelId}
                                    </Typography>
                                  </Grid>
                                  <Grid size={3}>
                                    <Typography variant="body2">
                                      {model.bind}
                                    </Typography>
                                  </Grid>
                                </ListItemButton>
                              ))}
                            {model.publish && (
                              <ListItemButton
                                component="a"
                                sx={{ width: "100%" }}
                              >
                                <Grid size={3}>
                                  <Typography variant="body2" fontWeight="bold">
                                    {element.unicastAddress}
                                  </Typography>
                                </Grid>
                                <Grid size={3}>
                                  <Typography variant="body2">
                                    Publish
                                  </Typography>
                                </Grid>
                                <Grid size={3}>
                                  <Typography variant="body2">
                                    {model.modelId}
                                  </Typography>
                                </Grid>
                                <Grid size={3}>
                                  <Typography variant="body2">
                                    {model.publish.address}
                                  </Typography>
                                </Grid>
                              </ListItemButton>
                            )}
                            {model.subscribe && (
                              <ListItemButton
                                component="a"
                                sx={{ width: "100%" }}
                              >
                                <Grid size={3}>
                                  <Typography variant="body2" fontWeight="bold">
                                    {element.unicastAddress}
                                  </Typography>
                                </Grid>
                                <Grid key={index} size={3}>
                                  <Typography variant="body2">
                                    Subscribe
                                  </Typography>
                                </Grid>
                                <Grid key={index} size={3}>
                                  <Typography variant="body2">
                                    {model.modelId}
                                  </Typography>
                                </Grid>
                                <Grid key={index} size={3}>
                                  <Typography variant="body2">
                                    {model.subscribe}
                                  </Typography>
                                </Grid>
                              </ListItemButton>
                            )}
                          </React.Fragment>
                        ))}
                    </React.Fragment>
                  ))}
                </Grid>
              </CustomTabPanel>
              <CustomTabPanel value={valueDescriptionTab} index={2}>
                <Grid
                  container
                  rowSpacing={2}
                  columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                >
                  <Grid size={6}>
                    <Typography variant="body2" fontWeight="bold">
                      Index
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" fontWeight="bold">
                      Key
                    </Typography>
                  </Grid>
                  {node.data.configuration.netKeys.map((netKey, index) => (
                    <ListItemButton
                      key={index}
                      component="a"
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Grid size={6}>
                        <Typography variant="body2">{index + 1}</Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="body2">{netKey}</Typography>
                      </Grid>
                    </ListItemButton>
                  ))}
                </Grid>
              </CustomTabPanel>
              <Dialog
                open={
                  openSetupDialog[
                    node.data.configuration.elements[0]
                      .unicastAddress as keyof typeof openSetupDialog
                  ]?.bind
                }
                onClose={() =>
                  handleClose(
                    node.data.configuration.elements[0].unicastAddress,
                    "bind",
                    node.data.composition.elements[0].models[0]
                  )
                }
                slotProps={{
                  paper: {
                    component: "form",
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                      event.preventDefault();
                      handleChange(
                        node.data.configuration.elements[0].unicastAddress,
                        "bind",
                        "saved",
                        true
                      );
                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "bind",
                        node.data.composition.elements[0].models[0],
                        false
                      );
                    },
                  },
                }}
              >
                <DialogTitle>Bind</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    <p>
                      Application Keys may be used within a single network only.
                      As such, there is an association between an Application
                      Key and a Network Key. This association is known as a Key
                      Binding. (From &quot;Bluetooth Mesh Glossary of
                      Terms&quot;)
                    </p>
                    <p></p>
                  </DialogContentText>
                  <Stack
                    direction="column"
                    spacing={1}
                    sx={{ padding: "10px" }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center" }}
                    >
                      <p>Unicast Address:</p>
                      <Box sx={{ flex: 1 }}>
                        <Select
                          required
                          variant="standard"
                          sx={{ width: "100%" }}
                          label="Unicast Address"
                          value={
                            setupData[
                              node.data.configuration.elements[0].unicastAddress
                            ]?.bind?.unicastAddress.index
                          }
                          onChange={(event) => {
                            handleChange(
                              node.data.configuration.elements[0]
                                .unicastAddress,
                              "bind",
                              "unicastAddress",
                              {
                                index: Number(event.target.value),
                                value:
                                  node.data.configuration.elements[
                                    Number(event.target.value)
                                  ].unicastAddress,
                              }
                            );
                            handleChange(
                              node.data.configuration.elements[0]
                                .unicastAddress,
                              "bind",
                              "model",
                              {
                                index: 0,
                                value:
                                  node.data.composition.elements[
                                    Number(event.target.value)
                                  ].models[0],
                              }
                            );
                          }}
                        >
                          {node.data.configuration.elements.map(
                            (element, index) => (
                              <MenuItem value={index} key={index}>
                                {element.unicastAddress}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </Box>
                      <p style={{ marginLeft: "10px" }}>Model:</p>
                      <Box sx={{ flex: 1 }}>
                        <Select
                          required
                          variant="standard"
                          sx={{ width: "100%" }}
                          value={
                            setupData[
                              node.data.configuration.elements[0]
                                .unicastAddress as keyof typeof setupData
                            ]?.bind?.model.index
                          }
                          label="Model"
                          onChange={(event) => {
                            handleChange(
                              node.data.configuration.elements[0]
                                .unicastAddress,
                              "bind",
                              "model",
                              {
                                index: Number(event.target.value),
                                value:
                                  node.data.composition.elements[
                                    setupData[
                                      node.data.configuration.elements[0]
                                        .unicastAddress as keyof typeof setupData
                                    ]?.bind?.unicastAddress.index as number
                                  ]?.models[Number(event.target.value)],
                              }
                            );
                          }}
                        >
                          {node.data.composition.elements[
                            setupData[
                              node.data.configuration.elements[0]
                                .unicastAddress as keyof typeof setupData
                            ]?.bind?.unicastAddress.index as number
                          ]?.models?.map((model, index) => (
                            <MenuItem value={index} key={index}>
                              {model}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center" }}
                    >
                      <p>Application Key:</p>
                      <Box sx={{ flex: 1 }}>
                        <Select
                          required
                          sx={{ width: "100%" }}
                          name="appKey"
                          variant="standard"
                          value={
                            setupData[
                              node.data.configuration.elements[0]
                                .unicastAddress as keyof typeof setupData
                            ]?.bind?.appKeyIndex
                          }
                          onChange={(event) => {
                            handleChange(
                              node.data.configuration.elements[0]
                                .unicastAddress,
                              "bind",
                              "appKeyIndex",
                              event.target.value
                            );
                          }}
                        >
                          {appKeysList.map((appKey, index) => (
                            <MenuItem value={index} key={index}>
                              Key {index}: {appKey.key}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                    </Stack>
                  </Stack>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() =>
                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "bind",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </DialogActions>
              </Dialog>
              <Dialog
                open={
                  openSetupDialog[
                    node.data.configuration.elements[0]
                      .unicastAddress as keyof typeof openSetupDialog
                  ]?.publish
                }
                onClose={() =>
                  handleClose(
                    node.data.configuration.elements[0].unicastAddress,
                    "publish",
                    node.data.composition.elements[0].models[0]
                  )
                }
                slotProps={{
                  paper: {
                    component: "form",
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                      event.preventDefault();
                      handleChange(
                        node.data.configuration.elements[0].unicastAddress,
                        "publish",
                        "saved",
                        true
                      );
                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "publish",
                        node.data.composition.elements[0].models[0],
                        false
                      );
                    },
                  },
                }}
              >
                <DialogTitle>Publish</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    <p>
                      Messages sent and received across the mesh network conform
                      to a publish-subscribe model of communication. Sending
                      messages from one node to a set of one or more other nodes
                      is referred to as Publishing. Nodes may publish
                      unsolicited messages or may publish messages in reply to
                      other messages. Unsolicited messages may be published to a
                      unicast address, group address or virtual address. The
                      address to which messages are published is known as the
                      Publish Address. (From &quot;Bluetooth Mesh Glossary of
                      Terms&quot;)
                    </p>
                  </DialogContentText>
                  <Box sx={{ padding: "10px" }}>
                    <Stack direction="column" spacing={1}>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{ alignItems: "center" }}
                      >
                        <p>Unicast Address:</p>
                        <Box sx={{ flex: 1 }}>
                          <Select
                            required
                            variant="standard"
                            sx={{ width: "100%" }}
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.publish?.unicastAddress.index
                            }
                            label="Unicast Address"
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "publish",
                                "unicastAddress",
                                {
                                  index: Number(event.target.value),
                                  value:
                                    node.data.configuration.elements[
                                      Number(event.target.value)
                                    ].unicastAddress,
                                }
                              );
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "publish",
                                "model",
                                {
                                  index: 0,
                                  value:
                                    node.data.composition.elements[
                                      Number(event.target.value)
                                    ].models[0],
                                }
                              );
                            }}
                          >
                            {node.data.configuration.elements.map(
                              (element, index) => (
                                <MenuItem value={index.toString()} key={index}>
                                  {element.unicastAddress}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </Box>
                        <p>Model:</p>
                        <Box sx={{ flex: 1 }}>
                          <Select
                            required
                            variant="standard"
                            sx={{ width: "100%" }}
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.publish?.model.index
                            }
                            label="Model"
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "publish",
                                "model",
                                {
                                  index: Number(event.target.value),
                                  value:
                                    node.data.composition.elements[
                                      setupData[
                                        node.data.configuration.elements[0]
                                          .unicastAddress as keyof typeof setupData
                                      ]?.publish?.unicastAddress.index as number
                                    ]?.models[Number(event.target.value)],
                                }
                              );
                            }}
                          >
                            {node.data.composition.elements[
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.publish?.unicastAddress.index as number
                            ]?.models?.map((model, index) => (
                              <MenuItem value={index} key={index}>
                                {model}
                              </MenuItem>
                            ))}
                          </Select>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <p>Publish Period:</p>
                        <p>
                          {
                            setupData[
                              node.data.configuration.elements[0].unicastAddress
                            ]?.publish?.publicationPeriod?.step
                          }
                        </p>
                        <p>×</p>
                        <p>
                          {convertStepToSeconds(
                            setupData[
                              node.data.configuration.elements[0].unicastAddress
                            ]?.publish?.publicationPeriod?.res || 0
                          )}
                        </p>
                        <p>=</p>
                        <p>
                          {(
                            (setupData[
                              node.data.configuration.elements[0].unicastAddress
                            ]?.publish?.publicationPeriod?.step || 0) *
                            (convertStepToSeconds(
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.publish?.publicationPeriod?.res || 0
                            ) || 0)
                          ).toFixed(1)}
                        </p>
                        <p>seconds</p>
                      </Stack>
                      <Box>
                        <Stack direction="column" spacing={0}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Stack direction="row" spacing={1}>
                              <p>Number of Steps:</p>
                              <p>
                                {setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.publish?.publicationPeriod?.step || 0}
                              </p>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                              <p>Step Resolution:</p>
                              <p>
                                {convertStepToSeconds(
                                  setupData[
                                    node.data.configuration.elements[0]
                                      .unicastAddress
                                  ]?.publish?.publicationPeriod?.res || 0
                                )}
                              </p>
                              <p>s</p>
                            </Stack>
                          </Stack>

                          <Stack
                            direction="row"
                            spacing={2}
                            sx={{ alignItems: "center" }}
                          >
                            <Slider
                              aria-label="Number of Steps"
                              defaultValue={
                                setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.publish?.publicationPeriod?.step || 0
                              }
                              valueLabelDisplay="auto"
                              shiftStep={10}
                              step={1}
                              marks
                              valueLabelFormat={(value) => {
                                return `${value} steps`;
                              }}
                              min={0} // 0x00 (0b000000) - Publication Period disabled (Mesh profile 4.2.2.2)
                              max={63} // 0x3F (0b111111) - Publication Period enabled (Mesh profile 4.2.2.2)
                              onChange={(event, value) => {
                                handleChange(
                                  node.data.configuration.elements[0]
                                    .unicastAddress,
                                  "publish",
                                  "publicationPeriod",
                                  {
                                    step: value as number,
                                    res:
                                      setupData[
                                        node.data.configuration.elements[0]
                                          .unicastAddress
                                      ]?.publish?.publicationPeriod?.res || 0,
                                  }
                                );
                              }}
                            />
                            <Slider
                              aria-label="Step Resolution"
                              defaultValue={
                                setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.publish?.publicationPeriod?.res || 0
                              }
                              valueLabelDisplay="auto"
                              shiftStep={1}
                              step={1}
                              valueLabelFormat={(value) => {
                                switch (value) {
                                  case 0: // 0b00
                                    return "100 milliseconds";
                                  case 1: // 0b01
                                    return "1 second";
                                  case 2: // 0b10
                                    return "10 seconds";
                                  case 3: // 0b11
                                    return "10 minutes";
                                }
                              }}
                              marks
                              min={0} // 0x00 (0b00) - 100 milliseconds (Mesh profile 4.2.2.2)
                              max={3} // 0x03 (0b11) - 10 minutes (Mesh profile 4.2.2.2)
                              onChange={(event, value) => {
                                handleChange(
                                  node.data.configuration.elements[0]
                                    .unicastAddress,
                                  "publish",
                                  "publicationPeriod",
                                  {
                                    step:
                                      setupData[
                                        node.data.configuration.elements[0]
                                          .unicastAddress
                                      ]?.publish?.publicationPeriod?.step || 0,
                                    res: value as number,
                                  }
                                );
                              }}
                            />
                          </Stack>
                        </Stack>
                      </Box>
                      <Box>
                        <Stack direction="column">
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Stack direction="row" spacing={1}>
                              <p>Retransmission Count:</p>
                              <p>
                                {setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.publish?.retransmitionCount?.cnt || 0}
                              </p>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                              <p>Retransmission Interval:</p>
                              <p>
                                {((setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.publish?.retransmitionCount?.per || 0) +
                                  1) *
                                  50}
                              </p>
                              <p>ms</p>
                            </Stack>
                          </Stack>
                          <Stack direction="row" spacing={2}>
                            <Slider
                              aria-label="Retransmission Count"
                              defaultValue={
                                setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.publish?.retransmitionCount?.cnt || 0
                              }
                              valueLabelDisplay="auto"
                              shiftStep={1}
                              step={1}
                              valueLabelFormat={(value) => {
                                return `${value} retransmissions`;
                              }}
                              marks
                              min={0} // 0x00 (0b000) - no retransmissions (Mesh profile 4.2.2.6)
                              max={7} // 0x07 (0b111) - 7 retransmissions (Mesh profile 4.2.2.6)
                              onChange={(event, value) => {
                                handleChange(
                                  node.data.configuration.elements[0]
                                    .unicastAddress,
                                  "publish",
                                  "retransmitionCount",
                                  {
                                    cnt: value as number,
                                    per:
                                      setupData[
                                        node.data.configuration.elements[0]
                                          .unicastAddress
                                      ]?.publish?.retransmitionCount?.per || 0,
                                  }
                                );
                              }}
                            />
                            <Slider
                              aria-label="Retransmission Interval Steps"
                              defaultValue={
                                setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.publish?.retransmitionCount?.per || 0
                              }
                              valueLabelDisplay="auto"
                              shiftStep={1}
                              step={1}
                              valueLabelFormat={(value) => {
                                return `${(value + 1) * 50} ms`;
                              }}
                              marks
                              min={0} // 0x00 (0b00000) - 0 ms (Mesh profile 4.2.2.7)
                              max={31} // 0x1F (0b11111) - 1600 ms (Mesh profile 4.2.2.7)
                              onChange={(event, value) => {
                                handleChange(
                                  node.data.configuration.elements[0]
                                    .unicastAddress,
                                  "publish",
                                  "retransmitionCount",
                                  {
                                    per: value as number,
                                    cnt:
                                      setupData[
                                        node.data.configuration.elements[0]
                                          .unicastAddress
                                      ]?.publish?.retransmitionCount?.cnt || 0,
                                  }
                                );
                              }}
                            />
                          </Stack>
                        </Stack>
                      </Box>
                      <Box>
                        <Stack direction="column">
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Stack
                              direction="row"
                              sx={{ alignItems: "center" }}
                              spacing={1}
                            >
                              <p>Address:</p>
                              <Box sx={{ flex: 1 }}>
                                <Select
                                  required
                                  name="address"
                                  variant="standard"
                                  sx={{ width: "100%" }}
                                  defaultValue={
                                    setupData[
                                      node.data.configuration.elements[0]
                                        .unicastAddress
                                    ]?.publish?.address?.type
                                  }
                                  value={
                                    setupData[
                                      node.data.configuration.elements[0]
                                        .unicastAddress
                                    ]?.publish?.address?.type
                                  }
                                  onChange={(event) => {
                                    handleChange(
                                      node.data.configuration.elements[0]
                                        .unicastAddress,
                                      "publish",
                                      "address",
                                      {
                                        type: event.target.value,
                                        value: getAddressValue(
                                          event.target.value as string
                                        ),
                                      }
                                    );
                                  }}
                                >
                                  <MenuItem value="unicast">
                                    Unicast (0x0001–0x7FFF)
                                  </MenuItem>
                                  <MenuItem value="group">
                                    Group (0xC000–0xFFFF)
                                  </MenuItem>
                                  <MenuItem value="virtual">
                                    Virtual (0x8000–0xBFFF)
                                  </MenuItem>
                                </Select>
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <TextField
                                  id="standard-error"
                                  required
                                  variant="standard"
                                  sx={{ width: "100%" }}
                                  value={
                                    setupData[
                                      node.data.configuration.elements[0]
                                        .unicastAddress
                                    ]?.publish?.address?.value
                                  }
                                  error={
                                    !verifyAddressValue(
                                      setupData[
                                        node.data.configuration.elements[0]
                                          .unicastAddress
                                      ]?.publish?.address?.value as string,
                                      setupData[
                                        node.data.configuration.elements[0]
                                          .unicastAddress
                                      ]?.publish?.address?.type as string
                                    )
                                  }
                                  onChange={(event) => {
                                    handleChange(
                                      node.data.configuration.elements[0]
                                        .unicastAddress,
                                      "publish",
                                      "address",
                                      {
                                        type: setupData[
                                          node.data.configuration.elements[0]
                                            .unicastAddress
                                        ]?.publish?.address?.type,
                                        value: event.target.value,
                                      }
                                    );
                                  }}
                                />
                              </Box>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Box>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{ alignItems: "center" }}
                      >
                        <p>Application Key:</p>
                        <Box sx={{ flex: 1 }}>
                          <Select
                            required
                            name="appKey"
                            variant="standard"
                            sx={{ width: "100%" }}
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.publish?.appKeyIndex
                            }
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.publish?.appKeyIndex
                            }
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "publish",
                                "appKeyIndex",
                                event.target.value
                              );
                            }}
                          >
                            {appKeysList.map((appKey, index) => (
                              <MenuItem value={index} key={index}>
                                Key {index}: {appKey.key}
                              </MenuItem>
                            ))}
                          </Select>
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() =>
                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "publish",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </DialogActions>
              </Dialog>
              <Dialog
                open={
                  openSetupDialog[
                    node.data.configuration.elements[0]
                      .unicastAddress as keyof typeof openSetupDialog
                  ]?.subscribe
                }
                onClose={() =>
                  handleClose(
                    node.data.configuration.elements[0].unicastAddress,
                    "subscribe",
                    node.data.composition.elements[0].models[0]
                  )
                }
                slotProps={{
                  paper: {
                    component: "form",
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                      event.preventDefault();

                      handleChange(
                        node.data.configuration.elements[0].unicastAddress,
                        "subscribe",
                        "saved",
                        true
                      );

                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "subscribe",
                        node.data.composition.elements[0].models[0],
                        false
                      );
                    },
                  },
                }}
              >
                <DialogTitle>Subscribe</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    <p>
                      Messages sent and received across the mesh network conform
                      to a publish-subscribe model of communication. Configuring
                      a node to receive certain messages is known as
                      Subscribing. (From &quot;Bluetooth Mesh Glossary of
                      Terms&quot;)
                    </p>
                  </DialogContentText>
                  <Box sx={{ padding: "10px" }}>
                    <Stack direction="column" spacing={1}>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          display: "flex",
                        }}
                      >
                        <p>Unicast Address:</p>
                        <Box sx={{ flex: 1 }}>
                          <Select
                            required
                            variant="standard"
                            sx={{ width: "100%" }}
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.subscribe?.unicastAddress.index
                            }
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.subscribe?.unicastAddress.index
                            }
                            label="Unicast Address"
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "subscribe",
                                "unicastAddress",
                                {
                                  index: Number(event.target.value),
                                  value:
                                    node.data.configuration.elements[
                                      Number(event.target.value)
                                    ].unicastAddress,
                                }
                              );
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "subscribe",
                                "model",
                                {
                                  index: 0,
                                  value:
                                    node.data.composition.elements[
                                      Number(event.target.value)
                                    ].models[0],
                                }
                              );
                            }}
                          >
                            {node.data.configuration.elements.map(
                              (element, index) => (
                                <MenuItem value={index.toString()} key={index}>
                                  {element.unicastAddress}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </Box>
                        <p>Model:</p>
                        <Box sx={{ flex: 1 }}>
                          <Select
                            required
                            variant="standard"
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.subscribe?.model.index
                            }
                            sx={{ width: "100%" }}
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.subscribe?.model.index
                            }
                            label="Model"
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "subscribe",
                                "model",
                                {
                                  index: Number(event.target.value),
                                  value:
                                    node.data.composition.elements[
                                      setupData[
                                        node.data.configuration.elements[0]
                                          .unicastAddress as keyof typeof setupData
                                      ]?.subscribe?.unicastAddress
                                        .index as number
                                    ]?.models[Number(event.target.value)],
                                }
                              );
                            }}
                          >
                            {node.data.composition.elements[
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.subscribe?.unicastAddress.index as number
                            ]?.models?.map((model, index) => (
                              <MenuItem value={index} key={index}>
                                {model}
                              </MenuItem>
                            ))}
                          </Select>
                        </Box>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          display: "flex",
                        }}
                      >
                        <p>Address:</p>
                        <Box sx={{ flex: 1 }}>
                          <Select
                            required
                            name="address"
                            variant="standard"
                            sx={{ width: "100%" }}
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.subscribe?.address?.type
                            }
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.subscribe?.address?.type
                            }
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "subscribe",
                                "address",
                                {
                                  type: event.target.value,
                                  value: getAddressValue(
                                    event.target.value as string
                                  ),
                                }
                              );
                            }}
                          >
                            <MenuItem value="unicast">
                              Unicast (0x0001–0x7FFF)
                            </MenuItem>
                            <MenuItem value="group">
                              Group (0xC000–0xFFFF)
                            </MenuItem>
                            <MenuItem value="virtual">
                              Virtual (0x8000–0xBFFF)
                            </MenuItem>
                          </Select>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <TextField
                            required
                            id="standard-error"
                            variant="standard"
                            sx={{ width: "100%" }}
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.subscribe?.address?.value
                            }
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.subscribe?.address?.value
                            }
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "subscribe",
                                "address",
                                {
                                  type: setupData[
                                    node.data.configuration.elements[0]
                                      .unicastAddress
                                  ]?.subscribe?.address?.type,
                                  value: event.target.value,
                                }
                              );
                            }}
                            error={
                              !verifyAddressValue(
                                setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.subscribe?.address?.value as string,
                                setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.subscribe?.address?.type as string
                              )
                            }
                          />
                        </Box>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          display: "flex",
                        }}
                      >
                        <p>Application Key:</p>
                        <Box sx={{ flex: 1 }}>
                          <Select
                            required
                            name="appKey"
                            variant="standard"
                            sx={{ width: "100%" }}
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.subscribe?.appKeyIndex
                            }
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.subscribe?.appKeyIndex
                            }
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "subscribe",
                                "appKeyIndex",
                                event.target.value
                              );
                            }}
                          >
                            {appKeysList.map((appKey, index) => (
                              <MenuItem value={index} key={index}>
                                Key {index}: {appKey.key}
                              </MenuItem>
                            ))}
                          </Select>
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() =>
                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "subscribe",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </DialogActions>
              </Dialog>
              <Dialog
                open={
                  openSetupDialog[
                    node.data.configuration.elements[0]
                      .unicastAddress as keyof typeof openSetupDialog
                  ]?.identity
                }
                onClose={() =>
                  handleClose(
                    node.data.configuration.elements[0].unicastAddress,
                    "identity",
                    node.data.composition.elements[0].models[0]
                  )
                }
                slotProps={{
                  paper: {
                    component: "form",
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                      event.preventDefault();

                      handleChange(
                        node.data.configuration.elements[0].unicastAddress,
                        "identity",
                        "saved",
                        true
                      );

                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "identity",
                        node.data.composition.elements[0].models[0],
                        false
                      );
                    },
                  },
                }}
              >
                <DialogTitle>Identity</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    <p>
                      Node Identity is the name of a field which is included in
                      the Service Data field within advertising packets
                      broadcast by Bluetooth mesh proxy nodes. Its value is
                      derived from a combination of the Proxy node’s Unicast
                      Address and a network identifier, such as the network ID
                      for one of the subnets it is enabled on. (From
                      &quot;Bluetooth Mesh Glossary of Terms&quot;)
                    </p>
                  </DialogContentText>
                  <Box sx={{ padding: "10px" }}>
                    <Stack direction="column" spacing={1}>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          display: "flex",
                          width: "100%",
                        }}
                      >
                        <p>Unicast Address:</p>
                        <Box sx={{ flex: 1 }}>
                          <Select
                            required
                            variant="standard"
                            sx={{ width: "100%" }}
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.identity?.unicastAddress.index
                            }
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.identity?.unicastAddress.index
                            }
                            label="Unicast Address"
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "identity",
                                "unicastAddress",
                                {
                                  index: Number(event.target.value),
                                  value:
                                    node.data.configuration.elements[
                                      Number(event.target.value)
                                    ].unicastAddress,
                                }
                              );
                            }}
                          >
                            {node.data.configuration.elements.map(
                              (element, index) => (
                                <MenuItem value={index.toString()} key={index}>
                                  {element.unicastAddress}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </Box>

                        <p>Network Key:</p>
                        <Box sx={{ flex: 1 }}>
                          <Select
                            required
                            name="appKey"
                            variant="standard"
                            sx={{ width: "100%" }}
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.identity?.netKeyIndex
                            }
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.identity?.netKeyIndex
                            }
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "identity",
                                "netKeyIndex",
                                event.target.value
                              );
                            }}
                          >
                            {node.data.configuration.netKeys.map(
                              (netKey, index) => (
                                <MenuItem value={index} key={index}>
                                  Key {netKey}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </Box>
                      </Stack>
                      <Stack direction="column" spacing={2}>
                        <p>
                          Advertising state:{" "}
                          {
                            setupData[
                              node.data.configuration.elements[0]
                                .unicastAddress as keyof typeof setupData
                            ]?.identity?.state
                          }{" "}
                          {setupData[
                            node.data.configuration.elements[0]
                              .unicastAddress as keyof typeof setupData
                          ]?.identity?.state === 0
                            ? "(Stopped)"
                            : "(Running)"}
                        </p>
                        <Slider
                          defaultValue={0}
                          min={0} // 0x00 - Advertising is stopped (mesh profile 4.2.12)
                          max={1} // 0x01 - Advertising is running (mesh profile 4.2.12)
                          // 0x02 - Advertising is not supported (mesh profile 4.2.12)
                          step={1}
                          valueLabelDisplay="auto"
                          value={
                            setupData[
                              node.data.configuration.elements[0]
                                .unicastAddress as keyof typeof setupData
                            ]?.identity?.state
                          }
                          onChange={(event, value) => {
                            handleChange(
                              node.data.configuration.elements[0]
                                .unicastAddress,
                              "identity",
                              "state",
                              value
                            );
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() =>
                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "identity",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </DialogActions>
              </Dialog>
              <Dialog
                open={
                  openSetupDialog[
                    node.data.configuration.elements[0]
                      .unicastAddress as keyof typeof openSetupDialog
                  ]?.beacon
                }
                onClose={() =>
                  handleClose(
                    node.data.configuration.elements[0].unicastAddress,
                    "beacon",
                    node.data.composition.elements[0].models[0]
                  )
                }
                slotProps={{
                  paper: {
                    component: "form",
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                      event.preventDefault();

                      handleChange(
                        node.data.configuration.elements[0].unicastAddress,
                        "beacon",
                        "saved",
                        true
                      );

                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "beacon",
                        node.data.composition.elements[0].models[0],
                        false
                      );
                    },
                  },
                }}
              >
                <DialogTitle>Beacon</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    <p>
                      The Secure Network Beacon state determines if a node is
                      periodically broadcasting Secure Network beacon messages
                      (From &quot;Mesh Profile&quot;)
                    </p>
                  </DialogContentText>
                  <Box sx={{ padding: "10px" }}>
                    <Stack direction="column" spacing={1}>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          display: "flex",
                          width: "100%",
                        }}
                      >
                        <p>Unicast Address:</p>
                        <Box sx={{ flex: 1 }}>
                          <Select
                            required
                            variant="standard"
                            sx={{ width: "100%" }}
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.beacon?.unicastAddress.index
                            }
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.beacon?.unicastAddress.index
                            }
                            label="Unicast Address"
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "beacon",
                                "unicastAddress",
                                {
                                  index: Number(event.target.value),
                                  value:
                                    node.data.configuration.elements[
                                      Number(event.target.value)
                                    ].unicastAddress,
                                }
                              );
                            }}
                          >
                            {node.data.configuration.elements.map(
                              (element, index) => (
                                <MenuItem value={index.toString()} key={index}>
                                  {element.unicastAddress}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </Box>
                      </Stack>
                      <Stack direction="column" spacing={2}>
                        <p>
                          Beacon state:{" "}
                          {
                            setupData[
                              node.data.configuration.elements[0]
                                .unicastAddress as keyof typeof setupData
                            ]?.beacon?.state
                          }{" "}
                          {setupData[
                            node.data.configuration.elements[0]
                              .unicastAddress as keyof typeof setupData
                          ]?.beacon?.state === 0
                            ? "(not broadcasting secure network beacon)"
                            : "(broadcasting secure network beacon)"}
                        </p>
                        <Slider
                          defaultValue={0}
                          min={0} // 0x00 - The node is not broadcasting a Secure Network beacon (mesh profile 4.2.10)
                          max={1} // 0x01 - The node is broadcasting a Secure Network beacon (mesh profile 4.2.10)
                          step={1}
                          valueLabelDisplay="auto"
                          value={
                            setupData[
                              node.data.configuration.elements[0]
                                .unicastAddress as keyof typeof setupData
                            ]?.beacon?.state
                          }
                          onChange={(event, value) => {
                            handleChange(
                              node.data.configuration.elements[0]
                                .unicastAddress,
                              "beacon",
                              "state",
                              value
                            );
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() =>
                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "beacon",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </DialogActions>
              </Dialog>
              <Dialog
                open={
                  openSetupDialog[
                    node.data.configuration.elements[0]
                      .unicastAddress as keyof typeof openSetupDialog
                  ]?.heartbeat_publish
                }
                onClose={() =>
                  handleClose(
                    node.data.configuration.elements[0].unicastAddress,
                    "heartbeat_publish",
                    node.data.composition.elements[0].models[0]
                  )
                }
                slotProps={{
                  paper: {
                    component: "form",
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                      event.preventDefault();

                      handleChange(
                        node.data.configuration.elements[0].unicastAddress,
                        "heartbeat_publish",
                        "saved",
                        true
                      );

                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "heartbeat_publish",
                        node.data.composition.elements[0].models[0],
                        false
                      );
                    },
                  },
                }}
              >
                <DialogTitle>Heartbeat Publish</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    <p>
                      Nodes can be configured to send a message known as a
                      Heartbeat message, periodically. The purpose of the
                      Heartbeat message is to indicate to other nodes that the
                      node sending the Heartbeat message is still active and to
                      allow its distance from the recipient to be determined, in
                      terms of the number of hops needed to deliver the
                      Heartbeat message.(From &quot;Bluetooth Mesh Glossary of
                      Terms&quot;)
                    </p>
                  </DialogContentText>
                  <Box sx={{ padding: "10px" }}>
                    <Stack direction="column" spacing={1}>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          display: "flex",
                          width: "100%",
                        }}
                      >
                        <p>Unicast Address:</p>
                        <Box sx={{ flex: 1 }}>
                          <Select
                            required
                            variant="standard"
                            sx={{ width: "100%" }}
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.heartbeat_publish?.unicastAddress.index
                            }
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.heartbeat_publish?.unicastAddress.index
                            }
                            label="Unicast Address"
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "heartbeat_publish",
                                "unicastAddress",
                                {
                                  index: Number(event.target.value),
                                  value:
                                    node.data.configuration.elements[
                                      Number(event.target.value)
                                    ].unicastAddress,
                                }
                              );
                            }}
                          >
                            {node.data.configuration.elements.map(
                              (element, index) => (
                                <MenuItem value={index.toString()} key={index}>
                                  {element.unicastAddress}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </Box>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          display: "flex",
                        }}
                      >
                        <p>Address:</p>
                        <Box sx={{ flex: 1 }}>
                          <Select
                            required
                            name="address"
                            variant="standard"
                            sx={{ width: "100%" }}
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.heartbeat_publish?.address?.type
                            }
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.heartbeat_publish?.address?.type
                            }
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "heartbeat_publish",
                                "address",
                                {
                                  type: event.target.value,
                                  value: getAddressValue(
                                    event.target.value as string
                                  ),
                                }
                              );
                            }}
                          >
                            <MenuItem value="unicast">
                              Unicast (0x0001–0x7FFF)
                            </MenuItem>
                            <MenuItem value="group">
                              Group (0xC000–0xFFFF)
                            </MenuItem>
                            <MenuItem value="virtual">
                              Virtual (0x8000–0xBFFF)
                            </MenuItem>
                          </Select>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <TextField
                            required
                            id="standard-error"
                            variant="standard"
                            sx={{ width: "100%" }}
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.heartbeat_publish?.address?.value
                            }
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.heartbeat_publish?.address?.value
                            }
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "heartbeat_publish",
                                "address",
                                {
                                  type: setupData[
                                    node.data.configuration.elements[0]
                                      .unicastAddress
                                  ]?.heartbeat_publish?.address?.type,
                                  value: event.target.value,
                                }
                              );
                            }}
                            error={
                              !verifyAddressValue(
                                setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.heartbeat_publish?.address?.value as string,
                                setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.heartbeat_publish?.address?.type as string
                              )
                            }
                          />
                        </Box>
                      </Stack>
                      <Stack
                        direction="row"
                        sx={{ width: "100%", alignItems: "center" }}
                        spacing={2}
                      >
                        <Box sx={{ flex: 1 }}>
                          <p>
                            Publish Count:{" "}
                            {
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.heartbeat_publish?.retransmitCount.label
                            }
                          </p>
                          <Slider
                            marks={[
                              {
                                value: 0, // 0x00 - Heartbeat messages are not being sent periodically (mesh profile 4.2.17.2)
                              },
                              ...Array.from({ length: 17 }, (_, i) => ({
                                // 0x01 - 0x11 - Number of Heartbeat messages, 2(n-1), that remain to be sent (mesh profile 4.2.17.2)
                                value: i + 1,
                              })),
                              {
                                value: 255, // 0xFF - Heartbeat messages are being sent indefinitely (mesh profile 4.2.17.2)
                              },
                            ]}
                            max={255}
                            min={0}
                            step={null}
                            onChange={(
                              event: Event,
                              value: number | number[]
                            ) => {
                              let label;
                              if (Array.isArray(value)) {
                                value = value[0];
                              }
                              switch (value) {
                                case 0:
                                  label = "Not sent";
                                  break;
                                case 255:
                                  label = "Sent indefinitely";
                                  break;
                                default:
                                  label = `${2 ** (value - 1)} time(s)`;
                              }
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "heartbeat_publish",
                                "retransmitCount",
                                {
                                  value: value,
                                  label: label,
                                }
                              );
                            }}
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.heartbeat_publish?.retransmitCount.value
                            }
                            valueLabelDisplay="auto"
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <p>
                            Period Log:{" "}
                            {
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.heartbeat_publish?.periodLog.label
                            }
                          </p>
                          <Slider
                            min={0} // 0x00 - Heartbeat messages are not being sent periodically (mesh profile 4.2.17.3)
                            max={17} // 0x11 - Smallest integer n, where 2(n-1) is greater than or equal to the Heartbeat Publication Count value (mesh profile 4.2.17.3)
                            valueLabelDisplay="auto"
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.heartbeat_publish?.periodLog.value
                            }
                            onChange={(
                              event: Event,
                              value: number | number[]
                            ) => {
                              let label;
                              if (Array.isArray(value)) {
                                value = value[0];
                              }
                              switch (value) {
                                case 0:
                                  label = "Not sent";
                                  break;
                                default:
                                  label = `${2 ** (value - 1)} second(s)`;
                              }
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "heartbeat_publish",
                                "periodLog",
                                {
                                  value: value,
                                  label: label,
                                }
                              );
                            }}
                          />
                        </Box>
                      </Stack>
                      <Stack direction="row" sx={{ width: "100%" }} spacing={2}>
                        <Box sx={{ flex: 1 }}>
                          <p>
                            Time to live (TTL):{" "}
                            {
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.heartbeat_publish?.ttl
                            }
                          </p>
                          <Slider
                            min={0} // 0x00 - The Heartbeat Publication TTL state (mesh profile 4.2.17.4)
                            max={127} // 0x7F - The Heartbeat Publication TTL state (mesh profile 4.2.17.4)
                            valueLabelDisplay="auto"
                            marks
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.heartbeat_publish?.ttl
                            }
                            onChange={(
                              event: Event,
                              value: number | number[]
                            ) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "heartbeat_publish",
                                "ttl",
                                value
                              );
                            }}
                          />
                        </Box>
                      </Stack>
                      {/* Mesh Profile 4.2.17.5 */}
                      <Box sx={{ flex: 1 }}>
                        <p>Features:</p>
                        <Stack direction="row" spacing={2}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Checkbox
                              checked={
                                setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.heartbeat_publish?.features?.relay
                              }
                              onChange={(event) => {
                                handleChange(
                                  node.data.configuration.elements[0]
                                    .unicastAddress,
                                  "heartbeat_publish",
                                  "features",
                                  {
                                    ...setupData[
                                      node.data.configuration.elements[0]
                                        .unicastAddress
                                    ]?.heartbeat_publish?.features,
                                    relay: event.target.checked,
                                  }
                                );
                              }}
                            />
                            <p>Relay</p>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Checkbox
                              checked={
                                setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.heartbeat_publish?.features?.proxy
                              }
                              onChange={(event) => {
                                handleChange(
                                  node.data.configuration.elements[0]
                                    .unicastAddress,
                                  "heartbeat_publish",
                                  "features",
                                  {
                                    ...setupData[
                                      node.data.configuration.elements[0]
                                        .unicastAddress
                                    ]?.heartbeat_publish?.features,
                                    proxy: event.target.checked,
                                  }
                                );
                              }}
                            />
                            <p>Proxy</p>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Checkbox
                              checked={
                                setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.heartbeat_publish?.features?.friend
                              }
                              onChange={(event) => {
                                handleChange(
                                  node.data.configuration.elements[0]
                                    .unicastAddress,
                                  "heartbeat_publish",
                                  "features",
                                  {
                                    ...setupData[
                                      node.data.configuration.elements[0]
                                        .unicastAddress
                                    ]?.heartbeat_publish?.features,
                                    friend: event.target.checked,
                                  }
                                );
                              }}
                            />
                            <p>Friend</p>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Checkbox
                              checked={
                                setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.heartbeat_publish?.features?.lowPower
                              }
                              onChange={(event) => {
                                handleChange(
                                  node.data.configuration.elements[0]
                                    .unicastAddress,
                                  "heartbeat_publish",
                                  "features",
                                  {
                                    ...setupData[
                                      node.data.configuration.elements[0]
                                        .unicastAddress
                                    ]?.heartbeat_publish?.features,
                                    lowPower: event.target.checked,
                                  }
                                );
                              }}
                            />
                            <p>Low Power</p>
                          </Box>
                        </Stack>
                      </Box>
                      <p>Network Key:</p>
                      <Box sx={{ flex: 1 }}>
                        <Select
                          required
                          name="appKey"
                          variant="standard"
                          sx={{ width: "100%" }}
                          defaultValue={
                            setupData[
                              node.data.configuration.elements[0]
                                .unicastAddress as keyof typeof setupData
                            ]?.heartbeat_publish?.netKeyIndex
                          }
                          value={
                            setupData[
                              node.data.configuration.elements[0]
                                .unicastAddress as keyof typeof setupData
                            ]?.heartbeat_publish?.netKeyIndex
                          }
                          onChange={(event) => {
                            handleChange(
                              node.data.configuration.elements[0]
                                .unicastAddress,
                              "heartbeat_publish",
                              "netKeyIndex",
                              event.target.value
                            );
                          }}
                        >
                          {node.data.configuration.netKeys.map(
                            (netKey, index) => (
                              <MenuItem value={index} key={index}>
                                Key {netKey}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </Box>
                    </Stack>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() =>
                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "heartbeat_publish",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </DialogActions>
              </Dialog>
              <Dialog
                open={
                  openSetupDialog[
                    node.data.configuration.elements[0]
                      .unicastAddress as keyof typeof openSetupDialog
                  ]?.heartbeat_subscribe
                }
                onClose={() =>
                  handleClose(
                    node.data.configuration.elements[0].unicastAddress,
                    "heartbeat_subscribe",
                    node.data.composition.elements[0].models[0]
                  )
                }
                slotProps={{
                  paper: {
                    component: "form",
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                      event.preventDefault();

                      handleChange(
                        node.data.configuration.elements[0].unicastAddress,
                        "heartbeat_subscribe",
                        "saved",
                        true
                      );

                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "heartbeat_subscribe",
                        node.data.composition.elements[0].models[0],
                        false
                      );
                    },
                  },
                }}
              >
                <DialogTitle>Heartbeat Subscribe</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    <p>
                      Nodes can be configured to send a message known as a
                      Heartbeat message, periodically. The purpose of the
                      Heartbeat message is to indicate to other nodes that the
                      node sending the Heartbeat message is still active and to
                      allow its distance from the recipient to be determined, in
                      terms of the number of hops needed to deliver the
                      Heartbeat message. (From &quot;Bluetooth Mesh Glossary of
                      Terms&quot;)
                    </p>
                  </DialogContentText>
                  <Box sx={{ padding: "10px" }}>
                    <Stack direction="column" spacing={1}>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          display: "flex",
                          width: "100%",
                        }}
                      >
                        <p>Unicast Address:</p>
                        <Box sx={{ flex: 1 }}>
                          <Select
                            required
                            variant="standard"
                            sx={{ width: "100%" }}
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.heartbeat_subscribe?.unicastAddress.index
                            }
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.heartbeat_subscribe?.unicastAddress.index
                            }
                            label="Unicast Address"
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "heartbeat_subscribe",
                                "unicastAddress",
                                {
                                  index: Number(event.target.value),
                                  value:
                                    node.data.configuration.elements[
                                      Number(event.target.value)
                                    ].unicastAddress,
                                }
                              );
                            }}
                          >
                            {node.data.configuration.elements.map(
                              (element, index) => (
                                <MenuItem value={index.toString()} key={index}>
                                  {element.unicastAddress}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </Box>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          display: "flex",
                        }}
                      >
                        <p>Address:</p>
                        <Box sx={{ flex: 1 }}>
                          <Select
                            required
                            name="address"
                            variant="standard"
                            sx={{ width: "100%" }}
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.heartbeat_subscribe?.address?.type
                            }
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.heartbeat_subscribe?.address?.type
                            }
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "heartbeat_subscribe",
                                "address",
                                {
                                  type: event.target.value,
                                  value: getAddressValue(
                                    event.target.value as string
                                  ),
                                }
                              );
                            }}
                          >
                            <MenuItem value="unicast">
                              Unicast (0x0001–0x7FFF)
                            </MenuItem>
                            <MenuItem value="group">
                              Group (0xC000–0xFFFF)
                            </MenuItem>
                            <MenuItem value="virtual">
                              Virtual (0x8000–0xBFFF)
                            </MenuItem>
                          </Select>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <TextField
                            required
                            id="standard-error"
                            variant="standard"
                            sx={{ width: "100%" }}
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.heartbeat_subscribe?.address?.value
                            }
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.heartbeat_subscribe?.address?.value
                            }
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "heartbeat_subscribe",
                                "address",
                                {
                                  type: setupData[
                                    node.data.configuration.elements[0]
                                      .unicastAddress
                                  ]?.heartbeat_subscribe?.address?.type,
                                  value: event.target.value,
                                }
                              );
                            }}
                            error={
                              !verifyAddressValue(
                                setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.heartbeat_subscribe?.address
                                  ?.value as string,
                                setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.heartbeat_subscribe?.address?.type as string
                              )
                            }
                          />
                        </Box>
                      </Stack>
                      <Stack
                        direction="row"
                        sx={{ width: "100%", alignItems: "center" }}
                        spacing={2}
                      >
                        <Box sx={{ flex: 1 }}>
                          <p>
                            Subscribe Count:{" "}
                            {
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.heartbeat_subscribe?.count.label
                            }
                          </p>
                          <Slider
                            max={65535} // 0xFFFF (Actual max is 0xFFFE) - Number of Heartbeat messages received (More than 0xFFFE messages have been received) (mesh profile 4.2.18.3)
                            min={0} // 0x0000 - Number of Heartbeat messages received (mesh profile 4.2.18.3)
                            step={1}
                            onChange={(
                              event: Event,
                              value: number | number[]
                            ) => {
                              let label;
                              if (Array.isArray(value)) {
                                value = value[0];
                              }
                              switch (value) {
                                case 65535:
                                  label = "Stop counting";
                                  break;
                                default:
                                  label = `${value} time(s)`;
                              }
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "heartbeat_subscribe",
                                "count",
                                {
                                  value: value,
                                  label: label,
                                }
                              );
                            }}
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.heartbeat_subscribe?.count.value
                            }
                            valueLabelDisplay="auto"
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <p>
                            Period Log:{" "}
                            {
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.heartbeat_subscribe?.periodLog.label
                            }
                          </p>
                          <Slider
                            min={0} // 0x00 - Heartbeat messages are not being sent periodically (mesh profile 4.2.18.4)
                            max={17} // 0x11 - Remaining period in 2(n-1) seconds for processing periodical Heartbeat messages (mesh profile 4.2.18.4)
                            valueLabelDisplay="auto"
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.heartbeat_subscribe?.periodLog.value
                            }
                            onChange={(
                              event: Event,
                              value: number | number[]
                            ) => {
                              let label;
                              if (Array.isArray(value)) {
                                value = value[0];
                              }
                              switch (value) {
                                case 0:
                                  label = "Not sent";
                                  break;
                                default:
                                  label = `${2 ** (value - 1)} second(s)`;
                              }
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "heartbeat_subscribe",
                                "periodLog",
                                {
                                  value: value,
                                  label: label,
                                }
                              );
                            }}
                          />
                        </Box>
                      </Stack>
                      <Stack direction="row" sx={{ width: "100%" }} spacing={2}>
                        <Box sx={{ flex: 1 }}>
                          <p>
                            Min hops:{" "}
                            {
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.heartbeat_subscribe?.minHops.label
                            }
                          </p>
                          <Slider
                            min={0} // 0x00 - No Heartbeat messages have been received (mesh profile 4.2.18.5)
                            max={127} // 0x7F - The Heartbeat Subscription Min Hops state (mesh profile 4.2.18.5)
                            valueLabelDisplay="auto"
                            marks
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.heartbeat_subscribe?.minHops.value
                            }
                            onChange={(
                              event: Event,
                              value: number | number[]
                            ) => {
                              let label;
                              if (Array.isArray(value)) {
                                value = value[0];
                              }
                              switch (value) {
                                case 0:
                                  label = "No data";
                                  break;
                                default:
                                  label = `${value} hop(s)`;
                              }
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "heartbeat_subscribe",
                                "minHops",
                                {
                                  value: value,
                                  label: label,
                                }
                              );
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <p>
                            Max hops:{" "}
                            {
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ]?.heartbeat_subscribe?.maxHops.label
                            }
                          </p>
                          <Slider
                            min={0} // 0x00 - No Heartbeat messages have been received (mesh profile 4.2.18.6)
                            max={127} // 0x7F - The Heartbeat Subscription Max Hops state (mesh profile 4.2.18.6)
                            valueLabelDisplay="auto"
                            marks
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.heartbeat_subscribe?.maxHops.value
                            }
                            onChange={(
                              event: Event,
                              value: number | number[]
                            ) => {
                              let label;
                              if (Array.isArray(value)) {
                                value = value[0];
                              }
                              switch (value) {
                                case 0:
                                  label = "No data";
                                  break;
                                default:
                                  label = `${value} hop(s)`;
                              }
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "heartbeat_subscribe",
                                "maxHops",
                                {
                                  value: value,
                                  label: label,
                                }
                              );
                            }}
                          />
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() =>
                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "heartbeat_subscribe",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </DialogActions>
              </Dialog>
              <Dialog
                open={
                  openSetupDialog[
                    node.data.configuration.elements[0]
                      .unicastAddress as keyof typeof openSetupDialog
                  ]?.relay
                }
                onClose={() =>
                  handleClose(
                    node.data.configuration.elements[0].unicastAddress,
                    "relay",
                    node.data.composition.elements[0].models[0]
                  )
                }
                slotProps={{
                  paper: {
                    component: "form",
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                      event.preventDefault();

                      handleChange(
                        node.data.configuration.elements[0].unicastAddress,
                        "relay",
                        "saved",
                        true
                      );

                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "relay",
                        node.data.composition.elements[0].models[0],
                        false
                      );
                    },
                  },
                }}
              >
                <DialogTitle>Relay</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    <p>
                      The Relay Retransmit state is a composite state that
                      controls parameters of retransmission of the Network PDU
                      relayed by the node. The state includes a Relay Retransmit
                      Count and a Relay Retransmit Interval Steps states. There
                      is a single instance of this state for the node. (From
                      &quot;Mesh Profile 1.0.1&quot;)
                    </p>
                  </DialogContentText>
                  <Box sx={{ padding: "10px" }}>
                    <Stack direction="column" spacing={1}>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          display: "flex",
                          width: "100%",
                        }}
                      >
                        <p>Unicast Address:</p>
                        <Box sx={{ flex: 1 }}>
                          <Select
                            required
                            variant="standard"
                            sx={{ width: "100%" }}
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.relay?.unicastAddress.index
                            }
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.relay?.unicastAddress.index
                            }
                            label="Unicast Address"
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "relay",
                                "unicastAddress",
                                {
                                  index: Number(event.target.value),
                                  value:
                                    node.data.configuration.elements[
                                      Number(event.target.value)
                                    ].unicastAddress,
                                }
                              );
                            }}
                          >
                            {node.data.configuration.elements.map(
                              (element, index) => (
                                <MenuItem value={index.toString()} key={index}>
                                  {element.unicastAddress}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </Box>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          display: "flex",
                          width: "100%",
                        }}
                      >
                        <Button
                          variant="text"
                          sx={{
                            color: "black",
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                          onClick={() => {
                            handleChange(
                              node.data.configuration.elements[0]
                                .unicastAddress,
                              "relay",
                              "relay",
                              !setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.relay?.relay
                            );
                          }}
                        >
                          <p>
                            Enable Relay:{" "}
                            {setupData[
                              node.data.configuration.elements[0]
                                .unicastAddress as keyof typeof setupData
                            ]?.relay?.relay
                              ? "Enabled"
                              : "Disabled"}
                          </p>
                          <Switch
                            checked={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.relay?.relay
                            }
                          />
                        </Button>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          display: "flex",
                          width: "100%",
                        }}
                      >
                        {setupData[
                          node.data.configuration.elements[0]
                            .unicastAddress as keyof typeof setupData
                        ]?.relay?.relay && (
                          <>
                            <Box sx={{ flex: 1 }}>
                              <p>
                                Count:{" "}
                                {(setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress as keyof typeof setupData
                                ]?.relay?.count || 0) + 1}{" "}
                                (re)transmission(s)
                              </p>
                              <Slider
                                min={0} // 3 bit value (0x00) (mesh profile 4.2.20.1)
                                max={7} // 3 bit value (0x07) (mesh profile 4.2.20.1)
                                valueLabelFormat={(value) => {
                                  return `${value + 1} (re)transmission(s)`; // 1 hop steps (mesh profile 4.2.20.1)
                                }}
                                onChange={(event, value) => {
                                  handleChange(
                                    node.data.configuration.elements[0]
                                      .unicastAddress,
                                    "relay",
                                    "count",
                                    value
                                  );
                                }}
                                valueLabelDisplay="auto"
                              />
                            </Box>

                            <Box sx={{ flex: 1 }}>
                              <p>
                                Interval Steps:{" "}
                                {((setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress as keyof typeof setupData
                                ]?.relay?.step || 0) +
                                  1) *
                                  10}{" "}
                                ms
                              </p>
                              <Slider
                                min={0} // 5 bit value (0x00) (mesh profile 4.2.20.2)
                                max={31} // 5 bit value (0x1F) (mesh profile 4.2.20.2)
                                valueLabelFormat={(value) => {
                                  return `${(value + 1) * 10} ms`; // 10ms steps, retransmission interval = (Relay Retransmit Interval Steps + 1) * 10 (mesh profile 4.2.20.2)
                                }}
                                valueLabelDisplay="auto"
                                onChange={(event, value) => {
                                  handleChange(
                                    node.data.configuration.elements[0]
                                      .unicastAddress,
                                    "relay",
                                    "step",
                                    value
                                  );
                                }}
                              />
                            </Box>
                          </>
                        )}
                      </Stack>
                    </Stack>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() =>
                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "relay",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </DialogActions>
              </Dialog>
              <Dialog
                open={
                  openSetupDialog[
                    node.data.configuration.elements[0]
                      .unicastAddress as keyof typeof openSetupDialog
                  ]?.proxy
                }
                onClose={() =>
                  handleClose(
                    node.data.configuration.elements[0].unicastAddress,
                    "proxy",
                    node.data.composition.elements[0].models[0]
                  )
                }
                slotProps={{
                  paper: {
                    component: "form",
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                      event.preventDefault();

                      handleChange(
                        node.data.configuration.elements[0].unicastAddress,
                        "proxy",
                        "saved",
                        true
                      );

                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "proxy",
                        node.data.composition.elements[0].models[0],
                        false
                      );
                    },
                  },
                }}
              >
                <DialogTitle>Proxy</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    <p>
                      The GATT Proxy state indicates if the Proxy feature (see
                      Section 3.4.6.2) is supported. If the feature is
                      supported, the state indicates and controls the Proxy
                      feature. (From &quot;Mesh Profile 1.0.1&quot;)
                    </p>
                  </DialogContentText>
                  <Box sx={{ padding: "10px" }}>
                    <Stack direction="column" spacing={1}>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          display: "flex",
                          width: "100%",
                        }}
                      >
                        <p>Unicast Address:</p>
                        <Box sx={{ flex: 1 }}>
                          <Select
                            required
                            variant="standard"
                            sx={{ width: "100%" }}
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.proxy?.unicastAddress.index
                            }
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.proxy?.unicastAddress.index
                            }
                            label="Unicast Address"
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "proxy",
                                "unicastAddress",
                                {
                                  index: Number(event.target.value),
                                  value:
                                    node.data.configuration.elements[
                                      Number(event.target.value)
                                    ].unicastAddress,
                                }
                              );
                            }}
                          >
                            {node.data.configuration.elements.map(
                              (element, index) => (
                                <MenuItem value={index.toString()} key={index}>
                                  {element.unicastAddress}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </Box>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          display: "flex",
                          width: "100%",
                        }}
                      >
                        <Button
                          variant="text"
                          sx={{
                            color: "black",
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                          onClick={() => {
                            handleChange(
                              node.data.configuration.elements[0]
                                .unicastAddress,
                              "proxy",
                              "proxy",
                              !setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.proxy?.proxy
                            );
                          }}
                        >
                          <p>
                            Enable Proxy:{" "}
                            {setupData[
                              node.data.configuration.elements[0]
                                .unicastAddress as keyof typeof setupData
                            ]?.proxy?.proxy
                              ? "Enabled"
                              : "Disabled"}
                          </p>
                          <Switch
                            checked={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.proxy?.proxy
                            }
                          />
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() =>
                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "proxy",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </DialogActions>
              </Dialog>
              <Dialog
                open={
                  openSetupDialog[
                    node.data.configuration.elements[0]
                      .unicastAddress as keyof typeof openSetupDialog
                  ]?.ttl
                }
                onClose={() =>
                  handleClose(
                    node.data.configuration.elements[0].unicastAddress,
                    "ttl",
                    node.data.composition.elements[0].models[0]
                  )
                }
                slotProps={{
                  paper: {
                    component: "form",
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                      event.preventDefault();

                      handleChange(
                        node.data.configuration.elements[0].unicastAddress,
                        "ttl",
                        "saved",
                        true
                      );

                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "ttl",
                        node.data.composition.elements[0].models[0],
                        false
                      );
                    },
                  },
                }}
              >
                <DialogTitle>TTL</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    <p>
                      The Default TTL state determines the TTL value used when
                      sending messages. The Default TTL is applied by the access
                      layer unless the application specifies a TTL. (From
                      &quot;Mesh Profile 1.0.1&quot;)
                    </p>
                  </DialogContentText>
                  <Box sx={{ padding: "10px" }}>
                    <Stack direction="column" spacing={1}>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          display: "flex",
                          width: "100%",
                        }}
                      >
                        <p>Unicast Address:</p>
                        <Box sx={{ flex: 1 }}>
                          <Select
                            required
                            variant="standard"
                            sx={{ width: "100%" }}
                            defaultValue={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.ttl?.unicastAddress.index
                            }
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.ttl?.unicastAddress.index
                            }
                            label="Unicast Address"
                            onChange={(event) => {
                              handleChange(
                                node.data.configuration.elements[0]
                                  .unicastAddress,
                                "ttl",
                                "unicastAddress",
                                {
                                  index: Number(event.target.value),
                                  value:
                                    node.data.configuration.elements[
                                      Number(event.target.value)
                                    ].unicastAddress,
                                }
                              );
                            }}
                          >
                            {node.data.configuration.elements.map(
                              (element, index) => (
                                <MenuItem value={index.toString()} key={index}>
                                  {element.unicastAddress}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </Box>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          display: "flex",
                          width: "100%",
                        }}
                      >
                        <p>TTL: {setupData[node.data.configuration.elements[0].unicastAddress]?.ttl?.ttl || 0}</p>
                        <Box sx={{ flex: 1 }}>
                          <Slider
                            min={0} // 0x00 (mesh profile 4.2.7)
                            max={127} // 0x7F (mesh profile 4.2.7)
                            step={null}
                            marks={[
                              { value: 0 },
                              ...Array.from({ length: 127 }, (_, i) => ({
                                value: i === 0 ? 2 : i + 1,
                              })),
                            ]}
                            valueLabelFormat={(value) => value.toString()}
                            value={
                              setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ]?.ttl?.ttl
                            }
                            onChange={(event, value) => {
                              handleChange(
                                node.data.configuration.elements[0].unicastAddress,
                                "ttl",
                                "ttl",
                                value
                              );
                            }}
                          />
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() =>
                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "ttl",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </DialogActions>
              </Dialog>
              <Divider />
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={valueSetupTab}
                  onChange={handleChangeSetupTab}
                  centered
                >
                  <Tab label="Model config" />
                  <Tab label="Network Behavior" />
                  <Tab label="Node configuration" />
                </Tabs>
              </Box>
              <CustomTabPanel value={valueSetupTab} index={0}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Button
                    variant="outlined"
                    sx={{
                      width: "30%",
                      borderRadius: "18px",
                      fontSize: "1.1rem",
                      border: { md: "1px solid lightgray", xs: "0px" },
                      color: "black",
                    }}
                    onClick={() =>
                      handleClickOpen(
                        node.data.configuration.elements[0].unicastAddress,
                        "bind",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Bind
                    </Typography>
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      width: "30%",
                      borderRadius: "18px",
                      fontSize: "1.1rem",
                      border: { md: "1px solid lightgray", xs: "0px" },
                      color: "black",
                    }}
                    onClick={() =>
                      handleClickOpen(
                        node.data.configuration.elements[0].unicastAddress,
                        "publish",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Publish
                    </Typography>
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      width: "30%",
                      borderRadius: "18px",
                      fontSize: "1.1rem",
                      border: { md: "1px solid lightgray", xs: "0px" },
                      color: "black",
                    }}
                    onClick={() =>
                      handleClickOpen(
                        node.data.configuration.elements[0].unicastAddress,
                        "subscribe",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Subscribe
                    </Typography>
                  </Button>
                </Stack>
              </CustomTabPanel>

              <CustomTabPanel value={valueSetupTab} index={1}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Button
                    variant="outlined"
                    sx={{
                      width: "30%",
                      borderRadius: "18px",
                      fontSize: "1.1rem",
                      border: { md: "1px solid lightgray", xs: "0px" },
                      color: "black",
                    }}
                    onClick={() =>
                      handleClickOpen(
                        node.data.configuration.elements[0].unicastAddress,
                        "identity",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Identity
                    </Typography>
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      width: "30%",
                      borderRadius: "18px",
                      fontSize: "1.1rem",
                      border: { md: "1px solid lightgray", xs: "0px" },
                      color: "black",
                    }}
                    onClick={() =>
                      handleClickOpen(
                        node.data.configuration.elements[0].unicastAddress,
                        "beacon",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Beacon
                    </Typography>
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      width: "30%",
                      borderRadius: "18px",
                      fontSize: "1.1rem",
                      border: { md: "1px solid lightgray", xs: "0px" },
                      color: "black",
                    }}
                    onClick={() =>
                      handleClickOpen(
                        node.data.configuration.elements[0].unicastAddress,
                        "heartbeat_publish",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Heartbeat Publish
                    </Typography>
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      width: "30%",
                      borderRadius: "18px",
                      fontSize: "1.1rem",
                      border: { md: "1px solid lightgray", xs: "0px" },
                      color: "black",
                    }}
                    onClick={() =>
                      handleClickOpen(
                        node.data.configuration.elements[0].unicastAddress,
                        "heartbeat_subscribe",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Heartbeat Subscribe
                    </Typography>
                  </Button>
                </Stack>
              </CustomTabPanel>
              <CustomTabPanel value={valueSetupTab} index={2}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Button
                    variant="outlined"
                    sx={{
                      width: "30%",
                      borderRadius: "18px",
                      fontSize: "1.1rem",
                      border: { md: "1px solid lightgray", xs: "0px" },
                      color: "black",
                    }}
                    onClick={() =>
                      handleClickOpen(
                        node.data.configuration.elements[0].unicastAddress,
                        "relay",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Relay
                    </Typography>
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      width: "30%",
                      borderRadius: "18px",
                      fontSize: "1.1rem",
                      border: { md: "1px solid lightgray", xs: "0px" },
                      color: "black",
                    }}
                    onClick={() =>
                      handleClickOpen(
                        node.data.configuration.elements[0].unicastAddress,
                        "proxy",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Proxy
                    </Typography>
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      width: "30%",
                      borderRadius: "18px",
                      fontSize: "1.1rem",
                      border: { md: "1px solid lightgray", xs: "0px" },
                      color: "black",
                    }}
                    onClick={() =>
                      handleClickOpen(
                        node.data.configuration.elements[0].unicastAddress,
                        "ttl",
                        node.data.composition.elements[0].models[0]
                      )
                    }
                  >
                    <Typography variant="body2" fontWeight="bold">
                      TTL
                    </Typography>
                  </Button>
                </Stack>
              </CustomTabPanel>
              {(setupData[node.data.configuration.elements[0].unicastAddress]
                ?.bind?.saved ||
                setupData[node.data.configuration.elements[0].unicastAddress]
                  ?.publish?.saved ||
                setupData[node.data.configuration.elements[0].unicastAddress]
                  ?.subscribe?.saved ||
                setupData[node.data.configuration.elements[0].unicastAddress]
                  ?.identity?.saved ||
                setupData[node.data.configuration.elements[0].unicastAddress]
                  ?.beacon?.saved ||
                setupData[node.data.configuration.elements[0].unicastAddress]
                  ?.heartbeat_publish?.saved ||
                setupData[node.data.configuration.elements[0].unicastAddress]
                  ?.heartbeat_subscribe?.saved ||
                setupData[node.data.configuration.elements[0].unicastAddress]
                  ?.relay?.saved ||
                setupData[node.data.configuration.elements[0].unicastAddress]
                  ?.proxy?.saved ||
                setupData[node.data.configuration.elements[0].unicastAddress]
                  ?.ttl?.saved
                ) && (
                <ExecuteDialog
                  sx={{
                    width: "100%",
                    minHeight: "50px",
                    border: { md: "1px solid lightgray", xs: "0px" },
                    borderRadius: "0px",
                  }}
                  buttonTitle="Apply changes"
                  dialogTitle={`Apply changes for node ${node.data.configuration.elements[0].unicastAddress}`}
                  text={[
                    "Are you sure you want to apply these changes?",
                    setupData[
                      node.data.configuration.elements[0].unicastAddress
                    ]?.bind?.saved
                      ? `Bind: Add bind to unicast address: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.bind?.unicastAddress.value
                        }, model: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.bind?.model.value
                        }, application key index: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.bind?.appKeyIndex
                        }`
                      : "Bind: Nothing to change.",
                    setupData[
                      node.data.configuration.elements[0].unicastAddress
                    ]?.publish?.saved
                      ? `Publish: Add publish to unicast address: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.publish?.unicastAddress.value
                        }, model: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.publish?.model.value
                        },  ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.publish?.address?.type
                        }
                        address: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.publish?.address?.value
                        }, publication period: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.publish?.publicationPeriod?.step
                        } ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.publish?.publicationPeriod?.res
                        } retransmissionCount: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.publish?.retransmitionCount?.cnt
                        } ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.publish?.retransmitionCount?.per
                        } Application key index: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.publish?.appKeyIndex
                        }`
                      : "Publish: Nothing to change.",
                    setupData[
                      node.data.configuration.elements[0].unicastAddress
                    ]?.subscribe?.saved
                      ? `Subscribe: Add subscribe to unicast address: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.subscribe?.unicastAddress.value
                        }, model: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.subscribe?.model.value
                        },  ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.subscribe?.address?.type
                        }
                        address: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.subscribe?.address?.value
                        }, application key index: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.subscribe?.appKeyIndex
                        }`
                      : "Subscribe: Nothing to change.",
                    setupData[
                      node.data.configuration.elements[0].unicastAddress
                    ]?.identity?.saved
                      ? `Identity: Add identity to unicast address: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.identity?.unicastAddress.value
                        }, state: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.identity?.state
                        }`
                      : "Identity: Nothing to change.",
                    setupData[
                      node.data.configuration.elements[0].unicastAddress
                    ]?.beacon?.saved
                      ? `Beacon: Add beacon to unicast address: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.beacon?.unicastAddress.value
                        }, state: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.beacon?.state
                        }`
                      : "Beacon: Nothing to change.",
                    setupData[
                      node.data.configuration.elements[0].unicastAddress
                    ]?.heartbeat_publish?.saved
                      ? `Heartbeat Publish: Add heartbeat publish to unicast address: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.heartbeat_publish?.unicastAddress.value
                        }, address: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.heartbeat_publish?.address?.value
                        }, count: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.heartbeat_publish?.retransmitCount.label
                        }, period: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.heartbeat_publish?.periodLog.label
                        }, ttl: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.heartbeat_publish?.ttl
                        }, network key index: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.heartbeat_publish?.netKeyIndex
                        }`
                      : "Heartbeat Publish: Nothing to change.",
                    setupData[
                      node.data.configuration.elements[0].unicastAddress
                    ]?.heartbeat_subscribe?.saved
                      ? `Heartbeat Subscribe: Add heartbeat subscribe to unicast address: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.heartbeat_subscribe?.unicastAddress.value
                        }, address: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.heartbeat_subscribe?.address?.value
                        }, period: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.heartbeat_subscribe?.periodLog.label
                        }, count: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.heartbeat_subscribe?.count.label
                        }, max hops: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.heartbeat_subscribe?.maxHops.label
                        }, min hops: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.heartbeat_subscribe?.minHops.label
                        }`
                      : "Heartbeat Subscribe: Nothing to change.",
                    setupData[
                      node.data.configuration.elements[0].unicastAddress
                    ]?.relay?.saved
                      ? `Relay: Add relay to unicast address: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.relay?.unicastAddress.value
                        }, relay enabled: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.relay?.relay
                        }, count: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.relay?.count
                        }, interval steps: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.relay?.step
                        }`
                      : "Relay: Nothing to change.",
                    setupData[
                      node.data.configuration.elements[0].unicastAddress
                    ]?.proxy?.saved
                      ? `Proxy: Add proxy to unicast address: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.proxy?.unicastAddress.value
                        }, proxy enabled: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.proxy?.proxy
                        }`
                      : "Proxy: Nothing to change.",
                    setupData[
                      node.data.configuration.elements[0].unicastAddress
                    ]?.ttl?.saved
                      ? `TTL: Add ttl to unicast address: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.ttl?.unicastAddress.value
                        }, ttl: ${
                          setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.ttl?.ttl
                        }`
                      : "TTL: Nothing to change.",
                  ]}
                  key="applyChanges"
                  fetcherData={{
                    executeUrl: `config`,
                    getDataUrl: "/config?query=PROCESS",
                    type: "POST",
                    data: {
                      setupData:
                        setupData[
                          node.data.configuration.elements[0].unicastAddress
                        ],
                    },
                  }}
                />
              )}
            </Box>
          )}
          {openDescription[
            node.data.configuration.elements[0]
              .unicastAddress as keyof typeof openDescription
          ] && (
            <ExecuteDialog
              sx={{
                width: "100%",
                minHeight: "50px",
                color: "red",
                borderRadius: "18px",
                border: { md: "1px solid lightgray", xs: "0px" },
                borderTop: "0px",
                borderTopLeftRadius: "0px",
                borderTopRightRadius: "0px",
              }}
              buttonTitle="Remove Node"
              dialogTitle={`Remove Node ${node.data.configuration.elements[0].unicastAddress}`}
              text={["Are you sure you want to remove this node?"]}
              key="removeNode"
              fetcherData={{
                executeUrl: `config?address=${node.data.configuration.elements[0].unicastAddress}`,
                getDataUrl: "/config?query=PROCESS",
                type: "DELETE",
                data: {},
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default NodesElement;
