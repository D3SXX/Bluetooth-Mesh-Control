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

##### Quick install by using script (recommended)

```ruby
curl -fsSL https://raw.githubusercontent.com/D3SXX/Bluetooth-Mesh-Control/refs/heads/main/quick_setup.sh | bash
```

##### Manual installation

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

After setting up/updating the application, always run:

```ruby
sh ./run_after_update_or_first_install.sh
```

To start the application, run:

```ruby
sh ./start_mesh_control.sh
```
Once the script is running, open your web browser and navigate to [IP address]:3000 to access the web app. If you are running the scripts on the same machine, use:

```ruby
localhost:3000
```