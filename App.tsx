import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CryptoUpdate, MarginPrice } from './components/cryptoUpdate';
import * as React from 'react';
import { AppContext } from './components/utils';
import { IconButton } from 'react-native-paper';

const Stack = createNativeStackNavigator();

export default function App() {
  const ws = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin');
  ws.onopen
  return (
    <AppContext.Provider value={{
      socket: ws,
      message: (callBack:any)=>{
        ws.onmessage = (e:any) => {
          callBack(JSON.parse(e.data));
        }
      },
      connected: (callBack:any)=>{
        ws.onopen = (e:any)=>{
          callBack(e);
        }
      }
    }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name='Crypto' component={CryptoUpdate} />
          <Stack.Screen name='MarginPrice' component={MarginPrice} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}
