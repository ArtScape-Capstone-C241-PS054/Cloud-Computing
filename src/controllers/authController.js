const admin = require('firebase-admin');
const firestore = require('../config/firestore');

// Function to handle Google authentication and user login/register
exports.authWithGoogle = async (req, res) => {
    const idToken = req.body.idToken;
    const { name, address, description, interest, phoneNumber } = req.body;

    try {
        // Verify ID token from Google
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, picture, uid } = decodedToken;

        // Reference to the user document in Firestore using UID as the ID
        const userRef = firestore.collection('User').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            // If the user is new, check for missing fields
            let missingFields = [];
            if (!name) missingFields.push('name');
            if (!address) missingFields.push('address');
            if (!description) missingFields.push('description');
            if (!interest) missingFields.push('interest');

            if (missingFields.length > 0) {
                res.status(400).send({ error: `Additional data required for new users: ${missingFields.join(', ')}` });
                return;
            }

            // Validate phone number format if provided
            if (phoneNumber && phoneNumber.trim() !== '') {
                const phoneNumberRegex = /^\+\d{1,3}\d{7,}$/;
                if (!phoneNumberRegex.test(phoneNumber)) {
                    res.status(400).send({ error: 'Invalid phone number format. Include country code, e.g., +62' });
                    return;
                }
            }

            // Save new user data with UID as the document ID
            await userRef.set({
                id: uid,
                email,
                name,
                address,
                picture,
                description,
                interest,
                phoneNumber: phoneNumber || null, // Set phoneNumber to null if not provided
                lastLogin: admin.firestore.FieldValue.serverTimestamp()
            });

            res.status(201).send({ message: 'User registered successfully', uid });
        } else {
            // If the user already exists, update the last login timestamp
            await userRef.update({
                lastLogin: admin.firestore.FieldValue.serverTimestamp()
            });

            res.status(200).send({ message: 'User login successful', uid });
        }
    } catch (error) {
        res.status(401).send({ error: 'Unauthorized', details: error.message });
    }
};
