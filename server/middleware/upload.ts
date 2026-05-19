import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadPdf = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
}).single('file');

const EXCEL_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

export const uploadExcel = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (EXCEL_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('file');
