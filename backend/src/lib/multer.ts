import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date()

    const year =
      now.getFullYear()

    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, "0")

    const day =
      String(
        now.getDate()
      ).padStart(2, "0")

    const uploadPath = path.join(
      "archive",
      year.toString(),
      month,
      day
    )

    if (
      !fs.existsSync(uploadPath)
    ) {
      fs.mkdirSync(
        uploadPath,
        { recursive: true }
      )
    }

    cb(null, uploadPath)
  },

  filename: (
    req,
    file,
    cb
  ) => {
    const uniqueSuffix =
      Date.now() +
      "-" +
      Math.round(
        Math.random() * 1e9
      )

    cb(
      null,
      uniqueSuffix +
      path.extname(
        file.originalname
      )
    )
  },
})

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
