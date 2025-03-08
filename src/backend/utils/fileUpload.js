import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // const a = JSON.parse(req.body.data);
    // console.log(a);
    const { branch = 'default', regulation = 'default', batch = 'default', register = 'default' } = req.body;

    // Validate required fields
    if (!branch || !regulation || !batch || !register) {
      return cb(new Error('Missing required fields: branch, regulation, batch, or register'), null);
    }

    // Construct the upload path
    const uploadPath = path.join(
      process.cwd(),
      'uploads',
      branch,
      regulation,
      batch,
      register
    );

    // Create the directory if it doesn't exist
    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      if (err) {
        return cb(new Error('Failed to create upload directory'), null);
      }
      cb(null, uploadPath); // Pass the upload path to multer
    });
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Get the file extension
    const filename = `${req.body.register || 'default'}_${file.fieldname}${ext}`; // Generate a unique filename
    cb(null, filename);
  },
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
  }
};

// Configure multer with storage, file filter, and file size limit
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// Middleware for handling multiple file uploads
export const uploadMiddleware = upload.fields([
  { name: 'passportPhoto', maxCount: 1 }, // Passport photo (1 file)
  { name: 'xMarksheet', maxCount: 1 }, // X Marksheet (1 file)
  { name: 'xiiMarksheet', maxCount: 1 }, // XII Marksheet (1 file)
  { name: 'ugProvisionalCertificate', maxCount: 1 }, // UG Provisional Certificate (1 file)
  { name: 'scorecard', maxCount: 1 }, // Entrance Scorecard (1 file)
  { name: 'certificates', maxCount: 5 }, // Work Experience Certificates (up to 5 files)
]);

// Utility function to get file paths from the request
export const getFilePaths = (req) => {
  const filePaths = {};

  // Define the fields to check for files
  const fields = [
    'passportPhoto',
    'xMarksheet',
    'xiiMarksheet',
    'ugProvisionalCertificate',
    'scorecard',
    'certificates',
  ];

  // Iterate through the fields and extract file paths
  fields.forEach((field) => {
    if (req.files[field]) {
      filePaths[field] = req.files[field].map((file) => file.path);
    }
  });

  return filePaths;
};