import * as React from 'react';
import { View, Text } from 'react-native';
import { Button, DataTable, TextInput } from 'react-native-paper';
import { AppContext, getData, storeData } from './utils';

export function CryptoUpdate(props:any){
    const [prices,setPrices] = React.useState({});
    const [margin,setMargin] = React.useState(0);
    const [loadMargin,setLoadMargin] = React.useState(true);
    const appContext = React.useContext(AppContext);

    React.useEffect(()=>{
        if(loadMargin){
            getData('marginPrice').then((m:any)=>{
                if(m === null){
                    setMargin(0);
                } else {
                    setMargin(m);
                }
                setLoadMargin(false);
            })
        }
    })

    appContext.message((data:any)=>{
        setPrices(data);
    })

    return (
        <View>
            <Button onPress={()=>{
                props.navigation.navigate('MarginPrice');
            }}>Set margin price</Button>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Currency</DataTable.Title>
                    <DataTable.Title numeric>Price</DataTable.Title>
                    <DataTable.Title numeric>Difference</DataTable.Title>
                </DataTable.Header>
                <DataTable.Row>
                    <DataTable.Cell>Bitcoin</DataTable.Cell>
                    <DataTable.Cell numeric>{prices.bitcoin}</DataTable.Cell>
                    <DataTable.Cell numeric>{Math.round(prices.bitcoin - margin)}</DataTable.Cell>
                </DataTable.Row>
            </DataTable>
            <Button onPress={()=>{setLoadMargin(true)}}>Load margin price</Button>
        </View>
    )
}

export function MarginPrice(props:any){
    const [marginPrice,setMarginPrice] = React.useState('');

    const saveMarginPrice = () => {
        storeData('marginPrice',marginPrice).then((response:any)=>{
            props.navigation.navigate('Crypto');
        })
    }
    return (
        <View style={{padding:8}}>
            <TextInput style={{
                marginBottom:4
            }} onChangeText={(value:string)=>{
                setMarginPrice(value);
            }} value={marginPrice} keyboardType='numeric' label={'Margin Price'} />
            <Button onPress={()=>{saveMarginPrice()}}>Save</Button>
        </View>
    )
}