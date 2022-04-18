import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CryptoUpdate, MarginPrice } from './components/cryptoUpdate';
import * as React from 'react';
import { AppContext } from './components/utils';

const Stack = createNativeStackNavigator();

export default function App() {
  const ws = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin')
  return (
    <AppContext.Provider value={{
      socket: ws,
      message: (callBack:any)=>{
        ws.onmessage = (e:any) => {
          callBack(JSON.parse(e.data));
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
