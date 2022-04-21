import { NavigationContainer, DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CryptoUpdate, Detail, MarginPrice } from './components/cryptoUpdate';
import * as React from 'react';
import { AppContext } from './components/utils';
import { DefaultTheme, IconButton, Provider } from 'react-native-paper';

const Stack = createNativeStackNavigator();
const theme = {
  ...DefaultTheme,
  ...NavDefaultTheme,
  roundness:8,
  colors: {
    ...DefaultTheme.colors,
    ...NavDefaultTheme.colors,
    primary:'#005694',
  }
}

export default function App() {
  const [ws,setWs] = React.useState(new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin'));
  return (
    <Provider theme={theme}>
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
      },
      reconnect: ()=>{
        setWs(new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin'));
      }
    }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{
          headerRight: () => (<IconButton icon='refresh' onPress={()=>{setWs(new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin'))}} />)
        }}>
          <Stack.Screen name='Crypto' component={CryptoUpdate} />
          <Stack.Screen name='MarginPrice' component={MarginPrice} />
          <Stack.Screen name='Detail' component={Detail} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
    </Provider>
  );
}
