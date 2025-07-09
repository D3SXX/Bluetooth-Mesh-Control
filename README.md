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

## How to use

#### To build & run

1. Clone the repository:

```ruby
git clone https://github.com/D3SXX/Bluetooth-Mesh-Control.git
```

2. Install [Node.js](https://nodejs.org/en/download)

3. Install dependencies:

```ruby
npm install
```

4. Build:

```ruby
npm run build
```

4. Run:

```ruby
npm run start
```

### To run in dev mode

1. Run:

```ruby
npm run dev
```

2. Once the app is running, open your web browser and navigate to [IP address]:3000 to access the web app. If you are running the scripts on the same machine, use:

```ruby
localhost:3000
```