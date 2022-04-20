import * as React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { Button, Card, DataTable, Divider, Modal, Portal, TextInput } from 'react-native-paper';
import { AppContext, getData, storeData } from './utils';

export function CryptoUpdate(props:any){
    const [prices,setPrices] = React.useState({});
    const [margin,setMargin] = React.useState({});
    const [loadMargin,setLoadMargin] = React.useState(true);
    const [loading,setLoading] = React.useState(true);
    const appContext = React.useContext(AppContext);

    React.useEffect(()=>{
        let continueRunning = true;

        if(continueRunning) {
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
            setLoading(!Boolean(appContext.socket.readyState));
        }

        return () => {
            continueRunning = false;
        }
    })

    appContext.message((data:any)=>{
        setPrices(data);
    })

    appContext.connected((e:any)=>{
        setLoading(false);
    })

    const detailView = (marginDetail:any,currency:string) => {
        props.navigation.navigate('Detail',{
            'marginPrice':marginDetail,
            'currency':currency
        })
    }

    return (
        <ScrollView
            refreshControl={<RefreshControl refreshing={loading}
            onRefresh={()=>{setLoadMargin(true);}} />}>
            <Button mode='contained' style={{margin:5}} onPress={()=>{
                props.navigation.navigate('MarginPrice');
            }}>Manage Margin Prices</Button>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Currency</DataTable.Title>
                    <DataTable.Title numeric>Margin($)</DataTable.Title>
                    <DataTable.Title numeric>Change($)</DataTable.Title>
                    <DataTable.Title numeric>Rate(%)</DataTable.Title>
                </DataTable.Header>
                {Boolean(margin.bitcoin !== undefined)?(
                    margin.bitcoin.map((mar:any,i)=>(
                        <DataTable.Row key={i} onPress={()=>{detailView(mar,'bitcoin')}}>
                            <DataTable.Cell>Bitcoin</DataTable.Cell>
                            <DataTable.Cell numeric>{mar.price}</DataTable.Cell>
                            <DataTable.Cell numeric>{(prices.bitcoin - mar.price).toFixed(2)}</DataTable.Cell>
                            <DataTable.Cell numeric>{((prices.bitcoin - mar.price)*100/mar.price).toFixed(2)}</DataTable.Cell>
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
    const [newPrice,setNewPrice] = React.useState({
        price:'',
        amount:''
    });
    const [loading,setLoading] = React.useState(true);
    const [loadMargin,setLoadMargin] = React.useState(true);
    const [reload,setReload] = React.useState(false);

    React.useEffect(()=>{
        let continueRunning = true;
        if(continueRunning){
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
        }
        return ()=>{
            continueRunning = false;
        }
    })

    const addMargin = ()=>{
        let mar = marginPrice;
        mar.bitcoin.push(newPrice);
        setMarginPrice(mar);
        setNewPrice({
            price:'',
            amount:''
        });
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
                                    let p = price;
                                    p.price = value;
                                    let m = marginPrice;
                                    m.bitcoin[i] = p;
                                    setMarginPrice(m);
                                }} value={price.price} keyboardType='numeric' label={'Margin Price'} />
                                <TextInput style={{
                                    marginBottom:4
                                }} onChangeText={(value:string)=>{
                                    let p = price;
                                    p.amount = value;
                                    let m = marginPrice;
                                    m.bitcoin[i] = p;
                                    setMarginPrice(m);
                                }} value={price.amount} keyboardType='numeric' label={'Margin Amount'} />
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
                        setNewPrice({
                            price:value,
                            amount:newPrice.amount
                        });
                    }} value={newPrice.price} keyboardType='numeric' label={'New Margin Price'} />
                <TextInput mode='outlined' style={{
                        marginBottom:4
                    }} onChangeText={(value:string)=>{
                        setNewPrice({
                            price:newPrice.price,
                            amount:value
                        });
                    }} value={newPrice.amount} keyboardType='numeric' label={'New Margin Amount'} />
                <Button icon={'plus'} onPress={()=>{addMargin()}}>Add</Button>

                <Button style={{
                    marginTop:10
                }} mode='contained' icon={'database'} onPress={()=>{saveMarginPrice()}}>Save</Button>
            </ScrollView>
        </View>
    )
}

export function Detail(props:any){
    const [prices,setPrices] = React.useState({});
    const [customAmount,setCustomAmount] = React.useState('0');
    const [modalOpen,setModalOpen] = React.useState(false);
    const [loading,setLoading] = React.useState(false);

    const appContext = React.useContext(AppContext);
    let marginPrice = props.route.params.marginPrice;
    let currency = props.route.params.currency;

    appContext.message((data:any)=>{
        setPrices(data);
    })

    return(
        <View>
            <ScrollView
            refreshControl={<RefreshControl refreshing={Boolean(appContext.readyState)} />}>
                <DataTable>
                    <DataTable.Row>
                        <DataTable.Title>Currency</DataTable.Title>
                        <DataTable.Cell numeric>{currency}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Title>Currency Price ($)</DataTable.Title>
                        <DataTable.Cell numeric>{prices[currency]}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Title>Margin Price ($)</DataTable.Title>
                        <DataTable.Cell numeric>{marginPrice.price}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Title>Margin Amount</DataTable.Title>
                        <DataTable.Cell numeric>{marginPrice.amount}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Title>Change ($)</DataTable.Title>
                        <DataTable.Cell numeric>{(prices[currency] - marginPrice.price).toFixed(2)}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Title>Rate (%)</DataTable.Title>
                        <DataTable.Cell numeric>{(((prices[currency] - marginPrice.price)*100)/marginPrice.price).toFixed(2)}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row onPress={()=>{setModalOpen(true)}}>
                        <DataTable.Title>Profit/Loss</DataTable.Title>
                        <DataTable.Cell numeric>{(((prices[currency] - marginPrice.price)/marginPrice.price)*marginPrice.amount).toFixed(2)}</DataTable.Cell>
                    </DataTable.Row>
                </DataTable>
            </ScrollView>
            <Portal>
                <Modal
                    visible={modalOpen}
                    onDismiss={()=>{setModalOpen(false)}}>
                    
                    <Card>
                        <Card.Title title={`Custom Amount Profit: ${(((prices[currency] - marginPrice.price)/marginPrice.price)*customAmount).toFixed(2)}`} />
                        <Card.Content>
                            <TextInput mode='outlined' style={{
                                    marginBottom:4
                                }} onChangeText={(value:any)=>{
                                    setCustomAmount(value);
                                }} value={customAmount} keyboardType='numeric' label={'Custom Amount'} />
                        </Card.Content>
                        <Card.Actions>
                            <Button onPress={()=>{setModalOpen(false)}}>Close</Button>
                        </Card.Actions>
                    </Card>
                </Modal>
            </Portal>
        </View>
    )
}