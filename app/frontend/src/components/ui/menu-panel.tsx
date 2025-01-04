import { useEffect, useState } from "react";
import menuItemsData from "@/data/menuItems.json";

interface MenuItem {
    name: string;
    sizes?: { [key: string]: number };
    price?: number;
    description: string;
}

interface MenuCategory {
    category: string;
    items: MenuItem[];
}

export default function MenuPanel() {
    const [menuItems, setMenuItems] = useState<MenuCategory[]>([]);

    useEffect(() => {
        // Load menu items from JSON file
        setMenuItems(menuItemsData.menuItems as MenuCategory[]);
    }, []);

    return (
        <div className="space-y-8">
            {menuItems.map(category => (
                <div key={category.category}>
                    <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">{category.category}</h3>
                    <div className="space-y-4">
                        {category.items.map(item => (
                            <div key={item.name} className="border-b border-gray-200 pb-2 dark:border-gray-700">
                                <div className="flex items-baseline justify-between">
                                    <div>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                                    </div>
                                    {"sizes" in item ? (
                                        <div className="text-right" style={{ width: "14rem" }}>
                                            {Object.entries(item.sizes!).map(([size, price]) => (
                                                <div key={size} className="font-mono text-sm text-gray-700 dark:text-gray-300">
                                                    {size.charAt(0).toUpperCase() + size.slice(1)}: ${price.toFixed(2)}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">${item.price!.toFixed(2)}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
