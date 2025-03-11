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
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ExecuteDialog from "./ExecuteDialog";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface SetupData {
  [unicastAddress: string]: {
    bind?: {
      unicastAddressIndex: number;
      model: string;
      appKey: string;
    };
    publish?: {
      unicastAddressIndex: number;
      model: string;
      address: string;
      publicationPeriod: number;
      retransmitionCount: number;
      appKey: string;
    };
    subscribe?: {
      unicastAddressIndex: number;
      model: string;
      address: string;
      appKey: string;
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

  const handleClickOpen = (node: string, type: string) => {
    setOpenSetupDialog({
      ...openSetupDialog,
      [node]: {
        ...(openSetupDialog[node as keyof typeof openSetupDialog] || {}),
        [type]: true,
      },
    });
  };

  const handleClose = (node: string, type: string) => {
    setOpenSetupDialog({
      ...openSetupDialog,
      [node]: {
        ...(openSetupDialog[node as keyof typeof openSetupDialog] || {}),
        [type]: false,
      },
    });
  };

  useEffect(() => {
    console.log(setupData);
  }, [setupData]);

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

  useEffect(() => {
    console.log(setupData);
  }, [setupData]);

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
    <Box sx={{ width: {xs: "100%", md: "500px"}, minHeight: "60px" }}>
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
              ]
                ? "0px"
                : "18px",
              borderBottomRightRadius: openDescription[
                node.data.configuration.elements[0].unicastAddress
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
                Item Two
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
                    "bind"
                  )
                }
                slotProps={{
                  paper: {
                    component: "form",
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                      event.preventDefault();
                      const nodeAddress =
                        node.data.configuration.elements[0].unicastAddress;
                      const selectedData =
                        setupData[nodeAddress as keyof typeof setupData];
                      const selectedAppKey = event.currentTarget.appKey.value;

                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "bind"
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
                      Binding. (From "Bluetooth Mesh Glossary of Terms")
                    </p>
                    <p></p>
                  </DialogContentText>
                  <Box sx={{ padding: "10px" }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center" }}
                    >
                      <p>Unicast Address:</p>
                      <Select
                        variant="standard"
                        sx={{ width: "20%" }}
                        label="Unicast Address"
                        onChange={(event) =>
                          setSetupData({
                            ...setupData,
                            [node.data.configuration.elements[0]
                              .unicastAddress]: {
                              ...setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress
                              ],
                              bind: {
                                ...(setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress
                                ]?.bind || {}),
                                unicastAddressIndex: Number(event.target.value),
                                model:
                                  setupData[
                                    node.data.configuration.elements[0]
                                      .unicastAddress
                                  ]?.bind?.model || "",
                                appKey:
                                  setupData[
                                    node.data.configuration.elements[0]
                                      .unicastAddress
                                  ]?.bind?.appKey || "",
                              },
                            },
                          })
                        }
                      >
                        {node.data.configuration.elements.map(
                          (element, index) => (
                            <MenuItem value={index} key={index}>
                              {element.unicastAddress}
                            </MenuItem>
                          )
                        )}
                      </Select>
                      <p>Model:</p>

                      <Select
                        variant="standard"
                        sx={{ width: "20%" }}
                        value={
                          setupData[
                            node.data.configuration.elements[0]
                              .unicastAddress as keyof typeof setupData
                          ]?.model
                        }
                        label="Model"
                        onChange={(event) =>
                          setSetupData({
                            ...setupData,
                            [node.data.configuration.elements[0]
                              .unicastAddress as keyof typeof setupData]: {
                              ...setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ],
                              bind: {
                                ...(setupData[
                                  node.data.configuration.elements[0]
                                    .unicastAddress as keyof typeof setupData
                                ]?.bind || {}),
                                model: event.target.value,
                                appKey:
                                  setupData[
                                    node.data.configuration.elements[0]
                                      .unicastAddress as keyof typeof setupData
                                  ]?.bind?.appKey || "",
                                unicastAddressIndex:
                                  setupData[
                                    node.data.configuration.elements[0]
                                      .unicastAddress as keyof typeof setupData
                                  ]?.bind?.unicastAddressIndex || 0,
                              },
                            },
                          })
                        }
                      >
                        {setupData[
                          node.data.configuration.elements[0]
                            .unicastAddress as keyof typeof setupData
                        ] &&
                          node.data.composition.elements[
                            setupData[
                              node.data.configuration.elements[0]
                                .unicastAddress as keyof typeof setupData
                            ]?.bind
                              ?.unicastAddressIndex as keyof typeof node.data.composition.elements
                          ].models.map((model, index) => (
                            <MenuItem value={model} key={model}>
                              {model}
                            </MenuItem>
                          ))}
                      </Select>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center" }}
                    >
                      <p>Application Key:</p>
                      <Select
                        name="appKey"
                        variant="standard"
                        sx={{ width: "313px" }}
                      >
                        {appKeysList.map((appKey, index) => (
                          <MenuItem value={appKey.key} key={index}>
                            Key {index}: {appKey.key}
                          </MenuItem>
                        ))}
                      </Select>
                    </Stack>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() =>
                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "bind"
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
                    "publish"
                  )
                }
                slotProps={{
                  paper: {
                    component: "form",
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                      event.preventDefault();
                      const nodeAddress =
                        node.data.configuration.elements[0].unicastAddress;
                      const selectedData =
                        setupData[nodeAddress as keyof typeof setupData];
                      const selectedAppKey = event.currentTarget.appKey.value;
                      console.log("Selected Data:", {
                        unicastAddress: selectedData?.unicastAddressIndex,
                        model: selectedData?.model,
                        appKey: selectedAppKey,
                      });

                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "publish"
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
                      Publish Address. (From "Bluetooth Mesh Glossary of Terms")
                    </p>
                  </DialogContentText>
                  <Box sx={{ padding: "10px" }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center" }}
                    >
                      <p>Unicast Address:</p>
                      <Select
                        variant="standard"
                        sx={{ width: "20%" }}
                        value={
                          setupData[
                            node.data.configuration.elements[0]
                              .unicastAddress as keyof typeof setupData
                          ]?.unicastAddress
                        }
                        label="Unicast Address"
                        onChange={(event) =>
                          setSetupData({
                            ...setupData,
                            [node.data.configuration.elements[0]
                              .unicastAddress as keyof typeof setupData]: {
                              ...setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ],
                              unicastAddressIndex: event.target.value,
                            },
                          })
                        }
                      >
                        {node.data.configuration.elements.map(
                          (element, index) => (
                            <MenuItem value={index} key={index}>
                              {element.unicastAddress}
                            </MenuItem>
                          )
                        )}
                      </Select>
                      <p>Model:</p>

                      <Select
                        variant="standard"
                        sx={{ width: "20%" }}
                        value={
                          setupData[
                            node.data.configuration.elements[0]
                              .unicastAddress as keyof typeof setupData
                          ]?.model
                        }
                        label="Model"
                        onChange={(event) =>
                          setSetupData({
                            ...setupData,
                            [node.data.configuration.elements[0]
                              .unicastAddress as keyof typeof setupData]: {
                              ...setupData[
                                node.data.configuration.elements[0]
                                  .unicastAddress as keyof typeof setupData
                              ],
                              model: event.target.value,
                            },
                          })
                        }
                      >
                        {setupData[
                          node.data.configuration.elements[0]
                            .unicastAddress as keyof typeof setupData
                        ] &&
                          node.data.composition.elements[
                            setupData[
                              node.data.configuration.elements[0]
                                .unicastAddress as keyof typeof setupData
                            ]?.bind?.unicastAddressIndex as keyof typeof node.data.composition.elements
                          ].models.map((model, index) => (
                            <MenuItem value={model} key={model}>
                              {model}
                            </MenuItem>
                          ))}
                      </Select>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center" }}
                    >
                      <p>Application Key:</p>
                      <Select
                        name="appKey"
                        variant="standard"
                        sx={{ width: "313px" }}
                      >
                        {appKeysList.map((appKey, index) => (
                          <MenuItem value={appKey.key} key={index}>
                            Key {index}: {appKey.key}
                          </MenuItem>
                        ))}
                      </Select>
                    </Stack>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() =>
                      handleClose(
                        node.data.configuration.elements[0].unicastAddress,
                        "publish"
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
                    border: "1px solid lightgray",
                    color: "black",
                  }}
                  onClick={() =>
                    handleClickOpen(
                      node.data.configuration.elements[0].unicastAddress,
                      "bind"
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
                    border: "1px solid lightgray",
                    color: "black",
                  }}
                  onClick={() =>
                    handleClickOpen(
                      node.data.configuration.elements[0].unicastAddress,
                      "publish"
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
                    border: "1px solid lightgray",
                    color: "black",
                  }}
                  onClick={() =>
                    handleClickOpen(
                      node.data.configuration.elements[0].unicastAddress,
                      "subscribe"
                    )
                  }
                >
                  <Typography variant="body2" fontWeight="bold">
                    Subscribe
                  </Typography>
                </Button>
              </Stack>
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
                border: "1px solid lightgray",
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
