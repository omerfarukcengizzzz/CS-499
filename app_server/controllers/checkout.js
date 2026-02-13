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

const checkoutForm = async (req, res) => {
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
            return res.redirect('/cart?error=checkout_failed');
        }

        const cart = await response.json();

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
    } catch (err) {
        res.redirect('/cart?error=checkout_failed');
    }
};

const processCheckout = async (req, res) => {
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
        try {
            const cartResponse = await fetch(`${apiOptions.server}/api/cart/${user.email}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const cart = await cartResponse.json();

            return res.render('checkout', {
                title: 'Checkout - Travlr Getaways',
                cart: cart,
                userName: user.name,
                userEmail: user.email,
                error: 'Please fill in all required fields',
                success: null
            });
        } catch (err) {
            return res.redirect('/cart?error=checkout_failed');
        }
    }

    try {
        const response = await fetch(`${apiOptions.server}/api/cart/${user.email}/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userName: userName,
                contactPhone: contactPhone,
                specialRequests: specialRequests || ''
            })
        });

        if (!response.ok) {
            const cartResponse = await fetch(`${apiOptions.server}/api/cart/${user.email}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const cart = await cartResponse.json();

            return res.render('checkout', {
                title: 'Checkout - Travlr Getaways',
                cart: cart,
                userName: user.name,
                userEmail: user.email,
                error: 'Checkout failed. Please try again.',
                success: null
            });
        }

        res.redirect('/mybookings?success=checkout');
    } catch (err) {
        res.redirect('/cart?error=checkout_failed');
    }
};

module.exports = {
    checkoutForm,
    processCheckout
};
