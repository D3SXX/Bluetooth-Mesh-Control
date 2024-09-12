## Bluetooth Mesh Control

## Description

A web-based interface for the meshctl tool, designed to simplify and visualize Bluetooth mesh network management and control.


### Prerequisites

- A Linux distribution with support for AEAD-AES_CCM encryption
- A Bluetooth adapter (internal or external)
- BlueZ's meshctl tool, installed either via apt or compiled from source

To install meshctl on Debian/Ubuntu, run the following command:

```ruby
sudo apt install bluez bluez-meshd
```

## How to use (DevMode)

#### Initial Setup (Debian/Ubuntu)

1. Clone the repository:

```ruby
git clone https://github.com/D3SXX/Bluetooth-Mesh-Control.git
```

2. Install npm:

```ruby
sudo apt update && sudo apt install npm
```
3. Install client dependencies:

```ruby
cd bluetooth-mesh-client
npm install
cd ..
```

4. Install Python dependencies:

```ruby
sudo apt install python3-yaml python3-flask-cors python3-requests
```

#### Running the Application

After setting up, run the following scripts in separate terminal windows:

Start the client:

```ruby
sh ./start_only_client.sh
```
Start the server (in different terminal):

```ruby
sh ./start_only_server.sh
```

Once both scripts are running, open your web browser and navigate to [IP address]:3000 to access the web app. If you are running the scripts on the same machine, use:

```ruby
localhost:3000
```