const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bodyparser = require("body-parser");
require("dotenv").config();
const errorHandler = require("./utils/errorHandler");
const config = require("./config/appConfig");
const connectDB = require("./db/connection");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const assistantRoutes = require("./routes/assistant.routes");
const adminRoutes = require("./routes/admin.routes");
const fileRoutes = require("./routes/file.routes");
const departmentRoutes = require("./routes/department.routes");
const notificationRoutes = require("./routes/notification.routes");
const app = express();
const corsOptions = {
    origin: ["http://localhost:5174", "http://localhost:5173"],
    credentials: true,
};

connectDB(config.mongodbUri)
    .then(() => {
        console.log("MongoDB connection successfull!");
    })
    .catch((error) => {
        console.log("server service :: connectDB :: error : ", error);
        console.log("MongoDB connection failed!!!!!");
    });

app.use(
    session({
        secret: config.sessionSecret,
        resave: true,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: config.mongodbUri,
            collectionName: "sessions",
        }),
        cookie: { secure: false }, // Set `true` for HTTPS
    })
);

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    console.log("new connection");
    res.send("welcome to document approval system");
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/assistant", assistantRoutes);
app.use("/admin", adminRoutes);
app.use("/file", fileRoutes);
app.use("/department", departmentRoutes);
app.use("/notification", notificationRoutes);

app.use(errorHandler);
const PORT = config.port || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
