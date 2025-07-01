"use client"
import React from 'react';

import { styled, useTheme, Theme, CSSObject, createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';

import HomeIcon from '@mui/icons-material/Home';
import HubIcon from '@mui/icons-material/Hub';
import BatchPredictionIcon from '@mui/icons-material/BatchPrediction';
import KeyIcon from '@mui/icons-material/Key';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

import EventNoteIcon from '@mui/icons-material/EventNote';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import Stack from '@mui/material/Stack';
import ExecuteDialog from './ExecuteDialog';
import DynamicIcon from './DynamicIcon';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useSWR from 'swr';
import { fetcherDELETE, fetcherGET } from '../utils/fetcher';

import { ServerResponse } from '../../interfaces/global';
import {ServerData} from '../../interfaces/global';
import Button from '@mui/material/Button';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
  });
  
  const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
      width: `calc(${theme.spacing(8)} + 1px)`,
    },
  });
  
  interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
  }

  const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  }));



  const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme }) => ({
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
      variants: [
        {
          props: ({ open }) => open,
          style: {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
          },
        },
        {
          props: ({ open }) => !open,
          style: {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
          },
        },
      ],
    }),
  );
  
  const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
  })<AppBarProps>(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    variants: [
      {
        props: ({ open }) => open,
        style: {
          marginLeft: drawerWidth,
          width: `calc(100% - ${drawerWidth}px)`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      },
    ],
  }));

  const theme = createTheme({
    palette: {
      primary: {
        light: '#0082FC',
        main: '#0082FC',
        dark: '#0082FC',
        contrastText: '#fff',
      }
    },
  });

const SideBar = ({children}: {children: React.ReactNode}) => {

    const [open, setOpen] = React.useState(false);
    const [openLogs, setOpenLogs] = React.useState(false);
  
    const handleDrawerOpen = () => {
      setOpen(true);
    };
  
    const handleDrawerClose = () => {
      setOpen(false);
    };
  
    const { data: logsData, error: logsError, isLoading: logsLoading } = useSWR<ServerData>("/server?query=LOGS", fetcherGET, {
      refreshInterval: 1000,
  });
    const { data, error, isLoading } = useSWR<ServerResponse["config"]>("/config?query=NODES", fetcherGET, {
      refreshInterval: 3000,
  });

    const listItems = [
        {
            text: "Home",
            icon: <HomeIcon />,
            link: "/"
        },
        {
            text: "Provisioning",
            icon: <HubIcon />,
            link: "/provision"
        },
        {
            text: "Nodes",
            icon: <BatchPredictionIcon />,
            link: "/nodes"
        },
        {
            text: "Keys",
            icon: <KeyIcon />,
            link: "/keys"
        },
    ]

    const nodesList = data && data.NODES ? data.NODES.nodes.map((node) => ({
        name: `Node ${node.configuration.elements[0].unicastAddress}`,
        icon: <LightbulbIcon />
    })) : []

    const appBarElements = [
        {
            text: "Discovery",
            iconOn: <BluetoothIcon sx={{color: 'skyblue'}}/>,
            iconOff: <BluetoothIcon sx={{color: 'white'}}/>,
            enableBlink: true,
            apiUrl: "provision",
            query: "SCAN_ACTIVE",
            interval: 1000
        },
        {
            text: "Power",
            iconOn: <PowerSettingsNewIcon sx={{color: 'skyblue'}}/>,
            iconOff: <PowerSettingsNewIcon sx={{color: 'white'}}/>,
            enableBlink: false,
            apiUrl: "controller",
            query: "POWER",
            interval: 1000
        },
        {
            text: "Meshctl",
            iconOn: <PowerSettingsNewIcon sx={{color: 'skyblue'}}/>,
            iconOff: <PowerSettingsNewIcon sx={{color: 'white'}}/>,
            enableBlink: false,
            apiUrl: "meshctl",
            query: "STATUS",
            interval: 1000
        },
    ]

    const pathname = usePathname();


    return (
        <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <AppBar position="fixed" open={open}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={[
                  {
                    marginRight: 5,
                  },
                  open && { display: 'none' },
                ]}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                Mesh Control
              </Typography>
              <Stack direction="row" spacing={2} sx={{marginLeft: 'auto'}}>
                <IconButton id="logs-button" onClick={() => {
                  setOpenLogs(true)
                }}>
                  <EventNoteIcon sx={{color: logsData?.LOGS?.length && logsData?.LOGS?.length > 0 ? 'skyblue' : 'white'}}/>
                </IconButton>
                {appBarElements.map((element, index) => (
                    <DynamicIcon key={index} iconOn={element.iconOn} iconOff={element.iconOff} enableBlink={element.enableBlink} apiUrl={element.apiUrl} query={element.query} interval={element.interval} />
                ))} 
              </Stack>
            </Toolbar>
          </AppBar>
          <Drawer variant="permanent" open={open}>
            <DrawerHeader>
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </DrawerHeader>
            <Divider />
            <List>
              {listItems.map((item, index) => (
                <Link href={item.link} key={item.text}>
                <ListItem disablePadding sx={{ display: 'block', backgroundColor: pathname === item.link ? 'lightgray' : 'transparent' }}>
                  <ListItemButton
                    sx={[
                      {
                        minHeight: 48,
                        px: 2.5,
                      },
                      open
                        ? {
                            justifyContent: 'initial',
                          }
                        : {
                            justifyContent: 'center',
                          },
                    ]}
                  >
                    <ListItemIcon
                      sx={[
                        {
                          minWidth: 0,
                          justifyContent: 'center',
                        },
                        open
                          ? {
                              mr: 3,
                            }
                          : {
                              mr: 'auto',
                            },
                      ]}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={[
                        open
                          ? {
                              opacity: 1,
                            }
                          : {
                              opacity: 0,
                            },
                      ]}
                    />
                  </ListItemButton>
                </ListItem>
                </Link>
              ))}
            </List>
            <Divider />
            <List>
              {nodesList.map((node, index) => (
                <ListItem key={node.name} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    sx={[
                      {
                        minHeight: 48,
                        px: 2.5,
                      },
                      open
                        ? {
                            justifyContent: 'initial',
                          }
                        : {
                            justifyContent: 'center',
                          },
                    ]}
                  >
                    <ListItemIcon
                      sx={[
                        {
                          minWidth: 0,
                          justifyContent: 'center',
                        },
                        open
                          ? {
                              mr: 3,
                            }
                          : {
                              mr: 'auto',
                            },
                      ]}
                    >
                      {node.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={node.name}
                      sx={[
                        open
                          ? {
                              opacity: 1,
                            }
                          : {
                              opacity: 0,
                            },
                      ]}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Drawer>
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <DrawerHeader />
                {children}
          </Box>
        </Box>
        <Dialog fullScreen open={openLogs} onClose={() => setOpenLogs(false)}>
          <DialogTitle>Logs ({logsData?.LOGS.length} items)</DialogTitle>
          <IconButton
          aria-label="close"
          onClick={() => setOpenLogs(false)}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <Button onClick={() => {
          fetcherDELETE("/server?query=LOGS")
        }}>Reset logs</Button>
          <DialogContent> 
            <List>
              {logsData?.LOGS.map((log: string, index: number) => (
                <ListItem key={index}>
                  <Typography>{log}</Typography>
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>
        </ThemeProvider>
      );
};

export default SideBar;