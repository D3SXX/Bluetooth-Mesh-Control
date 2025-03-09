import React, { useEffect } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";
import Step from "@mui/material/Step";
import Stepper from "@mui/material/Stepper";
import LinearProgress from "@mui/material/LinearProgress";
import {
  fetcherDELETE,
  fetcherGET,
  fetcherPOST,
  fetcherPUT,
} from "../utils/fetcher";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";

interface fetcherData {
  type: string; // POST, PUT, DELETE
  executeUrl: string;
  getDataUrl: string;
  data: any;
}

const ExecuteDialog = ({
  sx,
  data,
  buttonTitle,
  dialogTitle,
  text,
  key,
  fetcherData,
}: {
  sx: any;
  data: any;
  buttonTitle: string;
  dialogTitle: string;
  text: string[];
  key: string;
  fetcherData: fetcherData;
}) => {
  const [open, setOpen] = React.useState(false);

  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());

  const [processOutput, setProcessOutput] = React.useState<string[]>([]);
  const [processStatus, setProcessStatus] = React.useState<boolean>(false);
  const [processError, setProcessError] = React.useState<boolean | null>(null);
  const processOutputRef = React.useRef<HTMLDivElement>(null);
  const [progress, setProgress] = React.useState(0);

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleClickOpen = () => {
    setOpen(true);
    setActiveStep(0);
    setProcessOutput([]);
    setProcessStatus(false);
    setProcessError(null);
    setProgress(0);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleStart = async () => {
    handleNext();

    let response;

    if (fetcherData.type === "POST") {
      response = await fetcherPOST(fetcherData.data)(fetcherData.executeUrl);
    } else if (fetcherData.type === "PUT") {
      response = await fetcherPUT(fetcherData.executeUrl);
    } else if (fetcherData.type === "DELETE") {
      response = await fetcherDELETE(fetcherData.executeUrl);
    }
    setProcessStatus(true);
    console.log(response);
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (processStatus) {
      intervalId = setInterval(async () => {
        const response = await fetcherGET(fetcherData.getDataUrl);
        console.log(response);
        setProcessOutput(response.PROCESS.LOGS);
        setProgress(response.PROCESS.PROGRESS);
        setProcessStatus(response.PROCESS.STATUS);
        setProcessError(response.PROCESS.ERROR);
      }, 500);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [processStatus, fetcherData.getDataUrl]);

  useEffect(() => {
    if (processOutputRef.current) {
      processOutputRef.current.scrollTop =
        processOutputRef.current.scrollHeight;
    }
  }, [processOutput]);

  const steps = ["Confirm", "Execute"];

  return (
    <React.Fragment key={key}>
      <Button variant="outlined" onClick={handleClickOpen} sx={sx}>
        {buttonTitle}
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent sx={{ height: "300px" }}>
          <Stepper activeStep={activeStep} sx={{ marginBottom: 2 }}>
            {steps.map((label, index) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: {
                optional?: React.ReactNode;
                error?: boolean;
              } = {};
              if (isStepSkipped(index)) {
                stepProps.completed = false;
              }
              if (index === 1 && processError === true) {
                labelProps.error = true;
              } else if (index === 1 && processError === false && processStatus === false) {
                stepProps.completed = true;
              }
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          <DialogContentText
            sx={{
              border: "1px solid lightgray",
              borderRadius: "10px",
              padding: "10px",
              height: activeStep === 0 ? "85%" : "78%",
            }}
          >
            {activeStep === 0 ? (
              text.map((t) => <p key={t}>{t}</p>)
            ) : (
              <Box
                sx={{ height: "100%", overflow: "auto" }}
                ref={processOutputRef}
              >
                <List>
                  {processOutput ? (
                    processOutput.map((t, index) => (
                      <ListItem key={`${index}-${t}`} disablePadding>
                        <ListItemText primary={t} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem></ListItem>
                  )}
                </List>
              </Box>
            )}
          </DialogContentText>
          {activeStep === 1 && (
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ marginTop: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          {processOutput && processOutput.length > 0 ? (
            <></>
          ) : (
            <Button onClick={handleStart}>Start</Button>
          )}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default ExecuteDialog;
