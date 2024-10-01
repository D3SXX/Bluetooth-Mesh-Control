echo "Trying to start MeshControl"
echo "Press CTRL+C to close"
cd mesh-control-client
npm run build
node get-ip.js
npm run start