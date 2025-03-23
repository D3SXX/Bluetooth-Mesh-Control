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
} from "@mui/material";
import Grid from "@mui/material/Grid2";
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

  const setDefaultValues = (node: string, type: string, defaultModel: string) => {
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
    }
  };

  const handleClickOpen = (node: string, type: string, defaultModel: string) => {
    if (type === "bind" || type === "publish" || type === "subscribe") {
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
    }
  };

  const handleClose = (node: string, type: string, defaultModel: string, reset: boolean = true) => {
    if (type === "bind" || type === "publish" || type === "subscribe") {
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
    }
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
          setDefaultValues(nodeAddress, "bind", node.composition.elements[0].models[0]);
          setDefaultValues(nodeAddress, "publish", node.composition.elements[0].models[0]);
          setDefaultValues(nodeAddress, "subscribe", node.composition.elements[0].models[0]);
        }
      });
    }
  }, [data]);

  const nodesList =
    data && data.NODES
      ? data.NODES.nodes.map((node) => ({
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

  const handleChangeDescriptionTab = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setValueDescriptionTab(newValue);
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
            width: { xs: "100%", md: "500px" },
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
                {Object.entries({
                  Relay: node.data.composition.features.relay,
                  Proxy: node.data.composition.features.proxy,
                  Friend: node.data.composition.features.friend,
                  LPN: node.data.composition.features.lpn,
                }).map(([key, value]) => (
                  <React.Fragment key={key}>
                    <ListItemButton component="a" sx={{}}>
                      <Stack direction="column" spacing={0} alignItems="center">
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
                          value={setupData[
                            node.data.configuration.elements[0].unicastAddress
                          ]?.bind?.unicastAddress.index}
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
                              node.data.configuration.elements[0].unicastAddress,
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
                              <MenuItem
                                value={index}
                                key={index}
                              >
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
                                node.data.configuration.elements[0].unicastAddress,
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
                                <MenuItem
                                  value={index.toString()}
                                  key={index}
                                >
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
                            <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
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
                                      node.data.configuration.elements[0].unicastAddress,
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
                                node.data.configuration.elements[0].unicastAddress,
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
                                    ]?.subscribe?.unicastAddress.index as number
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
                                node.data.configuration.elements[0].unicastAddress,
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
              <Divider />
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="center"
                sx={{ padding: "10px" }}
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
              {(setupData[node.data.configuration.elements[0].unicastAddress]
                ?.bind?.saved ||
                setupData[node.data.configuration.elements[0].unicastAddress]
                  ?.publish?.saved ||
                setupData[node.data.configuration.elements[0].unicastAddress]
                  ?.subscribe?.saved) && (
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
