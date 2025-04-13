const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve('./public/uploads/'));
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only .jpg, .jpeg, and .png formats are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: fileFilter
});

module.exports = upload;
