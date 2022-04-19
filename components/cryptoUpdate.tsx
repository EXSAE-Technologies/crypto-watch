import * as React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { Button, Card, DataTable, Divider, TextInput } from 'react-native-paper';
import { AppContext, getData, storeData } from './utils';

export function CryptoUpdate(props:any){
    const [prices,setPrices] = React.useState({});
    const [margin,setMargin] = React.useState({});
    const [loadMargin,setLoadMargin] = React.useState(true);
    const [loading,setLoading] = React.useState(true);
    const appContext = React.useContext(AppContext);

    React.useEffect(()=>{
        if(loadMargin){
            setLoading(true);
            getData('marginPrice').then((m:any)=>{
                if(m === null){
                    setMargin({});
                    setLoading(false);
                } else {
                    setMargin(m);
                    setLoading(false);
                }
                setLoadMargin(false);
            })
        }
    })

    appContext.message((data:any)=>{
        setPrices(data);
    })

    appContext.connected((e:any)=>{
        setLoading(false);
    })

    return (
        <ScrollView
            refreshControl={<RefreshControl refreshing={loading}
            onRefresh={()=>{setLoadMargin(true)}} />}>
            <Button onPress={()=>{
                props.navigation.navigate('MarginPrice');
            }}>Set margin price</Button>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Currency</DataTable.Title>
                    <DataTable.Title numeric>Price($)</DataTable.Title>
                    <DataTable.Title numeric>Margin($)</DataTable.Title>
                    <DataTable.Title numeric>Change($)</DataTable.Title>
                    <DataTable.Title numeric>Rate(%)</DataTable.Title>
                </DataTable.Header>
                {Boolean(margin.bitcoin !== undefined)?(
                    margin.bitcoin.map((mar:any,i)=>(
                        <DataTable.Row key={i}>
                            <DataTable.Cell>Bitcoin</DataTable.Cell>
                            <DataTable.Cell numeric>{prices.bitcoin}</DataTable.Cell>
                            <DataTable.Cell numeric>{mar}</DataTable.Cell>
                            <DataTable.Cell numeric>{(prices.bitcoin - mar).toFixed(2)}</DataTable.Cell>
                            <DataTable.Cell numeric>{((prices.bitcoin - mar)*100/mar).toFixed(2)}</DataTable.Cell>
                        </DataTable.Row>
                    ))
                ):null}
            </DataTable>
        </ScrollView>
    )
}

export function MarginPrice(props:any){
    const initMarginPrice = {
        bitcoin:[]
    }
    const [marginPrice,setMarginPrice] = React.useState(initMarginPrice);
    const [newPrice,setNewPrice] = React.useState('');
    const [loading,setLoading] = React.useState(true);
    const [loadMargin,setLoadMargin] = React.useState(true);
    const [reload,setReload] = React.useState(false);

    React.useEffect(()=>{
        if(reload){
            setReload(false);
        }
        if(loadMargin){
            setLoading(true);
            getData('marginPrice').then((m:any)=>{
                if(m === null){
                    setMarginPrice(initMarginPrice);
                    setLoading(false);
                } else {
                    setMarginPrice(m);
                    setLoading(false);
                }
                setLoadMargin(false);
            })
        }
    })

    const addMargin = ()=>{
        let mar = marginPrice;
        mar.bitcoin.push(newPrice);
        setMarginPrice(mar);
        setNewPrice('');
        setReload(true);
    }

    const deleteMargin = (index:any) => {
        let mar = marginPrice;
        mar.bitcoin.splice(index,1);
        setMarginPrice(mar)
        setReload(true);
    }

    const saveMarginPrice = () => {
        storeData('marginPrice',marginPrice).then((response:any)=>{
            props.navigation.navigate('Crypto');
        })
    }
    return (
        <View style={{padding:8}}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={loading} />}>
                {marginPrice.bitcoin.map((price:any,i)=>(
                    <View key={i}>
                        <Card style={{marginBottom:8}}>
                            <Card.Content>
                                <TextInput style={{
                                    marginBottom:4
                                }} onChangeText={(value:string)=>{
                                    let p = marginPrice;
                                }} value={price} keyboardType='numeric' label={'Margin Price'} />
                            </Card.Content>
                            <Card.Actions>
                                <Button onPress={()=>{deleteMargin(i)}}>Delete</Button>
                            </Card.Actions>
                        </Card>
                        <Divider />
                    </View>
                ))}
                <TextInput mode='outlined' style={{
                    marginBottom:4
                }} onChangeText={(value:string)=>{
                    setNewPrice(value);
                }} value={newPrice} keyboardType='numeric' label={'New Margin Price'} />
                <Button icon={'plus'} onPress={()=>{addMargin()}}>Add</Button>
                <Button style={{
                    marginTop:10
                }} mode='contained' icon={'database'} onPress={()=>{saveMarginPrice()}}>Save</Button>
            </ScrollView>
        </View>
    )
}