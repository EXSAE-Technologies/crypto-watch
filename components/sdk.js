const apiBaseUrl = "http://192.168.43.144:8000/api";

function fetchRequest(path,config,callBack,errorCallBack){
    fetch(path,config).then((response)=>response.json()).then((response)=>{
        callBack(response);
    }).catch((error)=>{
        if(error.response === undefined){
            errorCallBack({
                success: false,
                message: "Connection failed!",
                data: null
            });
        } else {
            errorCallBack(error.response.data);
        }
    })
}
