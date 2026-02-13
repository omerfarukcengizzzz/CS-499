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

const viewCart = async (req, res) => {
    const token = req.cookies['travlr-token'];

    if (!token) {
        return res.redirect('/login');
    }

    const user = getUserFromToken(token);
    if (!user) {
        return res.redirect('/login');
    }

    try {
        const response = await fetch(`${apiOptions.server}/api/cart/${user.email}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            return res.render('cart', {
                title: 'Shopping Cart - Travlr Getaways',
                cart: { items: [], totalPrice: 0, itemCount: 0 },
                error: 'Error loading cart',
                userName: user.name
            });
        }

        const cart = await response.json();

        res.render('cart', {
            title: 'Shopping Cart - Travlr Getaways',
            cart: cart,
            error: null,
            success: req.query.success,
            userName: user.name
        });
    } catch (err) {
        res.render('cart', {
            title: 'Shopping Cart - Travlr Getaways',
            cart: { items: [], totalPrice: 0, itemCount: 0 },
            error: 'Error loading cart',
            userName: user.name
        });
    }
};

const addToCart = async (req, res) => {
    const token = req.cookies['travlr-token'];

    if (!token) {
        return res.redirect('/login');
    }

    const user = getUserFromToken(token);
    if (!user) {
        return res.redirect('/login');
    }

    const { tripCode, tripName, tripImage, resort, length, pricePerPerson, travelers, travelDate } = req.body;

    try {
        const response = await fetch(`${apiOptions.server}/api/cart/${user.email}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                tripCode,
                tripName,
                tripImage,
                resort,
                length,
                pricePerPerson: parseFloat(pricePerPerson),
                travelers: parseInt(travelers),
                travelDate
            })
        });

        if (!response.ok) {
            return res.redirect('/travel?error=add_to_cart_failed');
        }

        res.redirect('/cart?success=added');
    } catch (err) {
        res.redirect('/travel?error=add_to_cart_failed');
    }
};

const removeFromCart = async (req, res) => {
    const token = req.cookies['travlr-token'];

    if (!token) {
        return res.redirect('/login');
    }

    const user = getUserFromToken(token);
    if (!user) {
        return res.redirect('/login');
    }

    const tripCode = req.params.tripCode;

    try {
        const response = await fetch(`${apiOptions.server}/api/cart/${user.email}/items/${tripCode}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            return res.redirect('/cart?error=remove_failed');
        }

        res.redirect('/cart?success=removed');
    } catch (err) {
        res.redirect('/cart?error=remove_failed');
    }
};

const updateCartItem = async (req, res) => {
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

    try {
        const response = await fetch(`${apiOptions.server}/api/cart/${user.email}/items/${tripCode}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                travelers: parseInt(travelers),
                travelDate
            })
        });

        if (!response.ok) {
            return res.redirect('/cart?error=update_failed');
        }

        res.redirect('/cart?success=updated');
    } catch (err) {
        res.redirect('/cart?error=update_failed');
    }
};

const clearCart = async (req, res) => {
    const token = req.cookies['travlr-token'];

    if (!token) {
        return res.redirect('/login');
    }

    const user = getUserFromToken(token);
    if (!user) {
        return res.redirect('/login');
    }

    try {
        const response = await fetch(`${apiOptions.server}/api/cart/${user.email}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            return res.redirect('/cart?error=clear_failed');
        }

        res.redirect('/cart?success=cleared');
    } catch (err) {
        res.redirect('/cart?error=clear_failed');
    }
};

module.exports = {
    viewCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart
};
