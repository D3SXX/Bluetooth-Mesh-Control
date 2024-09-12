sudo apt update
sudo apt install git bluez bluez-meshd npm python3 python3-flask-cors python3-requests -y
if [ -d ./Bluetooth-Mesh-Control ]
    then
        echo "Found Bluetooth-Mesh-Control, skipping git clone"
    else
        git clone https://github.com/D3SXX/Bluetooth-Mesh-Control.git
fi
	
cd Bluetooth-Mesh-Control/bluetooth-mesh-client
npm install

echo "Done!"
