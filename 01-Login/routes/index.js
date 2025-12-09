var router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Auth0 Webapp sample Nodejs',
    isAuthenticated: req.oidc.isAuthenticated()
  });
});

router.get('/profile', requiresAuth(), function (req, res, next) {
  res.render('profile', {
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'Profile page'
  });
});

stepUpAuthenticationRequired = async function (req, res, next) {
  try {
    console.log(`stepUpAuthenticationRequired ${JSON.stringify(req.oidc.user)}`);
    const claims = req.oidc.idTokenClaims;
    console.log(claims);
    // Check if the request has been authenticated with MFA already. 
    // If not, trigger a login with a request to trigger an MFA flow.
    // The Post-Login action will intercept this request, see that an MFA flow is requested
    // and then execute it. Upon success the ID token will be updated with the requests
    // new authentication level. 
    const isStepUp = claims.amr && claims.amr.includes('mfa');
     console.log(isStepUp);
     if (isStepUp) {
      next();
     } else {
      res.oidc.login({
        returnTo: '/protected',
        authorizationParams: {
          returnTo: 'https://localhost/callback',
          acr_values: "http://schemas.openid.net/pape/policies/2007/06/multi-factor"
        },
      })
     }
  } catch (e) {
    console.log(e);
    next(e);
  }
}

router.get('/protected', requiresAuth(), stepUpAuthenticationRequired, async function (req, res, next) {
  let { isExpired } = req.oidc.accessToken;

  if(isExpired()) {
    await req.oidc.accessToken.refresh();
  }
  
  res.render('protected', {
    accessToken: JSON.stringify(req.oidc.accessToken, null, 2),
    title: 'Profile page'
  });
});

module.exports = router;
