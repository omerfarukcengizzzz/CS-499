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

const viewCart = (req, res) => {
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
            return res.render('cart', {
                title: 'Shopping Cart - Travlr Getaways',
                cart: { items: [], totalPrice: 0, itemCount: 0 },
                error: 'Error loading cart',
                userName: user.name
            });
        }

        res.render('cart', {
            title: 'Shopping Cart - Travlr Getaways',
            cart: cart,
            error: null,
            success: req.query.success,
            userName: user.name
        });
    });
};

const addToCart = (req, res) => {
    const token = req.cookies['travlr-token'];
    
    if (!token) {
        return res.redirect('/login');
    }

    const user = getUserFromToken(token);
    if (!user) {
        return res.redirect('/login');
    }

    const { tripCode, tripName, tripImage, resort, length, pricePerPerson, travelers, travelDate } = req.body;

    const requestOptions = {
        url: `${apiOptions.server}/api/cart/${user.email}/items`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        json: {
            tripCode,
            tripName,
            tripImage,
            resort,
            length,
            pricePerPerson: parseFloat(pricePerPerson),
            travelers: parseInt(travelers),
            travelDate
        }
    };

    request(requestOptions, (err, response, body) => {
        if (err || response.statusCode !== 200) {
            return res.redirect('/travel?error=add_to_cart_failed');
        }
        
        res.redirect('/cart?success=added');
    });
};

const removeFromCart = (req, res) => {
    const token = req.cookies['travlr-token'];
    
    if (!token) {
        return res.redirect('/login');
    }

    const user = getUserFromToken(token);
    if (!user) {
        return res.redirect('/login');
    }

    const tripCode = req.params.tripCode;

    const requestOptions = {
        url: `${apiOptions.server}/api/cart/${user.email}/items/${tripCode}`,
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        json: {}
    };

    request(requestOptions, (err, response, body) => {
        if (err || response.statusCode !== 200) {
            return res.redirect('/cart?error=remove_failed');
        }
        
        res.redirect('/cart?success=removed');
    });
};

const updateCartItem = (req, res) => {
    const token = req.cookies['travlr-token'];
    
    if (!token) {
        return res.redirect('/login');
    }

    const user = getUserFromToken(token);
    if (!user) {
        return res.redirect('/login');
    }

    const tripCode = req.params.tripCode;
    const { travelers, travelDate } = req.body;

    const requestOptions = {
        url: `${apiOptions.server}/api/cart/${user.email}/items/${tripCode}`,
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        json: {
            travelers: parseInt(travelers),
            travelDate
        }
    };

    request(requestOptions, (err, response, body) => {
        if (err || response.statusCode !== 200) {
            return res.redirect('/cart?error=update_failed');
        }
        
        res.redirect('/cart?success=updated');
    });
};

const clearCart = (req, res) => {
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
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        json: {}
    };

    request(requestOptions, (err, response, body) => {
        if (err || response.statusCode !== 200) {
            return res.redirect('/cart?error=clear_failed');
        }
        
        res.redirect('/cart?success=cleared');
    });
};

module.exports = {
    viewCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart
};
