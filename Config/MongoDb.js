import mongoose from "mongoose";


const connectDatabase=(url)=>{
    mongoose.connect(url, {
        useNewUrlParser:true,
        // useCreateIndex:true,
        // useFindAndModify:true,
        useUnifiedTopology:true,
    })
    // .then(()=>console.log("CONNECTED TO DB..."))
    // .catch((err)=>console.log(err))
}
export default connectDatabase

