const generatedMessage = (text)=>{
    return {
        text,
        createdAt: new Date().getTime()
    }
}

const generatedLocationMessage = (url)=>{
    return {
        url,
        createdAt: new Date().getTime()
    }
}

module.exports={
    generatedMessage,generatedLocationMessage
}