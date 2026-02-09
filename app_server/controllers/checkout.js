const request = require('request');
const apiOptions = {
    server: 'http://localhost:3000'
};

function getUserFromToken(token) {
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return {
            email: payload.email,
            name: payload.name
        };
    } catch (e) {
        return null;
    }
}

const checkoutForm = (req, res) => {
    const token = req.cookies['travlr-token'];
    
    if (!token) {
        return res.redirect('/login');
    }

    const user = getUserFromToken(token);
    if (!user) {
        return res.redirect('/login');
    }

    const requestOptions = {
        url: `${apiOptions.server}/api/cart/${user.email}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        json: {}
    };

    request(requestOptions, (err, response, cart) => {
        if (err || response.statusCode !== 200) {
            return res.redirect('/cart?error=checkout_failed');
        }

        if (cart.itemCount === 0) {
            return res.redirect('/cart?error=cart_empty');
        }

        res.render('checkout', {
            title: 'Checkout - Travlr Getaways',
            cart: cart,
            userName: user.name,
            userEmail: user.email,
            error: null,
            success: null
        });
    });
};

const processCheckout = (req, res) => {
    const token = req.cookies['travlr-token'];
    
    if (!token) {
        return res.redirect('/login');
    }

    const user = getUserFromToken(token);
    if (!user) {
        return res.redirect('/login');
    }

    const { userName, contactPhone, specialRequests } = req.body;

    if (!userName || !contactPhone) {
        const cartRequestOptions = {
            url: `${apiOptions.server}/api/cart/${user.email}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            json: {}
        };

        return request(cartRequestOptions, (err, response, cart) => {
            res.render('checkout', {
                title: 'Checkout - Travlr Getaways',
                cart: cart,
                userName: user.name,
                userEmail: user.email,
                error: 'Please fill in all required fields',
                success: null
            });
        });
    }

    const checkoutRequestOptions = {
        url: `${apiOptions.server}/api/cart/${user.email}/checkout`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        json: {
            userName: userName,
            contactPhone: contactPhone,
            specialRequests: specialRequests || ''
        }
    };

    request(checkoutRequestOptions, (err, response, body) => {
        if (err || response.statusCode !== 201) {
            const cartRequestOptions = {
                url: `${apiOptions.server}/api/cart/${user.email}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                json: {}
            };

            return request(cartRequestOptions, (err, response, cart) => {
                res.render('checkout', {
                    title: 'Checkout - Travlr Getaways',
                    cart: cart,
                    userName: user.name,
                    userEmail: user.email,
                    error: 'Checkout failed. Please try again.',
                    success: null
                });
            });
        }

        res.redirect('/mybookings?success=checkout');
    });
};

module.exports = {
    checkoutForm,
    processCheckout
};
