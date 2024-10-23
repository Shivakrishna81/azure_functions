export interface ApiInterface{
    status:number,
    headers?:any
    body?:any 
}


export const ApiResponse=(status:any,data:any):ApiInterface=>{
    return {
        status,
        body:JSON.stringify(data)
    }
}