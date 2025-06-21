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
import { fetcherGET } from "./utils/fetcher";

import { ServerResponse } from "./interfaces/server";

export default function Home() {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const { data, isLoading, error } = useSWR<ServerResponse>("/meshctl", fetcherGET, {
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
              Available Nodes: {Object.keys(data?.config.NODES).length}
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
      <Dialog
        open={open["bluetooth-adapter"]}
        onClose={() => handleClose("bluetooth-adapter")}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Bluetooth adapter</DialogTitle>
        {data?.controller.LIST.length >= 1 && <DialogContent>
          <Select
            value={data?.controller.DEFAULT_INDEX}
            sx={{ width: "100%" }}
          >
            {Object.entries(data?.controller.LIST || {}).map(([key, value]) => (
              <MenuItem key={key} value={key}>
                {" "}
                {key == data?.controller.DEFAULT_INDEX ? (
                  <b>Default Adapter: {value.Address} ({value.Name})</b>
                ) : (
                  `${value.Address} (${value.Name})`
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
    </main>
  );
}
