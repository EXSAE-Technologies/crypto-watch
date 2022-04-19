import AsyncStorage from '@react-native-async-storage/async-storage';
import * as React from 'react';

export const storeData = async (key:string, value:string) => {
    return await AsyncStorage.setItem(key,JSON.stringify(value));
}
export const getData = async (key:string) => {
    const item = await AsyncStorage.getItem(key);
    return JSON.parse(item);
}

export const AppContext = React.createContext({});