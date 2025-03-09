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
    <Box
      sx={{
        width: "60%",
        border: "1px solid lightgray",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <Box>
        <FormGroup>
          <Stack direction="row" justifyContent="space-between">
            <FormControlLabel
              control={
                <Switch checked={scanStatus} onChange={handleCheckboxChange} />
              }
            label="Scan"
          />
          {scanStatus ? <CircularProgress size={30} /> : ""}
          </Stack>
        </FormGroup>
      </Box>
      <Box sx={{ marginTop: 3 }}>
        <Stack spacing={2}>
          {unprovisionedNodes.map((node) => (
            <ExecuteDialog
              sx={{ color: "black", borderColor: "lightgray", height: "50px" }}
              data={node}
              buttonTitle={node.name || node.address}
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
                getDataUrl:
                  "/provision?query=PROCESS",
                data: { provision_node: node.UUID },
              }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default ScanElement;
