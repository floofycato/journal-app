import multer from "multer"
import path from "path"

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/") // Destination folder for storing uploaded file
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // Unique filename
  },
})

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only images are allowed"), false)
  }
}

// Initialize multer instance
const upload = multer({ storage, fileFilter })

export default upload
