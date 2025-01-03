const menuItems = [
    {
        category: 'Coffee',
        items: [
            {
                name: 'Espresso',
                sizes: { single: 1.0, double: 2.0 },
                description: 'Rich and bold single or double shot',
            },
            {
                name: 'Americano',
                sizes: { small: 2.5, medium: 4.0, large: 5.0 },
                description: 'Espresso with hot water',
            },
            {
                name: 'Cappuccino',
                sizes: { small: 3.5, medium: 4.5, large: 5.5 },
                description: 'Espresso with steamed milk and foam',
            },
            {
                name: 'Latte',
                sizes: { small: 3.5, medium: 4.5, large: 5.5 },
                description: 'Espresso with steamed milk',
            },
            {
                name: 'Mocha',
                sizes: { small: 4.0, medium: 5.0, large: 6.0 },
                description: 'Espresso with chocolate and steamed milk',
            },
        ],
    },
    {
        category: 'Specialty Drinks',
        items: [
            {
                name: 'Intermezzo Cappuccino',
                sizes: { small: 4.5, medium: 5.9, large: 7.0 },
                description: 'Cappuccino with cinnamon and cocoa',
            },
            {
                name: 'Caramel Macchiato',
                sizes: { small: 4.5, medium: 5.5, large: 6.5 },
                description: 'Vanilla and caramel with steamed milk and espresso',
            },
            {
                name: 'Vanilla Latte',
                sizes: { small: 4.5, medium: 5.9, large: 7.0 },
                description: 'Latte with vanilla syrup',
            },
        ],
    },
    {
        category: 'Extras',
        items: [
            {
                name: 'Extra Shot',
                price: 1.0,
                description: 'Add an extra shot of espresso',
            },
            {
                name: 'Flavor Shot',
                price: 0.75,
                description: 'Add vanilla, caramel, or hazelnut',
            },
            {
                name: 'Whipped Cream',
                price: 0.5,
                description: 'Add whipped cream topping',
            },
        ],
    },
];

export function MenuPanel() {
    return (
        <div className="space-y-8">
            {menuItems.map((category) => (
                <div key={category.category}>
                    <h3 className="font-semibold mb-4">{category.category}</h3>
                    <div className="space-y-4">
                        {category.items.map((item) => (
                            <div key={item.name} className="border-b pb-2">
                                <div className="flex justify-between items-baseline">
                                    <span className="font-medium">{item.name}</span>
                                    {item.sizes ? (
                                        <div className="text-right">
                                            {Object.entries(item.sizes).map(([size, price]) => (
                                                <div key={size} className="font-mono">
                                                    {size.charAt(0).toUpperCase() + size.slice(1)}:
                                                    ${price.toFixed(2)}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="font-mono">${item.price.toFixed(2)}</span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
