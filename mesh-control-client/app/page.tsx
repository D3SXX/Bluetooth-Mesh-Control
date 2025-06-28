"use client";
import { useState } from "react";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import useSWR from "swr";
import { fetcherDELETE, fetcherGET, fetcherPOST } from "./utils/fetcher";

import { ServerResponse } from "../interfaces/global";

export default function Home() {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const { data, isLoading, error } = useSWR<ServerResponse>("/config", fetcherGET, {
    refreshInterval: 3000,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleOpen = (name: string) =>
    setOpen((prev) => ({ ...prev, [name]: true }));
  const handleClose = (name: string) =>
    setOpen((prev) => ({ ...prev, [name]: false }));

  console.log(data);

  return (
    <main>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid lightgray",
          borderRadius: "10px",
          p: 2,
        }}
      >
        <Typography variant="h5">Welcome to Mesh Control!</Typography>
        <Typography variant="h6">
          Here you can manage your bluetooth mesh network.
        </Typography>
        <Box sx={{ display: "flex", mt: 2, borderRadius: "10px" }}>
          <Stack direction="row" spacing={1.5}>
            <Button size="small" variant="outlined" color="secondary">
              Available Nodes: {data?.config.NODES.nodes.length}
            </Button>
            <Button size="small" variant="outlined" color="secondary">
              Available Application Keys: {data?.keys.APPKEYS.length}
            </Button>
            <Button size="small" variant="outlined" color="secondary">
              Available Network Keys: {data?.keys.NETKEYS.length}
            </Button>
            <Button size="small" variant="outlined" color="secondary">
              Meshctl version: {data?.server.MESHCTL}
            </Button>
            <Button size="small" variant="outlined" color="secondary">
              Mesh Control version: {data?.server.VERSION}
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            m: 2,
          }}
        >
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="info"
              sx={{ width: "250px", height: "50px" }}
              onClick={() => handleOpen("bluetooth-adapter")}
            >
              Bluetooth adapter:{" "}
              {data?.controller.DEFAULT && data?.controller.DEFAULT || "not found"}
            </Button>
            <Button
              variant="outlined"
              color="info"
              sx={{ width: "250px", height: "50px" }}
              onClick={() => handleOpen("security-level")}
            >
              Security level: {data?.config.SECURITY_LEVEL}
            </Button>
          </Stack>
        </Box>
      </Box>
      <Box         sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid lightgray",
          borderRadius: "10px",
          p: 2,
          mt: 2,
        }}>
      <Box sx={{ display: "flex", borderRadius: "10px" }}>
          <Stack direction="row" spacing={1.5}>
            <Button size="small" variant="outlined" color="error" onClick={() => handleOpen("reset-nodes-list")}>
              Reset nodes list
            </Button>
            <Button size="small" variant="outlined" color="error" onClick={() => handleOpen("reset-appkeys-list")}>
              Reset Application Keys list
            </Button>
            <Button size="small" variant="outlined" color="error" onClick={() => handleOpen("reset-netkeys-list")}>
              Reset Network Keys list
            </Button>
          </Stack>
        </Box>
      </Box>
      <Dialog
        open={open["bluetooth-adapter"]}
        onClose={() => handleClose("bluetooth-adapter")}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Bluetooth adapter</DialogTitle>
        {data?.controller.LIST && data?.controller.LIST.length >= 1 && <DialogContent>
          <Select
            value={data?.controller.DEFAULT_INDEX}
            sx={{ width: "100%" }}
            onChange={(e) => {
              fetcherPOST({
                "defaultAdapter":e.target.value
              })("/controller")
            }}
          >
            {Object.entries(data?.controller.LIST || {}).map(([key, value], index) => (
              <MenuItem key={key} value={index}>
                {" "}
                {index == data?.controller.DEFAULT_INDEX ? (
                  <b>Default Adapter {index+1}: {data?.controller.LIST[index].Address} ({data?.controller.LIST[index].Name})</b>
                ) : (
                  `Adapter ${index+1}: ${data?.controller.LIST[index].Address} (${data?.controller.LIST[index].Name})`
                )}
              </MenuItem>
            ))}
          </Select>
          <Stack
            direction="row"
            sx={{ width: "100%"}}
            spacing={1.5}
          >
            <List>
               Device Information
              {Object.entries(data?.controller.LIST[data?.controller.DEFAULT_INDEX] || {}).map(
                ([key, value]) =>
                  key == "UUID" ? (
                    <ListItemButton key={key}>
                      <ListItemText>
                        {key}: {Object.keys(value).length} Items
                      </ListItemText>
                    </ListItemButton>
                  ) : (
                    <ListItemButton key={key}>
                      <ListItemText>
                        {key}: {value.toString()}
                      </ListItemText>
                    </ListItemButton>
                  )
              )}
            </List>
            <List>
              UUID Information
              {Object.entries(data?.controller.LIST[data?.controller.DEFAULT_INDEX].UUID || {}).map(
                ([key, value]) => (
                  <ListItemButton
                    key={key}
                    sx={{ width: "auto", whiteSpace: "nowrap" }}
                  >
                    <ListItemText>
                      {value.toString()}
                    </ListItemText>
                  </ListItemButton>
                )
              )}
            </List>
          </Stack>
        </DialogContent>}
      </Dialog>
      <Dialog
        open={open["security-level"]}
        onClose={() => handleClose("security-level")}
        fullWidth
      >
        <DialogTitle>Security level</DialogTitle>
        <DialogContent>
          <Box sx={{ m: 2,mt:4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Slider
            defaultValue={data?.config.SECURITY_LEVEL}
            onChange={(e: any) => {
              fetcherPOST({
                "security":e.target.value
              })("/config")
            }}
            min={0}
            max={2}
            step={1}
            marks={[
              { value: 0, label: "Low" },
              { value: 1, label: "Medium" },
              { value: 2, label: "High" },
            ]}
            getAriaValueText={(value) => {
              switch (value) {
                case 0:
                  return "Low";
                case 1:
                  return "Medium";
                case 2:
                  return "High";
                default:
                  return "";
              }
            }}
            valueLabelDisplay="auto"
          />
          <Typography>
            Current security level: {data?.config.SECURITY_LEVEL} (
            {data?.config.SECURITY_LEVEL === 0
              ? "Low"
              : data?.config.SECURITY_LEVEL === 1
              ? "Medium"
              : "High"}
            )
          </Typography>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog
        open={open["reset-nodes-list"]}
        onClose={() => handleClose("reset-nodes-list")}
        fullWidth
      >
        <DialogTitle>Reset nodes list</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>Warning: This action will remove all nodes from the nodes list in config file. If a node was not unprovisined beforehand, it will have to be reset manually.</Typography>
          <Button sx={{ width: "100%" }} variant="outlined" color="error" onClick={() => {
            fetcherDELETE("/config?type=nodes")
          }}>Reset nodes list</Button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={open["reset-appkeys-list"]}
        onClose={() => handleClose("reset-appkeys-list")}
        fullWidth
      >
        <DialogTitle>Reset Application Keys list</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>Warning: This action will remove all application keys from the application keys list in config file. This should be used only for debugging purposes.</Typography>
          <Button sx={{ width: "100%" }} variant="outlined" color="error" onClick={() => {
            fetcherDELETE("/config?type=appkeys")
          }}>Reset application keys list</Button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={open["reset-netkeys-list"]}
        onClose={() => handleClose("reset-netkeys-list")}
        fullWidth
      >
        <DialogTitle>Reset Network Keys list</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>Warning: This action will remove all network keys from the network keys list in config file. This should be used only for debugging purposes.</Typography>
          <Button sx={{ width: "100%" }} variant="outlined" color="error" onClick={() => {
            fetcherDELETE("/config?type=netkeys")
          }}>Reset network keys list</Button>
        </DialogContent>
      </Dialog>
    </main>
  );
}
