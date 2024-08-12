import path from "path"
export default class ChatterUpController{
    //methods
    getView(req,res){
        res.sendFile(path.join(path.resolve(),'src','views','client.html'));
    }
}