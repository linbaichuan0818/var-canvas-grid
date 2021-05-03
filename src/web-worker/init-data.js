function initData(rawData){
    postMessage(rawData)
}
addEventListener('message',(e)=>{
    const data = e.data;
    initData(data)
})
