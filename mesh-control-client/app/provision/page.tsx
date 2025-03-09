
import { Box } from "@mui/material";
import ScanElement from "../components/ScanElement";
export default function Home() {
  
  return (
    <main>
      <Box sx={{width: '100%', borderRadius: '10px', alignItems: 'center', display: 'flex', justifyContent: 'center'}}>
        <ScanElement></ScanElement>
      </Box>
    </main>
  );
}
