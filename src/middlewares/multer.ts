import multer from "multer"
import {v4 as uuid} from "uuid"

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); 
// const storage = multer.diskStorage({
//     destination(req, file, callback){
//         callback(null, "uploads")
//     },

//     filename(req, file, callback){

//         const id = uuid()
//         const extName = file.originalname.split(".").pop()
//         const fileName = `${id}.${extName}`
//         callback(null, fileName)
//     }, 
// })


// multer().single("file")

// export const singleUpload = multer({storage}).single("photo")
export const singleUpload = multer().single("photo")
export const multiUpload = multer().array("photos", 5)
