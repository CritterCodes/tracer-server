import express from 'express';
import ReportsV2Con from '../controllers/reportsV2.controller.js';
import multer from 'multer';

const reportR = express.Router();

// Multer configuration
const fileFilter = (req, file, cb) => {
  const validTypes = [
    'text/csv', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // For .xlsx
  ];

  if (validTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV, XLSX, and XLSM files are allowed.'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Adjust as necessary
  fileFilter: fileFilter
});

reportR.use((req, res, next) => {
  console.log(`Request received for path: ${req.path}`);
  next();
});


// Routes
reportR.post('/organizations/:organizationID',
    upload.fields([
      { name: 'accept.blue', maxCount: 1 },
      { name: 'PAAY', maxCount: 1 },
      { name: 'Rectangle Health', maxCount: 1 },
      { name: 'Hyfin', maxCount: 1 },
      { name: 'Shyft4', maxCount: 1 },
      { name: 'TRX', maxCount: 1 },
      { name: 'Merchant Lynx', maxCount: 1 },
      { name: 'Micamp', maxCount: 1 },
      { name: 'Global', maxCount: 1 },
      { name: 'Clearent', maxCount: 1 },
      { name: 'Payment Advisors', maxCount: 1 },
      { name: 'Fiserv Omaha', maxCount: 1 },
      { name: 'Fiserv Bin & ICA', maxCount: 1 }
    ]),
    ReportsV2Con.createReports
  );
reportR.get('/organizations/:organizationID', ReportsV2Con.getAllReports);
reportR.get('/organizations/:organizationID/:type', ReportsV2Con.getReports);
reportR.post('/organizations/:organizationID/:agentID', ReportsV2Con.buildAgentReport);  // Fixed typo
//reportR.post('/organizations/:organizationID/:agentID', ReportsV2Con.createAgentReport);
reportR.get('/:reportID', ReportsV2Con.getReport);
reportR.delete('/:reportID', ReportsV2Con.deleteReport);
reportR.patch('/:reportID', ReportsV2Con.updateReport);

// Multer error handling middleware
reportR.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Multer error: ${err.message}` });
  } else if (err) {
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
  next();
});

export default reportR;
