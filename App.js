import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput , Dimensions } from 'react-native';
import UdpSocket from 'react-native-udp';
import { NetworkInfo } from 'react-native-network-info';
export default function App() {
  const [isServer, setIsServer] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [socket, setSocket] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [ipServer, setIpServer] = React.useState('');
  const [text, setText] = React.useState('');
  const { width } = Dimensions.get("window");
  useEffect(() => {
    const fetchIpAddress = async () => {
      const ip = await NetworkInfo.getIPV4Address();
      setIpAddress(ip);
    };

    fetchIpAddress();

    if (isServer) {
      // Configura la aplicación como servidor
      const server = UdpSocket.createSocket('udp4');

      server.on('message', (data, rinfo) => {
        setMensaje(data.toString())
        server.send('Hello from the server ', undefined, undefined, rinfo?.port, rinfo?.address, (error) => {
          if (error) {
            console.log('Error sending the message:', error);
          } else {
            console.log('Response sent');
          }
        });
      });

      server.on('listening', () => {
        console.log('Server listening on port:', server.address().port);
        setConnectionStatus(`Server open on port ${server.address().port}`);
      });

      server.bind(8888);

      setSocket(server);
    } else {
      setConnectionStatus(`Server disconnected`);
      // Configura la aplicación como cliente
      const client = UdpSocket.createSocket('udp4');
      client.bind(8887);
      setSocket(client);
    }

    return () => {
      socket && socket.close();
    };
  }, [isServer]);


  function sendTextFunc(text){ 
    if(!text) return setText(`Hello from the client`)
  setText(text)
};

  const sendMessage = () => {
    if (isServer) return;

    if(!text) setText('Hello from the client');

    const client = socket;

    client.send(text , undefined, undefined, 8888, ipServer, (error) => {
      if (error) {
        console.log('An error occured while sending the message :', error);
      } else {
        console.log('Message sent');
        setText('')
      }
    });
    client.on('message', async (message, remoteInfo) => {
        setMensaje(message.toString());
      });
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{connectionStatus}</Text>
      <Button
        title={isServer ? 'Server' : 'Client'}
        onPress={() => setIsServer(!isServer)}
      />
      <View
      style={{
        width,
      }}
      >
      <TextInput
        onChangeText={text => sendTextFunc(text)}
        value={text}
        style={{
          color:'#767676',
          fontSize:7,
          fontWeight:'bold'
        }}
        placeholderTextColor={"#767676"}
        placeholder='Enter Message to send'
      />
        <Button title="Send Message" onPress={sendMessage} disabled={isServer} />
      </View>
      <TextInput
        onChangeText={setIpServer}
        value={ipServer}
        style={{
          color:'#767676',
          fontSize:7,
          fontWeight:'bold'
        }}
        placeholderTextColor={"#767676"}
        placeholder='Enter Server ip'
      />
      <Text>Client IP: {ipAddress}</Text>
      <Text>Message received: {mensaje}</Text>
    </View>
  );
}