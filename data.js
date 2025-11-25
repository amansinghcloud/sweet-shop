// data.js

// Mock product data array
const productsData = [
    { 
        id: 1, 
        name: "Classic Kaju Katli", 
        price: 999, 
        image: "https://www.anandsweets.in/cdn/shop/files/Kaju_Katli_FOP.png?v=1747477294&width=990", 
        category: "kaju",
        description: "The timeless classic cashew barfi, melt-in-your-mouth perfection.",
        isBestseller: true
    },
    { 
        id: 2, 
        name: "Motichoor Laddoo (Pure Ghee)", 
        price: 750, 
        image: "https://www.anandsweets.in/cdn/shop/files/Motichoor_Laddu__FOP.png?v=1741338627&width=990", 
        category: "laddoo",
        description: "Golden motichoor laddoos fried in pure desi ghee.",
        isBestseller: true
    },
    { 
        id: 3, 
        name: "Rose Sandesh", 
        price: 850, 
        image: "https://www.anandsweets.in/cdn/shop/files/Royal_Baklava.jpg?v=1740389626&width=535", 
        category: "bengali",
        description: "Light Bengali sweet made from fresh cottage cheese and rose essence.",
        isBestseller: true
    },
    { 
        id: 4, 
        name: "Pista Barfi", 
        price: 1100, 
        image: "https://cdn.shopify.com/s/files/1/0569/3456/4001/files/AJMER_KALAKAND.png?v=1711432241i", 
        category: "barfi",
        description: "Rich barfi loaded with chopped pistachios and cardamom.",
        isBestseller: true
    },
    { 
        id: 5, 
        name: "Assorted Festive Hamper", 
        price: 2500, 
        image: "https://www.anandsweets.in/cdn/shop/files/ASSORTED_SWEETS_giftboxes.png?v=1712039312&width=720", 
        category: "gifting",
        description: "A premium collection of 6 signature sweets and dry fruits.",
        isBestseller: false
    },
    { 
        id: 6, 
        name: "Almond Peda", 
        price: 890, 
        image: "https://www.anandsweets.in/cdn/shop/files/JaggeryMysorePak_FOP_1.png?v=1736746687&width=990", 
        category: "barfi",
        description: "Soft peda infused with almond paste and saffron.",
        isBestseller: false
    },
    // Add more products here to populate the shop.html page
    { 
        id: 7, 
        name: "Dry Fruit Box", 
        price: 1400, 
        image: "https://www.anandsweets.in/cdn/shop/files/DryFruitLaddu.png?v=1713438907&width=535", 
        category: "dryfruit",
        description: "Selection of premium cashews, almonds, and raisins.",
        isBestseller: false
    },
    { 
        id: 8, 
        name: "Besan Laddoo", 
        price: 650, 
        image: "https://www.anandsweets.in/cdn/shop/files/Laddu_f08f1645-4330-4433-a58c-a1acefe0357e.png?v=1741338627&width=990", 
        category: "laddoo",
        description: "Traditional besan laddoos, roasted to perfection.",
        isBestseller: false
    },
];

// Function to generate HTML for a single product card
function createProductCard(product) {
    return `
        <div class="product-card" data-id="${product.id}" data-category="${product.category}">
            <div class="product-image-box">
                <img src="${product.image}" alt="${product.name}">
                ${product.isBestseller ? '<span class="badge">Bestseller</span>' : ''}
            </div>
            <div class="product-details">
                <h4 class="product-name">${product.name}</h4>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <span class="product-price">₹${product.price}</span>
                    <button class="btn btn-primary btn-add-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
}