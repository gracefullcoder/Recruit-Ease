import { toast } from "react-toastify";

function toastMessage(data,info=false){
    const {success,message} = data;
    if(success){
        info ? toast.info(message,{position:"top-left"}) : toast.success(data.message,{position:"top-left"});
    }else{
        toast.error(message,{position:"top-left"});
    }
}

export {toastMessage};