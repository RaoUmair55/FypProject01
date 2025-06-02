import multer from "multer"

//using disk storage from multer

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp") //folder where file is stored
    },
    filename: function (req, file, cb) {
          cb(null, file.originalname)   //we can aslo add unique name here of file
    }
  })
  
 export const upload = multer({ storage: storage })