import { useEffect, useState } from "react";
import menuItemsData from "@/data/menuItems.json";

interface Size {
    size: string;
    price: number;
}

interface MenuItem {
    name: string;
    sizes: Size[];
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
                                    <div className="pr-1">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                                        {item.sizes.length > 1 && <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>}
                                    </div>
                                    <div className="text-right">
                                        {item.sizes.map(({ size, price }) => (
                                            <div key={size} className="whitespace-nowrap font-mono text-sm text-gray-700 dark:text-gray-300">
                                                {size !== "standard" ? <span>{`${size.charAt(0).toUpperCase() + size.slice(1)}: `}</span> : null}
                                                <span>${price.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {item.sizes.length === 1 && <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
