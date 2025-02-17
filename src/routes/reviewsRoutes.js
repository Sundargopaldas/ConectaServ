const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const reviewsController = require('../controllers/reviewsController');

// Configuração do multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/img/reviews');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(null, false);
};

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 5
    },
    fileFilter: fileFilter
}).array('photos', 5);

// Middleware para tratar erros do multer
const handleUpload = (req, res, next) => {
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Arquivo muito grande. Tamanho máximo: 5MB' });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({ error: 'Número máximo de arquivos excedido' });
            }
            return res.status(400).json({ error: 'Erro no upload do arquivo' });
        } else if (err) {
            return res.status(500).json({ error: 'Erro ao processar upload' });
        }
        next();
    });
};

// Rotas
router.get('/', reviewsController.getReviews);

router.post('/', 
    handleUpload,  // Removido auth.checkAuth
    reviewsController.createReview
);

module.exports = router;