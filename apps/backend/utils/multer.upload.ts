import multer, { memoryStorage } from "multer";




export const upload = multer({
    storage:memoryStorage()
})


