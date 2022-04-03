const express = require('express');

const authRouter = express();
const admin = require('../firebase');

authRouter.use(express.json());

// This method makes a call to Firebase that will verify the access token attached to the request's cookies
// This method is used to make sure that only users who have appropriate access tokens can access backend routes.
const verifyToken = async (req, res, next) => {
  try {
    const {
      cookies: { accessToken },
    } = req;

    if (!accessToken) {
      return res.status(400).send('@verifyToken no access token');
    }
    const decodedToken = await admin.auth().verifyIdToken(accessToken);
    if (!decodedToken) {
      return res.status(400).send('Empty token from firebase');
    }
    return next();
  } catch (err) {
    return res.status(400).send('@verifyToken no access token');
  }
};

// This method makes a call to firebase that will verify the access token attached to the request's cookies
// This method is used to make sure that only users who have appropriate access tokens can access frontend routes.
authRouter.get('/verifyToken/:accessToken', async (req, res) => {
  try {
    const { accessToken } = req.params;
    const decodedToken = await admin.auth().verifyIdToken(accessToken);
    return res.status(200).send(decodedToken.uid);
  } catch (err) {
    return res.status(400).send('@verifyToken no access token');
  }
});

module.exports = { verifyToken, authRouter };
