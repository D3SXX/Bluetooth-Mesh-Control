import React from 'react'
import KeysElement from '../components/KeysElement';
import { Box } from '@mui/material';


const KeysPage = () => {

  return (
    <Box sx={{width: '100%', borderRadius: '10px', alignItems: 'center', display: 'flex', justifyContent: 'center'}}>
    <KeysElement></KeysElement>
    </Box>
  )
}

export default KeysPage