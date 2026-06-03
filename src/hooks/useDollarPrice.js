import { useState, useEffect } from 'react';

const useDollarPrice = () => {
    const [dollarPrice, setDollarPrice] = useState(0);

    useEffect(() => {
        const fetchDollarPrice = async () => {
            try {
                const response = await fetch('https://dolarapi.com/v1/dolares/bolsa');
                if (!response.ok) {
                    throw new Error('Failed to fetch dollar price');
                }
                const data = await response.json();
                setDollarPrice(data.venta);
            } catch (error) {
                console.error('Error fetching dollar price:', error);
            }
        };
        fetchDollarPrice();
    }, []);

    return dollarPrice;
};

export default useDollarPrice;
