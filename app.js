// app.js
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const multer = require('multer');

const app = express();

// MongoDB Atlas Connection Setup
// const mongoURI = 'mongodb+srv://Anthony19:Anthony19@cluster0.9ql9i.mongodb.net/Inventory?retryWrites=true&w=majority&appName=Cluster0';
const mongoURI = 'mongodb+srv://Anthony19:Anthony19@cluster0.9ql9i.mongodb.net/project4?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB Atlas
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Could not connect to MongoDB Atlas:', err));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public/images'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure session storage
app.use(session({
    secret: 'adsadadasdasdadasdadasdas',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://Anthony19:Anthony19@cluster0.9ql9i.mongodb.net/project4?retryWrites=true&w=majority&appName=Cluster0' }),
    cookie: { maxAge: 60 * 60 * 1000 }
}));

app.use(flash());

// Middleware for flash messages 
app.use((req, res, next) => {
    res.locals.user = req.session.user || null; 
    res.locals.successMessages = req.flash('success');
    res.locals.errorMessages = req.flash('error');
    next();
});

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

// Handle file upload and item creation
app.post('/items', upload.single('image'), async (req, res) => {
    try {
        const { addItem } = require('./models/item');

        // Ensure the user is logged in
        if (!req.session.user) {
            req.flash('error', 'You must be logged in to create an item.');
            return res.redirect('/users/login');
        }

        const condition = req.body.condition.trim();

        if (!['New', 'Like New', 'Used', 'Fair', 'Poor'].includes(condition)) {
            return res.status(400).send('Condition must be either New, Like New, Used, Fair, or Poor.');
        }

        const newItem = await addItem({
            title: req.body.title,
            seller: req.session.user, // Use the logged-in user's ID for the seller
            condition,
            price: parseFloat(req.body.price),
            details: req.body.details,
            image: req.file ? req.file.filename : undefined
        });

        res.redirect('/items');
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).send('Error creating item');
    }
});



// Use item routes
app.use('/items', itemRoutes);
app.use('/users', userRoutes);


// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { message: 'Unauthorized to access this resource' });
});

// Error-handling middleware
app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).render('error', {
        error: {
            status: status,
            message: err.message || 'An unexpected error occurred.'
        }
    });
});

// Start server after database connection
const PORT = process.env.PORT || 3000;
const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

mongoose.connection.once('open', startServer);