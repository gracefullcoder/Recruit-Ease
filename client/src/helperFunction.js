import { toast } from "react-toastify";

function toastMessage(data,info=false){
    const {success,message} = data;
    if(success){
        info ? toast.info(message) : toast.success(data.message);
    }else{
        toast.error(message);
    }
}

export {toastMessage};