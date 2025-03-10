"use client";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Switch from "@mui/material/Switch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import { Button, createTheme, Paper, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { fetcherGET, fetcherPOST } from "../utils/fetcher";
import ExecuteDialog from "./ExecuteDialog";
import CircularProgress from "@mui/material/CircularProgress";
import LightbulbCircleIcon from "@mui/icons-material/LightbulbCircle";
import LinearProgress from "@mui/material/LinearProgress";

import BluetoothSearchingIcon from "@mui/icons-material/BluetoothSearching";
import BluetoothDisabledIcon from "@mui/icons-material/BluetoothDisabled";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
interface UnprovisionedNode {
  OOB: string;
  UUID: string;
  address: string;
  name: string;
}
interface NodesObj {
  [UUID: string]: UnprovisionedNode;
}

const ScanElement = () => {
  const [scanStatus, setScanStatus] = useState(false);
  const [unprovisionedNodes, setUnprovisionedNodes] = useState<
    UnprovisionedNode[]
  >([]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    intervalId = setInterval(async () => {
      try {
        const data = await fetcherGET(
          "/provision?query=UNPROVISIONED_NODES&query=SCAN_ACTIVE"
        );
        let obj;
        try {
          const nodesObj: NodesObj = data["UNPROVISIONED_NODES"];
          const nodesArray = Object.entries(nodesObj).map(
            ([UUID, nodeInfo]: [string, UnprovisionedNode]) => ({
              ...nodeInfo,
              UUID,
            })
          );
          setUnprovisionedNodes(nodesArray);
          setScanStatus(data["SCAN_ACTIVE"]);
        } catch (error) {
          console.error("Error parsing JSON:");
          console.log(error);
        }
      } catch (error) {
        console.error("Error during scan:", error);
      }
    }, 750);
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [scanStatus]);

  const handleCheckboxChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setScanStatus(event.target.checked);
    try {
      await fetcherPOST({ discovery: event.target.checked })("/provision");
    } catch (error) {
      console.error("Error during scan toggle:", error);
    }
  };

  return (
    <Box sx={{ width: "60%", borderRadius: "10px", border: "1px solid lightgray",overflow: "hidden" }}>
      {scanStatus ? <LinearProgress sx={{ height: "6px" }} /> : <></>}
    <Box
      sx={{
        padding: "20px",
      }}
    >
      <Box>
        <Button
          variant="text"
          sx={{
            color: "black",
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
          onClick={() =>
            handleCheckboxChange({ target: { checked: !scanStatus } })
          }
        >
          {scanStatus ? (
            <p className="flex items-center gap-2">
              <BluetoothSearchingIcon /> Scanning
            </p>
          ) : (
            <p className="flex items-center gap-2">
              <BluetoothDisabledIcon /> Not Scanning
            </p>
          )}
          <Stack direction="row" justifyContent="space-between">
            <Stack direction="row"></Stack>
            <Switch checked={scanStatus} />
          </Stack>
        </Button>
      </Box>
      <Box>
        {scanStatus ? <Box sx={{ marginLeft: "8px", marginTop: "8px", marginBottom: "8px"}}>Available Nodes</Box> : <></>}
        <Stack spacing={2}>
          {unprovisionedNodes.map((node) => (
            <ExecuteDialog
              sx={{ color: "black", border: "0px", height: "50px", textAlign: "left", justifyContent: "flex-start"}}
              data={node}
              buttonTitle={node.name ? (<p className="flex items-center gap-2"><LightbulbIcon /> {node.name}</p>) : (<p className="flex items-center gap-2"><LightbulbIcon /> {node.address}</p>)}
              dialogTitle="Provision Node"
              text={[
                `Name: ${node.name}`,
                `Address: ${node.address}`,
                `UUID: ${node.UUID}`,
                `OOB: ${node.OOB}`,
                "Are you sure you want to provision this node?",
              ]}
              key={node.UUID}
              fetcherData={{
                type: "POST",
                executeUrl: "/provision",
                getDataUrl: "/provision?query=PROCESS",
                data: { provision_node: node.UUID },
              }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
    </Box>
  );
};

export default ScanElement;
