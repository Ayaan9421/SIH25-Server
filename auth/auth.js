import admin from "./firebase";

export function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) return res.status(401).send("Unauthorized");

    admin
        .auth()
        .verifyIdToken(token)
        .then((decodedToken) => {
            req.user = decodedToken;
            next();
        })
        .catch((err) => {
            res.status(401).send("Invalid Token");
        });
}

export async function getUserInfo(uid) {
    try {
        const user = await admin.auth().getUser(uid);
        return {
            uid,
            displayName: user.displayName || null,
            email: user.email || null
        };
    } catch (err) {
        console.error("User fetch error:", uid, err);
        return { uid };
    }
}